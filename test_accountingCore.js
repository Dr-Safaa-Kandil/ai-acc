require('dotenv').config({ quiet: true });
const { processAndSaveTransaction } = require('./accountingCore');

async function testCoreSystem() {
  console.log('=============== 🧪 بدء اختبار وحدة المحاسبة المالية الآلية ===============\n');

  // نص معاملة افتتاحية للتجربة
  const testTransaction = `
  إثبات القيد الافتتاحي لنشاط بطل ستوريز بتاريخ 15/09/2026 برأس مال إجمالي 1,000,000 جنيه مصري موزعة كالتالي:
  - 500,000 جنيه في حساب البنك
  - 300,000 جنيه أصول رقمية ومعنوية
  - 200,000 جنيه أصول ثابتة
  `;

  const result = await processAndSaveTransaction(testTransaction, '2026-09-15');

  if (result.success) {
    console.log('\n🎉 اكتملت العملية بنجاح! تفاصيل القيد المحفوظ:');
    console.log(`📌 الرقم المرجعي: ${result.referenceNumber}`);
    console.log(`📝 البيان: ${result.summary}`);
    console.table(result.entries);
    console.log(`📊 حالة التوازن: ${result.evaluation.message}`);
  } else {
    console.error('\n❌ فشل الاختبار:', result.error || result.message);
  }
}

testCoreSystem();