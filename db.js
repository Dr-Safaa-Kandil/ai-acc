/**
 * ============================================================================
 * ملف إدارة الاتصال بقاعدة البيانات المركزية (Supabase Database Connector)
 * الغرض: توفير عميل اتصال موحد وآمن لجميع وحدات النواة المحاسبية.
 * المرونة: مصمم ليدعم الاستعلامات المتنوعة مع مراعاة قواعد الأمان ومعايير IFRS.
 * تصميم وتطوير: د. صفاء رزق قنديل
 * ============================================================================
 */

import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

// التحقق الصارم من وجود متغيرات البيئة لمنع أي أخطاء تشغيلية صامتة
if (!supabaseUrl || !supabaseKey) {
  console.error('❌ خطأ حرج: متغيرات الاتصال بـ Supabase (SUPABASE_URL أو SUPABASE_ANON_KEY) غير معرفة في ملف البيئة .env');
  throw new Error('Critical Error: Missing Supabase Environment Variables in .env file.');
}

// إنشاء وتصدير عميل الاتصال الموحد لقاعدة البيانات لخدمة كافة مسارات الخادم والـ APIs
export const supabase = createClient(supabaseUrl, supabaseKey);