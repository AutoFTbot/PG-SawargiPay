import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
    try {
        const { merchantId, amount, bankName, accountName, accountNumber } = await request.json();

        if (!merchantId || !amount || !bankName || !accountName || !accountNumber) {
            return NextResponse.json({ success: false, error: 'Semua data wajib diisi' }, { status: 400 });
        }

        if (amount < 20000) {
            return NextResponse.json({ success: false, error: 'Minimal penarikan Rp 20.000' }, { status: 400 });
        }

        // Check if merchant exists
        const merchant = await prisma.merchant.findUnique({
            where: { id: merchantId }
        });

        if (!merchant) {
            return NextResponse.json({ success: false, error: 'Merchant tidak ditemukan' }, { status: 404 });
        }

        // Create withdrawal request
        const withdrawal = await prisma.withdrawal.create({
            data: {
                amount: parseInt(amount),
                bankName,
                accountName,
                accountNumber,
                merchantId,
                status: 'PENDING'
            }
        });

        return NextResponse.json({
            success: true,
            message: 'Permintaan penarikan berhasil dikirim',
            data: withdrawal
        });

    } catch (error: any) {
        console.error('Withdraw API Error:', error);
        return NextResponse.json({ success: false, error: 'Terjadi kesalahan server' }, { status: 500 });
    }
}

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const merchantId = searchParams.get('merchantId');

        if (!merchantId) {
            return NextResponse.json({ success: false, error: 'Merchant ID required' }, { status: 400 });
        }

        const withdrawals = await prisma.withdrawal.findMany({
            where: { merchantId },
            orderBy: { createdAt: 'desc' }
        });

        return NextResponse.json({ success: true, data: withdrawals });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
    }
}
