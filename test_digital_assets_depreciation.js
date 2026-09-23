require('dotenv').config();
const { generateJournalEntry } = require('./modelManager');

// دليل حسابات مخصص يشمل حسابات الأصول والمخصصات والمصروفات
const mockChartOfAccounts = [
  { account_code: '112000', account_name_ar: 'الأصول الرقمية والمعنوية', account_type: 'Asset' },
  { account_code: '112900', account_name_ar: 'مجمع استهلاك وتطوير الأصول الرقمية', account_type: 'Asset_Contra' },
  { account_code: '512000', account_name_ar: 'مصروف مخصص استهلاك الأصول الرقمية الشهري', account_type: 'Expense' },
  { account_code: '211000', account_name_ar: 'رأس المال المباشر', account_type: 'Equity' }
];

async function runDepreciationTest() {
  console.log('🚀 جاري إرسال عملية قيد المخصص الشهري يوم 15 إلى محرك الذكاء الاصطناعي...\n');

  // وصف المعاملة المالية الدورية في منتصف الشهر
  const transactionText = `
  تاريخ الاستحقاق الدائم: 15 من الشهر (تاريخ اليوم المفترض: 15/10/2026).
  المطلوب: تسجيل القيد المحاسبي الدوري الشهري لمخصص استهلاك وتطوير الأصول الرقمية لنشاط "بطل ستوريز".
  
  معطيات العملية:
  - إجمالي رأس مال المشروع: 1,000,000 جنيه مصري.
  - قيمة المخصص الشهري المحسوبة: 1% من رأس المال (تساوي 10,000 جنيه مصري شهرياً).
  - يتم استحقاق وتسجيل القيد يوم 15 من كل شهر لضمان كفاية الإيرادات الدورية.
  
  التوجيه المحاسبي:
  - تحميل المبلغ على حساب مصروف مخصص استهلاك الأصول الرقمية (طرف مدين).
  - إقفال المبلغ في حساب مجمع استهلاك وتطوير الأصول الرقمية (طرف دائن).
  `;

  const result = await generateJournalEntry(transactionText, mockChartOfAccounts);

  if (result.success) {
    console.log(`✅ تم توليد قيد المخصص الدوري بنجاح باستخدام [ ${result.modelUsed} ]!\n`);
    console.log('📝 وصف القيد:', result.data.summary);
    console.table(result.data.entries);
    console.log('\n📊 نتيجة التقييم المحاسبي:');
    console.log(`  - إجمالي المدين: ${result.evaluation.totalDebit.toLocaleString()} ج.م`);
    console.log(`  - إجمالي الدائن: ${result.evaluation.totalCredit.toLocaleString()} ج.م`);
    console.log(`  - حالة التوازن: ${result.evaluation.message}`);
  } else {
    console.error('❌ فشل في إنشاء القيد:', result.error);
  }
}

runDepreciationTest();