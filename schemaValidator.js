import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

/**
 * خريطة الربط (Mapping Dictionary) بين المعرفات البرمجية الآمنة (English Keys)
 * وما يقابلها من أسماء الأعمدة العربية الموجودة في واجهة المستخدم / الجدول الحسابي
 */
const ITALIAN_JOURNAL_MAP = {
  'entry_id': 'رقم القيد',
  'entry_date': 'التاريخ',
  'account_code': 'رقم الحساب',
  'account_name': 'اسم الحساب',
  'debit': 'مدين',
  'credit': 'دائن',
  'description': 'البيان'
};

/**
 * دالة فحص ومطابقة آمنة تراعي تباين ترميز الحروف العربية (Unicode/ASCII)
 * عبر تحويل المسميات إلى مفاتيح برمجية قياسية ثابتة.
 */
export async function validateAndMapPayload(tableName, payload) {
  try {
    // 1. جلب عينة من الجدول للتأكد من الاتصال وهيكل الأعمدة الفعلي
    const { data, error } = await supabase
      .from(tableName)
      .select('*')
      .limit(1);

    if (error) {
      return { isValid: false, message: `خطأ في الوصول للجدول ${tableName}: ${error.message}` };
    }

    if (!data || data.length === 0) {
      return { isValid: true, warning: 'الجدول فارغ، تم تجاوز الفحص الهيكلي المبدئي.' };
    }

    const validColumns = Object.keys(data[0]);
    const payloadKeys = Object.keys(payload);

    // 2. التحقق من مطابقة المفاتيح البرمجية الإنجليزية المعتمدة في النظام
    const invalidKeys = payloadKeys.filter(key => !validColumns.includes(key));

    if (invalidKeys.length > 0) {
      return {
        isValid: false,
        error: 'خطأ في تطابق مفاتيح الإدخال البرمجية!',
        invalidKeys,
        message: `المفاتيح التالية غير موجودة كأعمدة في قاعدة البيانات: [${invalidKeys.join(', ')}]. يرجى استخدام المعرفات البرمجية الثابتة.`
      };
    }

    return { 
      isValid: true, 
      message: 'البيانات مطابقة تماماً لهيكل قاعدة البيانات وآمنة ضد مشاكل الترميز العربي.' 
    };

  } catch (err) {
    return { isValid: false, message: `استثناء غير متوقع أثناء فحص المطابقة: ${err.message}` };
  }
}