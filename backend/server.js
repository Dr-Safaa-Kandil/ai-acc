import 'dotenv/config'; // أضف هذا السطر في أعلى الملف تماماً
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

const PORT = process.env.PORT || 3000;

// إنشاء عميل Supabase باستخدام مفتاح الخدمة (service_role) الآمن للخادم فقط
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("❌ خطأ: يرجى التأكد من تعيين متغيرات البيئة SUPABASE_URL و SUPABASE_SERVICE_ROLE_KEY في ملف .env");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { persistSession: false }
});

// =========================================================================
// اختبار نجاح الاتصال بقاعدة البيانات عند بدء التشغيل
// =========================================================================
async function testDatabaseConnection() {
  try {
    const { data, error } = await supabase.from('staging_sales_journal').select('id').limit(1);
    if (error && error.code !== 'PGRST116') {
      console.error("⚠️ تحذير في الاتصال بقاعدة البيانات:", error.message);
    } else {
      console.log("✅ نجح الاتصال بقاعدة بيانات Supabase وجداول الاستقبال الوسيطة بأمان تام عبر service_role!");
    }
  } catch (err) {
    console.error("❌ فشل الاتصال بقاعدة البيانات:", err.message);
  }
}

// =========================================================================
// نقاط النهاية (API Endpoints) لخادم الـ Backend
// =========================================================================

// 1. نقطة نهاية لجلب المبيعات المعلقة من جدول الاستقبال الوسيط
app.get('/api/staging/sales', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('staging_sales_journal')
      .select('*')
      .eq('status', 'PENDING');

    if (error) throw error;
    res.status(200).json({ success: true, count: data.length, data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 2. نقطة نهاية لجلب توثيقات نظام TaaS والمفاهيم الابتكارية المسجلة
app.get('/api/system/innovations', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('system_innovations_documentation')
      .select('*');

    if (error) throw error;
    res.status(200).json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// تشغيل الخادم
app.listen(PORT, () => {
  console.log(`🚀 خادم الـ Node.js يعمل بنجاح على المنفذ: http://localhost:${PORT}`);
  testDatabaseConnection();
});