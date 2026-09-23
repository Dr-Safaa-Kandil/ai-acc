require('dotenv').config({ quiet: true });
const { generateJournalEntry } = require('./modelManager');

// دليل حسابات افتراضي ونموذجي لنشاط بطل ستوريز
const mockChartOfAccounts = [
  { account_code: '111000', account_name_ar: 'الأصول الثابتة', account_type: 'Asset' },
  { account_code: '112000', account_name_ar: 'الأصول الرقمية والمعنوية', account_type: 'Asset' },
  { account_code: '121000', account_name_ar: 'البنك - نقدية وما في حكمها', account_type: 'Asset' },
  { account_code: '211000', account_name_ar: 'رأس المال المباشر', account_type: 'Equity' }
];

async function runTest() {
  console.log('🚀 جاري إرسال المعاملة المالية إلى محرك الذكاء الاصطناعي...\n');

  // وصف القيد الافتتاحي المرجعي
  const transactionText = `
  في تاريخ 15/09/2026، تم تأسيس نشاط "بطل ستوريز" بقيد افتتاحي ورأس مال إجمالي قدره 1,000,000 جنيه مصري.
  تم توزيع رأس المال كالتالي:
  - 500,000 جنيه نقدية تم إيداعها في حساب البنك.
  - 300,000 جنيه أصول رقمية تم اقتناؤها.
  - 200,000 جنيه أصول ثابتة.
  `;

  const result = await generateJournalEntry(transactionText, mockChartOfAccounts);

  if (result.success) {
    console.log(`✅ تم توليد القيد المحاسبي بنجاح باستخدام الموديل: [ ${result.modelUsed} ]\n`);
    console.log('📝 وصف القيد:', result.data.summary);
    console.table(result.data.entries);
    console.log('\n📊 نتيجة التقييم المحاسبي:');
    console.log(`  - إجمالي المدين: ${result.evaluation.totalDebit.toLocaleString()} ج.م`);
    console.log(`  - إجمالي الدائن: ${result.evaluation.totalCredit.toLocaleString()} ج.م`);
    console.log(`  - حالة التوازن: ${result.evaluation.message}`);
  } else {
    console.error('❌ فشل في إنشاء القيد المحاسبي:', result.error);
  }
}

runTest();