require('dotenv').config({ quiet: true });
const { GoogleGenAI } = require('@google/genai');

// 1. تهيئة حزمة Google Gen AI بمفتاح API
const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.warn('⚠️ تنبيه: لم يتم العثور على GEMINI_API_KEY في ملف .env');
}

const ai = new GoogleGenAI({ apiKey: apiKey || '' });

// 2. اعتماد الموديل الرسمي المعتمد حصراً
const MODEL_NAME = process.env.GEMINI_MODEL || 'gemini-3.6-flash';

// دالة تأخير زمني بالمللي ثانية
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * دالة تحليل المعاملة المالية وتوليد القيد المحاسبي المزدوج مع دعم إعادة المحاولة
 */
async function generateJournalEntry(transactionDescription, chartOfAccounts = [], retries = 2) {
  const systemInstruction = `
أنت محاسب قانوني خبير ومساعد متقدم لترجمة المعاملات والعمليات المالية إلى قيود محاسبية مزدوجة دقيقة.

المطلوب منك:
1. تحليل النص المعطى وفهم المبالغ والأطراف وتواريخ الاستحقاق.
2. استخدام الحسابات المناسبة من "دليل الحسابات المتاح" فقط.
3. التأكد المطلق من توازن القيد المحاسبي (مجموع المدين = مجموع الدائن).
4. إرجاع النتيجة حصراً بصيغة JSON بالنظام التالي وبدون أي مقدمات أو شروحات إضافية:

{
  "summary": "وصف مختصر وشامل للعملية المالية والقيد",
  "entries": [
    {
      "account_code": "كود الحساب المستخرج من الدليل",
      "account_name": "اسم الحساب المستخرج من الدليل",
      "debit": 0,
      "credit": 0
    }
  ]
}
`;

  const prompt = `
دليل الحسابات المتاح للمشروع:
${JSON.stringify(chartOfAccounts, null, 2)}

المعاملة المالية المطلوب تحليلها واستخراج قيدها المحاسبي:
"${transactionDescription}"
`;

  for (let attempt = 1; attempt <= retries + 1; attempt++) {
    try {
      const response = await ai.models.generateContent({
        model: MODEL_NAME,
        contents: [
          { role: 'user', parts: [{ text: systemInstruction + '\n' + prompt }] }
        ],
        config: {
          responseMimeType: 'application/json'
        }
      });

      const parsedData = JSON.parse(response.text);

      // التقييم والتحقق المحاسبي المزدوج
      const evaluation = evaluateEntryBalance(parsedData.entries);

      return {
        success: evaluation.isValid,
        data: parsedData,
        evaluation: evaluation,
        modelUsed: MODEL_NAME
      };

    } catch (error) {
      // إذا كان الخطأ بسبب الضغط الزائد (503) وهناك محاولات متبقية، ننتظر 3 ثوانٍ ونعيد المحاولة
      if (error.message.includes('503') && attempt <= retries) {
        console.warn(`⏳ ضغط مؤقت على الخادم (503)، جاري إعادة المحاولة تلقائياً (${attempt}/${retries})...`);
        await sleep(3000);
      } else if (attempt > retries) {
        console.error('❌ خطأ في معالجة الموديل:', error.message);
        return {
          success: false,
          error: error.message
        };
      }
    }
  }
}

/**
 * دالة التحقق الرياضي من توازن القيد (إجمالي المدين = إجمالي الدائن)
 */
function evaluateEntryBalance(entries = []) {
  const totalDebit = entries.reduce((sum, item) => sum + Number(item.debit || 0), 0);
  const totalCredit = entries.reduce((sum, item) => sum + Number(item.credit || 0), 0);
  const isBalanced = Math.abs(totalDebit - totalCredit) < 0.001;

  return {
    isValid: isBalanced,
    totalDebit,
    totalCredit,
    difference: Math.abs(totalDebit - totalCredit),
    message: isBalanced 
      ? '✅ القيد المحاسبي متوازن تماماً' 
      : `❌ القيد غير متوازن! الفرق: ${Math.abs(totalDebit - totalCredit)}`
  };
}

module.exports = {
  generateJournalEntry,
  evaluateEntryBalance
};