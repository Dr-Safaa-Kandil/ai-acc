// listModels.js
require('dotenv').config();
const { GoogleGenAI } = require('@google/genai');

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function checkModels() {
  try {
    console.log('🔍 جاري استعلام الموديولات المتاحة من خوادم Gemini...\n');
    const response = await ai.models.list();
    
    let count = 0;
    console.log('📋 الموديولات المتاحة لحسابك حالياً:');
    console.log('-----------------------------------');

    for await (const model of response) {
      // طباعة اسم كل نموذج متاح
      const modelName = model.name.replace('models/', '');
      console.log(`- ${modelName}`);
      count++;
    }

    if (count === 0) {
      console.log('⚠️ لم يتم العثور على موديولات، جاري المحاولة بالطريقة المباشرة...');
      // طريقة احتياطية للاستعلام
      await testDirectModels();
    }
  } catch (error) {
    console.error('❌ خطأ أثناء جلب الموديولات:', error.message || error);
  }
}

// دالة اختبار سريعة للنماذج الشائعة لمعرفة أي منها يعمل بـ API Key الخاص بك
async function testDirectModels() {
  const testList = ['gemini-2.0-flash', 'gemini-1.5-flash', 'gemini-1.5-pro'];
  console.log('\n🧪 جاري فحص استجابة المفتاح مع النماذج الأساسية:');
  
  for (const m of testList) {
    try {
      await ai.models.generateContent({
        model: m,
        contents: 'Hi'
      });
      console.log(`✅ [${m}]: يعمل بنجاح ومتاح لاستقبال الطلبات.`);
    } catch (err) {
      console.log(`❌ [${m}]: غير متاح (${err.message?.slice(0, 60)}...)`);
    }
  }
}

checkModels();