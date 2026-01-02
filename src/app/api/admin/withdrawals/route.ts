import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
    try {
        const withdrawals = await prisma.withdrawal.findMany({
            include: {
                merchant: {
                    select: {
                        businessName: true,
                        email: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        return NextResponse.json({ success: true, data: withdrawals });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
    }
}

export async function PATCH(request: Request) {
    try {
        const { id, status } = await request.json();

        if (!id || !status) {
            return NextResponse.json({ success: false, error: 'ID and status required' }, { status: 400 });
        }

        const withdrawal = await prisma.withdrawal.update({
            where: { id },
            data: { status }
        });

        return NextResponse.json({ success: true, data: withdrawal });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
    }
}
