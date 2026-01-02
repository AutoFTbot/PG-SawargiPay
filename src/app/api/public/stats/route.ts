import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
    try {
        // Get total active merchants
        const activeMerchants = await prisma.merchant.count();

        // Get total transactions count
        const totalTransactions = await prisma.transaction.count({
            where: {
                status: {
                    in: ['SUCCESS', 'COMPLETED']
                }
            }
        });

        // Get total transaction volume
        const volumeResult = await prisma.transaction.aggregate({
            _sum: {
                amount: true
            },
            where: {
                status: {
                    in: ['SUCCESS', 'COMPLETED']
                }
            }
        });
        const totalVolume = volumeResult._sum.amount || 0;

        // Get recent successful transaction for the ticker
        const recentTransaction = await prisma.transaction.findFirst({
            where: {
                status: {
                    in: ['SUCCESS', 'COMPLETED']
                }
            },
            orderBy: {
                createdAt: 'desc'
            },
            include: {
                merchant: {
                    select: {
                        businessName: true
                    }
                }
            }
        });

        return NextResponse.json({
            success: true,
            data: {
                activeMerchants,
                totalTransactions,
                totalVolume,
                recentTransaction: recentTransaction ? {
                    amount: recentTransaction.amount,
                    merchantName: recentTransaction.merchant.businessName,
                    date: recentTransaction.createdAt
                } : null
            }
        });
    } catch (error) {
        console.error('Public stats error:', error);
        return NextResponse.json({ success: false, error: 'Failed to fetch stats' }, { status: 500 });
    }
}
