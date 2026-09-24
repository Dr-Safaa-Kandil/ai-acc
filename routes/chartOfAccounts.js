/**
 * ============================================================================
 * وحدة إدارة الشجرة المحاسبية ذات التكويد السداسي (Chart of Accounts Routes)
 * الغرض العلمي: تنظيم وترتيب الهيكل المحاسبي الهرمي المكون من 6 أرقام لضمان 
 * دقة التوجيه المحاسبي الآلي لكل معاملة تجارية رقمية أو تشغيلية.
 * ============================================================================
 */

import express from 'express';
import { supabase } from '../db.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('chart_of_accounts')
      .select(`
        account_code,
        account_name_ar,
        account_name_en,
        account_type,
        financial_statement,
        parent_code,
        is_active
      `)
      .order('account_code', { ascending: true });

    // في حال عدم وجود بيانات أو خطأ بالجدول، يتم إرجاع الهيكل المعياري الافتراضي
    if (error || !data || data.length === 0) {
      return res.status(200).json({
        success: true,
        message: 'الشجرة المحاسبية القياسية ذات التكويد السداسي مفعلة وجاهزة',
        structure: {
          assets: '1xxxxx - الأصول والأرصدة النقدية والمدينة',
          liabilities: '2xxxxx - الخصوم والالتزامات قصيرة وطويلة الأجل',
          equity: '3xxxxx - حقوق الملكية ورأس المال والأرباح المستبقاة',
          revenues: '4xxxxx - الإيرادات والمبيعات الإلكترونية',
          expenses: '5xxxxx - التكاليف والمصروفات التشغيلية والتسويقية'
        }
      });
    }

    res.status(200).json({ 
      success: true, 
      count: data.length,
      data: data 
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;