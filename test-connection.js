import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('❌ خطأ: يرجى التحقق من متغيرات البيئة في ملف .env');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

/**
 * خريطة هيكل الجدول الحسابي (Mapping by Column Index / Letter)
 * تطابق تماماً ترتيب الأعمدة في ملف ai-acc-as-italian-journal لضمان توافق GAS وقاعدة البيانات
 */
const JOURNAL_COLUMN_MAP = {
  col_1_order_code: 1,      // كود الأوردر (A)
  col_2_customer_info: 2,   // بيان العميل والعنوان (B)
  col_3_total_amount: 3,    // إجمالي المبلغ (C)
  col_4_paid_amount: 4,     // المبلغ المدفوع (D)
  col_5_remaining_cod: 5,   // المتبقي COD (E)
  col_6_transaction_date: 6,// تاريخ اليوم / التسجيل (F)
  col_7_entry_number: 7,    // رقم القيد (G)
  col_8_account_code: 8,    // كود الحساب (H)
  col_9_account_name: 9,    // اسم الحساب (I)
  col_10_debit: 10,         // مدين (J)
  col_11_credit: 11,        // دائن (K)
  col_12_notes: 12          // ملاحظات ومعايير IFRS (L)
};

async function testConnectionWithColumnMapping() {
  console.log('--- 🔄 فحص الاتصال وقراءة الهيكل بناءً على مؤشرات الأعمدة الرقمية ---');
  
  try {
    // 1. جلب السجلات للتحقق من الاستجابة
    const { data, error } = await supabase
      .from('italian_journal')
      .select('*')
      .limit(3);

    if (error) {
      console.error('❌ خطأ في الاستعلام:', error.message);
      return;
    }

    console.log('✅ تم الاتصال بنجاح. عينة البيانات المعالجة باستخدام خريطة الأعمدة:');
    
    // محاكاة معالجة الصفوف بناءً على ترتيب الأعمدة المعياري لتفادي أخطاء الأسماء العربية
    data.forEach((row, index) => {
      console.log(`\n--- صف رقم ${index + 1} ---`);
      // ملاحظة: في حال كانت قاعدة البيانات تعيد المفاتيح بأسماء الأعمدة الفعليّة أو الفهارس
      console.log(`📌 رقم القيد (العمود 7): ${row.entry_number || row['رقم القيد'] || 'غير متاح'}`);
      console.log(`📌 كود الحساب (العمود 8): ${row.account_code || row['كود الحساب'] || 'غير متاح'}`);
      console.log(`📌 مدين (العمود 10): ${row.debit || row['مدين'] || 0}`);
      console.log(`📌 دائن (العمود 11): ${row.credit || row['دائن'] || 0}`);
    });

  } catch (err) {
    console.error('❌ حدث خطأ غير متوقع:', err.message);
  }
}

testConnectionWithColumnMapping();