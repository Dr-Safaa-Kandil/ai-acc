// check_core.js
const { processAndSaveTransaction } = require('./accountingCore');

async function testAccountingCore() {
  console.log('🔍 جاري اختبار وحدة accountingCore.js ونموذج AI المستهدف...\n');

  const testText = 'تحصيل مبلغ 15000 جنيه نقداً من أحد العملاء لحساب الشركة';
  const testDate = new Date().toISOString().split('T')[0];

  const result = await processAndSaveTransaction(testText, testDate);

  if (result.success) {
    console.log('✅ تم الاختيار والحفظ بنجاح!');
    console.log(`📌 الموديول المستخدم بالتجربة: ${result.evaluation.message}`);
    console.log(`📄 الرقم المرجعي للقيد: ${result.referenceNumber}`);
    console.log(`📝 البيان: ${result.summary}`);
    console.table(result.entries);
  } else {
    console.error('❌ حدث خطأ أثناء المعالجة:', result.error);
  }
}

testAccountingCore();