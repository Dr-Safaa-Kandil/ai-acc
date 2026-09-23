// accountingCore.js
require('dotenv').config({ quiet: true });
const { GoogleGenAI } = require('@google/genai');
const { createClient } = require('@supabase/supabase-js');

// 1. تهيئة عملاء Supabase و Gemini
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY
);
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function processAndSaveTransaction(transactionText, date) {
  try {
    // 2. جلب دليل الحسابات من Supabase
    const { data: accs } = await supabase
      .from('chart_of_accounts')
      .select('account_code, account_name_ar');

    const chartText = accs?.length 
      ? accs.map(a => `- ${a.account_code}: ${a.account_name_ar}`).join('\n') 
      : `- 1101: النقدية\n- 1201: الأصول الثابتة\n- 1301: الأصول الرقمية\n- 3101: رأس المال`;

    // 3. تجهيز مطالبة Gemini
    const prompt = `أنت محاسب قانوني خبير. قم بتحليل المعاملة المالية التالية واستخراج قيد اليومية المزدوج المناسب لها اعتماداً على دليل الحسابات المرفق.

تاريخ المعاملة: ${date}
نص المعاملة: "${transactionText}"

دليل الحسابات المتاح:
${chartText}

المطلوب: إرجاع النتيجة بصيغة JSON نقي فقط بالهيكل التالي:
{
  "summary": "شرح مختصر للقيد",
  "entries": [
    { "accountCode": "رقم الحساب", "accountName": "اسم الحساب", "debit": 0, "credit": 0 }
  ]
}`;

    // 4. مصفوفة التبديل الذكي معتمدة بالكامل على القائمة المتاحة بحسابك (بدءاً بـ Lite الأسرع والأعلى سعة)
    const modelMatrix = [
      process.env.GEMINI_MODEL,    // الموديول المحدد في .env (gemini-3.5-flash-lite)
      'gemini-3.5-flash-lite',     // النموذج المفضل ذو السعة العالية (1500 طلب/يوم)
      'gemini-2.5-flash-lite',     // البديل الخفيف والمستقر
      'gemini-3.5-flash',          // البديل القياسي
      'gemini-2.5-flash'           // الاحتياطي الأخير
    ].filter(Boolean);             // إزالة أي قيم فارغة

    let responseText = '', usedModel = '', errorLogs = [];

    // 5. التبديل التلقائي بين النماذج
    for (const modelName of [...new Set(modelMatrix)]) {
      try {
        const response = await ai.models.generateContent({
          model: modelName,
          contents: prompt,
          config: { responseMimeType: 'application/json' }
        });

        if (response && response.text) {
          responseText = response.text;
          usedModel = modelName;
          break;
        }
      } catch (err) {
        const errMsg = err.message || JSON.stringify(err);
        errorLogs.push(`[${modelName}]: ${errMsg}`);
        console.warn(`⚠️ تعذر الاتصال بـ (${modelName})، جاري التبديل للبديل التالي...`);
      }
    }

    if (!responseText) {
      throw new Error(`فشلت جميع الموديولات المتاحة. الأسباب:\n${errorLogs.join('\n')}`);
    }

    const parsed = JSON.parse(responseText);
    const totalDebit = parsed.entries.reduce((s, i) => s + Number(i.debit || 0), 0);
    const totalCredit = parsed.entries.reduce((s, i) => s + Number(i.credit || 0), 0);

    if (Math.abs(totalDebit - totalCredit) >= 0.01) {
      return { success: false, error: `القيد غير متوازن! (مدين: ${totalDebit} - دائن: ${totalCredit})` };
    }

    // 6. حفظ القيد الرئيسي في journal_entries
    const refNum = `JV-${Date.now().toString().slice(-6)}`;
    const { data: savedEntry, error: err1 } = await supabase
      .from('journal_entries')
      .insert([{
        reference_number: refNum,
        entry_date: date,
        description: parsed.summary,
        total_debit: totalDebit,
        total_credit: totalCredit,
        status: 'posted'
      }])
      .select()
      .single();

    if (err1) throw new Error(`فشل حفظ القيد الرئيسي: ${err1.message}`);

    // 7. حفظ بنود القيد في journal_entry_lines
    const items = parsed.entries.map(i => ({
      journal_entry_id: savedEntry.id,
      account_code: i.accountCode,
      account_name: i.accountName,
      debit: i.debit,
      credit: i.credit
    }));

    const { error: err2 } = await supabase
      .from('journal_entry_lines')
      .insert(items);

    if (err2) throw new Error(`فشل حفظ البنود: ${err2.message}`);

    return {
      success: true,
      referenceNumber: refNum,
      summary: parsed.summary,
      entries: parsed.entries,
      evaluation: { message: `محفوظ بنجاح عبر الموديول (${usedModel})` }
    };

  } catch (err) {
    return { success: false, error: err.message || JSON.stringify(err) };
  }
}

module.exports = { processAndSaveTransaction };