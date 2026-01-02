import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
    try {
        const applications = await prisma.merchantApplication.findMany({
            include: { merchant: true },
            orderBy: { createdAt: 'desc' },
        });
        return NextResponse.json({ success: true, data: applications });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

import { sendApprovalEmail } from '@/lib/email';

// ... (existing imports)

export async function PATCH(request: Request) {
    try {
        const { id, status } = await request.json();

        // Use a transaction to ensure both operations succeed
        const result = await prisma.$transaction(async (tx) => {
            const application = await tx.merchantApplication.update({
                where: { id },
                data: { status },
            });

            if (status === 'APPROVED') {
                // Check if merchant already exists
                const existingMerchant = await tx.merchant.findUnique({
                    where: { applicationId: id }
                });

                if (!existingMerchant) {
                    await tx.merchant.create({
                        data: {
                            email: application.email,
                            password: application.password, // Use the password from registration
                            businessName: application.businessName,
                            ownerName: application.ownerName,
                            applicationId: id,
                        }
                    });
                }

                // Send approval email (fire and forget, don't await inside transaction to avoid delay)
                sendApprovalEmail(application.email, application.businessName).catch(console.error);
            }

            return application;
        });

        return NextResponse.json({ success: true, data: result });
    } catch (error: any) {
        console.error('Admin PATCH error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function PUT(request: Request) {
    try {
        const { id, apiKey, merchantId } = await request.json();

        const merchant = await prisma.merchant.update({
            where: { id },
            data: { apiKey, merchantId },
        });

        return NextResponse.json({ success: true, data: merchant });
    } catch (error: any) {
        console.error('Admin PUT error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
