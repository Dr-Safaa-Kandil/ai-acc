require('dotenv').config();

console.log('--- 🔍 اختبار قراءة متغيرات البيئة ---');
console.log('SUPABASE_URL:', process.env.SUPABASE_URL ? '✅ متاح' : '❌ غير متاح');
console.log('SUPABASE_ANON_KEY:', process.env.SUPABASE_ANON_KEY ? '✅ متاح' : '❌ غير متاح');
console.log('SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? '✅ متاح' : '❌ غير متاح');