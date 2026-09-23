// تحميل متغيرات البيئة من ملف .env
require('dotenv').config();

const { createClient } = require('@supabase/supabase-js');

// التحقق من وجود بيانات الاتصال في ملف .env
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ خطأ: لم يتم العثور على SUPABASE_URL أو SUPABASE_KEY في ملف .env');
  process.exit(1);
}

// إنشاء عميل الاتصال بـ Supabase
const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  console.log('🔄 جاري اختبار الاتصال بقاعدة البيانات في Supabase...');

  try {
    // محاولة جلب بيانات من جدول شجرة الحسابات
    const { data, error } = await supabase
      .from('chart_of_accounts')
      .select('*')
      .limit(5);

    if (error) {
      console.error('❌ فشل الاتصال بقاعدة البيانات!');
      console.error('تفاصيل الخطأ:', error.message);
      return;
    }

    console.log('✅ تم الاتصال بنجاح بقاعدة البيانات!');
    console.log(`📊 عدد السجلات المسترجعة: ${data.length}`);
    
    if (data.length > 0) {
      console.log('📋 عينة من البيانات:');
      console.table(data);
    } else {
      console.log('ℹ️ الجدول فارغ حالياً، لكن الاتصال يعمل بشكل ممتاز.');
    }
  } catch (err) {
    console.error('💥 حدث خطأ غير متوقع:', err.message);
  }
}

// تشغيل دالة الاختبار
testConnection();