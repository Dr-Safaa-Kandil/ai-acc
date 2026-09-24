import 'dotenv/config'; // أضف هذا السطر في أعلى الملف تماماً
import express from 'express';
import { createClient } from '@supabase/supabase-js';

const app = express();
app.use(express.json());

// إعداد اتصال Supabase
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

app.post('/api/journal/sync', async (req, res) => {
    try {
        const rows = req.body.rows;

        if (!rows || !Array.isArray(rows) || rows.length === 0) {
            return res.status(400).json({ success: false, message: 'لا توجد بيانات للترحيل أو صيغة البيانات غير صحيحة.' });
        }

        const processedRows = [];

        for (const row of rows) {
            const orderCode = row[0];
            const customerDetails = row[1];
            const totalAmount = parseFloat(row[2]) || 0;
            const paidAmount = parseFloat(row[3]) || 0;
            const remainingCod = parseFloat(row[4]) || 0;
            const transactionDate = row[5];
            const entryNumber = parseInt(row[6]) || null;
            const accountCode = row[7];
            const debit = parseFloat(row[9]) || 0;
            const credit = parseFloat(row[10]) || 0;
            const ifrsNotes = row[11];

            // التحقق من وجود كود الحساب في chart_of_accounts_coa
            const { data: accountCheck, error: accError } = await supabase
                .from('chart_of_accounts_coa')
                .select('account_code')
                .eq('account_code', accountCode)
                .single();

            if (accError || !accountCheck) {
                return res.status(400).json({ 
                    success: false, 
                    message: `كود الحساب المحاسبي غير مسجل أو غير متاح في دليل الحسابات: ${accountCode}` 
                });
            }

            if (debit < 0 || credit < 0) {
                return res.status(400).json({ success: false, message: 'لا يمكن قبول قيم مبالغ سالبة في المدين أو الدائن.' });
            }
            if (debit > 0 && credit > 0) {
                return res.status(400).json({ success: false, message: `خطأ في القيد للأوردر ${orderCode}: لا يمكن أن يكون السطر مديناً ودائناً في نفس الوقت.` });
            }

            processedRows.push({
                order_code: orderCode,
                customer_details: customerDetails,
                total_amount: totalAmount,
                paid_amount: paidAmount,
                remaining_cod: remainingCod,
                transaction_date: transactionDate || null,
                entry_number: entryNumber,
                account_code: accountCode,
                debit: debit,
                credit: credit,
                ifrs_notes: ifrsNotes
            });
        }

        const { data, error } = await supabase
            .from('italian_journal')
            .insert(processedRows)
            .select();

        if (error) {
            throw error;
        }

        return res.status(200).json({
            success: true,
            message: `تم ترحيل وحفظ ${processedRows.length} سجل بنجاح إلى قاعدة البيانات وفق المعايير المحاسبية.`,
            insertedData: data
        });

    } catch (err) {
        console.error('خطأ أثناء مزامنة القيود:', err.message);
        return res.status(500).json({ success: false, error: err.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Accounting Backend Server is running on port ${PORT}`);
});