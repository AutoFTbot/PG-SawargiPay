import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getPaymentDetail } from '@/lib/pakasir';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ orderId: string }> }
) {
    try {
        const { orderId } = await params;

        const transaction = await prisma.transaction.findUnique({
            where: { orderId },
            include: {
                merchant: {
                    select: {
                        apiKey: true,
                        merchantId: true,
                        businessName: true
                    }
                }
            }
        });

        if (!transaction) {
            return NextResponse.json({ success: false, error: 'Transaksi tidak ditemukan' }, { status: 404 });
        }

        // If still pending, try to refresh from Pakasir
        let currentStatus = transaction.status;

        // We use the stored paymentNumber from DB
        let paymentNumber = transaction.paymentNumber || '';

        if (currentStatus === 'PENDING' && transaction.merchant.apiKey && transaction.merchant.merchantId) {
            const detail = await getPaymentDetail(transaction.orderId, transaction.amount, {
                slug: transaction.merchant.merchantId,
                apikey: transaction.merchant.apiKey
            });

            if (detail.success && detail.data) {
                // If for some reason paymentNumber was empty in DB, try to get it from detail
                if (!paymentNumber) paymentNumber = detail.data.payment_number;

                if (detail.data.status !== 'pending') {
                    currentStatus = detail.data.status.toUpperCase();
                    await prisma.transaction.update({
                        where: { id: transaction.id },
                        data: { status: currentStatus }
                    });
                }
            }
        }

        return NextResponse.json({
            success: true,
            data: {
                orderId: transaction.orderId,
                amount: transaction.amount,
                status: currentStatus,
                payment_number: paymentNumber,
                businessName: transaction.merchant.businessName,
                updatedAt: transaction.updatedAt
            }
        });

    } catch (error: any) {
        console.error('Public Payment API Error:', error);
        return NextResponse.json({ success: false, error: 'Terjadi kesalahan server' }, { status: 500 });
    }
}
