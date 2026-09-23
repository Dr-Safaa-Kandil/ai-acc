// test_api.js
const processApiHandler = require('./api/process');

async function runFullSystemTest() {
  console.log('================ 🧪 بدء الاختبار الشامل لنقطة الاتصال API ================ \n');

  // محاكاة طلب استدعاء قادم من واجهة المستخدم (Web App)
  const mockReq = {
    method: 'POST',
    body: {
      transactionText: 'شراء أجهزة ومعدات تقنية بمبلغ 75000 جنيه تم سدادها نقداً من حساب الشركة في البنك',
      date: new Date().toISOString().split('T')[0]
    }
  };

  // محاكاة كائن الاستجابة (Response)
  const mockRes = {
    statusCode: 200,
    headers: {},
    setHeader(key, value) {
      this.headers[key] = value;
    },
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(data) {
      console.log(`📥 كود حالة الاستجابة (Status Code): ${this.statusCode}`);
      console.log('📄 كائن الاستجابة النهائي من API:');
      console.dir(data, { depth: null, colors: true });
    },
    end() {}
  };

  await processApiHandler(mockReq, mockRes);
}

runFullSystemTest();