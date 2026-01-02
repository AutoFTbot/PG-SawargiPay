import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createPayment } from '@/lib/pakasir';

export async function POST(request: Request) {
    try {
        const { merchantId, amount } = await request.json();

        // Find merchant to get API keys
        const merchant = await prisma.merchant.findUnique({
            where: { id: merchantId },
        });

        if (!merchant || !merchant.apiKey || !merchant.merchantId) {
            return NextResponse.json(
                { success: false, error: 'API Key atau Merchant ID belum diatur oleh admin' },
                { status: 400 }
            );
        }

        // Create a unique order ID
        const orderId = `INV-${Date.now()}`;

        // Call Pakasir SDK
        const result = await createPayment(
            amount,
            orderId,
            { slug: merchant.merchantId, apikey: merchant.apiKey },
            'qris'
        );

        console.log('Pakasir Result:', JSON.stringify(result, null, 2));

        if (result.success) {
            // Save transaction to database
            await prisma.transaction.create({
                data: {
                    orderId,
                    amount,
                    method: 'qris',
                    status: 'PENDING',
                    paymentNumber: result.data.payment_number,
                    merchantId: merchant.id,
                }
            });

            const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
            const internalPaymentUrl = `${baseUrl}/pay/${result.data.order_id}`;

            return NextResponse.json({
                success: true,
                data: {
                    orderId: result.data.order_id,
                    amount: result.data.amount,
                    fee: result.data.fee,
                    total_payment: result.data.total_payment,
                    status: result.data.status.toUpperCase(),
                    payment_number: result.data.payment_number,
                    payment_url: internalPaymentUrl,
                    expired_at: result.data.expired_at
                }
            });
        } else {
            return NextResponse.json({ success: false, error: result.error }, { status: 500 });
        }
    } catch (error: any) {
        console.error('QRIS API Error:', error);
        return NextResponse.json({ success: false, error: 'Terjadi kesalahan server' }, { status: 500 });
    }
}
