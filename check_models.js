// تحميل متغيرات البيئة من ملف .env
require("dotenv").config();

// جلب المفتاح من ملف .env
const API_KEY = process.env.GEMINI_API_KEY;

async function checkAvailableModels() {
  if (!API_KEY) {
    console.error("❌ لم يتم العثور على GEMINI_API_KEY داخل ملف .env");
    return;
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`;

  try {
    console.log("🔍 جاري فحص الموديلات المتاحة لمفتاحك من ملف .env...\n");
    const response = await fetch(url);
    const data = await response.json();

    if (data.models) {
      console.log("✅ الموديلات المدعومة والمتاحة لك:");
      data.models.forEach((model) => {
        console.log(`- ${model.name.replace("models/", "")}`);
      });
    } else {
      console.error("❌ حدث خطأ من السيرفر:", data);
    }
  } catch (error) {
    console.error("❌ فشل الاتصال بالسيرفر:", error.message);
  }
}

checkAvailableModels();