// api/process.js
const { processAndSaveTransaction } = require('../accountingCore');

module.exports = async (req, res) => {
  // ضبط إعدادات CORS لتوليد الاستجابة
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'طريقة الطلب غير مسموحة (Method Not Allowed)' });
  }

  try {
    const { transactionText, date } = req.body || {};

    if (!transactionText) {
      return res.status(400).json({ 
        success: false, 
        error: 'يرجى إرسال نص المعاملة في حقل (transactionText)' 
      });
    }

    const transactionDate = date || new Date().toISOString().split('T')[0];

    // استدعاء دالة المحاسبة الآلية
    const result = await processAndSaveTransaction(transactionText, transactionDate);

    if (result.success) {
      return res.status(200).json(result);
    } else {
      return res.status(400).json(result);
    }

  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message || 'حدث خطأ غير متوقع في خادم API'
    });
  }
};