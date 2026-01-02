import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getPaymentDetail } from '@/lib/pakasir';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const merchantId = searchParams.get('merchantId');

        if (!merchantId) {
            return NextResponse.json({ success: false, error: 'Merchant ID required' }, { status: 400 });
        }

        const merchant = await prisma.merchant.findUnique({
            where: { id: merchantId },
        });

        if (!merchant) {
            return NextResponse.json({ success: false, error: 'Merchant not found' }, { status: 404 });
        }

        // 1. Get all transactions from DB
        const transactions = await prisma.transaction.findMany({
            where: { merchantId },
            orderBy: { createdAt: 'desc' },
            take: 10 // Last 10 transactions
        });

        // 2. Refresh pending transactions status from Pakasir
        const pendingTransactions = transactions.filter(t => t.status === 'PENDING');

        if (merchant.apiKey && merchant.merchantId) {
            for (const tx of pendingTransactions) {
                const detail = await getPaymentDetail(tx.orderId, tx.amount, {
                    slug: merchant.merchantId,
                    apikey: merchant.apiKey
                });

                if (detail.success && detail.data && detail.data.status !== 'pending') {
                    const newStatus = detail.data.status.toUpperCase();
                    await prisma.transaction.update({
                        where: { id: tx.id },
                        data: { status: newStatus }
                    });
                    // Update the local object for the response
                    tx.status = newStatus;
                }
            }
        }

        // 3. Calculate stats
        const allTransactions = await prisma.transaction.findMany({
            where: { merchantId }
        });

        const totalVolume = allTransactions
            .filter(t => t.status === 'SUCCESS' || t.status === 'COMPLETED')
            .reduce((sum, t) => sum + t.amount, 0);

        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        const todayVolume = allTransactions
            .filter(t => (t.status === 'SUCCESS' || t.status === 'COMPLETED') && new Date(t.createdAt) >= today)
            .reduce((sum, t) => sum + t.amount, 0);

        const yesterdayVolume = allTransactions
            .filter(t => (t.status === 'SUCCESS' || t.status === 'COMPLETED') &&
                new Date(t.createdAt) >= yesterday &&
                new Date(t.createdAt) < today)
            .reduce((sum, t) => sum + t.amount, 0);

        // Calculate trends
        const calculateTrend = (current: number, previous: number) => {
            if (previous === 0) return current > 0 ? '+100%' : '+0%';
            const diff = ((current - previous) / previous) * 100;
            return `${diff >= 0 ? '+' : ''}${diff.toFixed(1)}%`;
        };

        const todayTrend = calculateTrend(todayVolume, yesterdayVolume);
        const totalTrend = calculateTrend(todayVolume, totalVolume - todayVolume); // Growth today vs previous total

        return NextResponse.json({
            success: true,
            data: {
                stats: [
                    {
                        label: 'Total Transaksi',
                        value: `Rp ${totalVolume.toLocaleString('id-ID')}`,
                        trend: totalTrend,
                        color: ''
                    },
                    {
                        label: 'Transaksi Hari Ini',
                        value: `Rp ${todayVolume.toLocaleString('id-ID')}`,
                        trend: todayTrend,
                        color: ''
                    },
                    { label: 'Merchant Status', value: 'Active', color: 'text-emerald-400', trend: 'Verified' },
                ],
                transactions: transactions.map(t => ({
                    id: t.orderId,
                    date: new Date(t.createdAt).toLocaleString('id-ID', {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit'
                    }),
                    amount: `Rp ${t.amount.toLocaleString('id-ID')}`,
                    method: t.method.toUpperCase(),
                    status: t.status.charAt(0).toUpperCase() + t.status.slice(1).toLowerCase()
                }))
            }
        });
    } catch (error: any) {
        console.error('Stats API Error:', error);
        return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
    }
}
