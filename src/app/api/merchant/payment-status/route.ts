import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getPaymentDetail } from '@/lib/pakasir';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const orderId = searchParams.get('orderId');
        const merchantId = searchParams.get('merchantId');

        if (!orderId || !merchantId) {
            return NextResponse.json({
                success: false,
                error: 'Parameter orderId dan merchantId wajib diisi'
            }, { status: 400 });
        }

        const merchant = await prisma.merchant.findUnique({
            where: { id: merchantId },
        });

        if (!merchant) {
            return NextResponse.json({ success: false, error: 'Merchant tidak ditemukan' }, { status: 404 });
        }

        const transaction = await prisma.transaction.findUnique({
            where: { orderId },
        });

        if (!transaction) {
            return NextResponse.json({ success: false, error: 'Transaksi tidak ditemukan' }, { status: 404 });
        }

        // If still pending, try to refresh from Pakasir
        let currentStatus = transaction.status;
        if (currentStatus === 'PENDING' && merchant.apiKey && merchant.merchantId) {
            const detail = await getPaymentDetail(transaction.orderId, transaction.amount, {
                slug: merchant.merchantId,
                apikey: merchant.apiKey
            });

            if (detail.success && detail.data && detail.data.status !== 'pending') {
                currentStatus = detail.data.status.toUpperCase();
                await prisma.transaction.update({
                    where: { id: transaction.id },
                    data: { status: currentStatus }
                });
            }
        }

        return NextResponse.json({
            success: true,
            data: {
                orderId: transaction.orderId,
                amount: transaction.amount,
                status: currentStatus,
                method: transaction.method,
                createdAt: transaction.createdAt,
                isPaid: currentStatus === 'SUCCESS' || currentStatus === 'COMPLETED'
            }
        });

    } catch (error: any) {
        console.error('Payment Status API Error:', error);
        return NextResponse.json({ success: false, error: 'Terjadi kesalahan server' }, { status: 500 });
    }
}
