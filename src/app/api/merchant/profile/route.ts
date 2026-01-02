import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ success: false, error: 'ID required' }, { status: 400 });
        }

        const merchant = await prisma.merchant.findUnique({
            where: { id },
            include: {
                application: true
            }
        });

        if (!merchant) {
            return NextResponse.json({ success: false, error: 'Merchant not found' }, { status: 404 });
        }

        // Return merchant data (excluding password)
        const { password: _, ...merchantData } = merchant;

        return NextResponse.json({
            success: true,
            data: merchantData
        });
    } catch (error: any) {
        console.error('Profile error:', error);
        return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
    }
}

export async function PUT(request: Request) {
    try {
        const body = await request.json();
        console.log('Update Profile Request:', body);
        const { id, businessName, ownerName, phone, address, profilePicture } = body;

        if (!id) {
            return NextResponse.json({ success: false, error: 'ID required' }, { status: 400 });
        }

        // Check if merchant exists
        const existingMerchant = await prisma.merchant.findUnique({
            where: { id },
            include: { application: true }
        });

        if (!existingMerchant) {
            return NextResponse.json({ success: false, error: 'Merchant not found' }, { status: 404 });
        }

        // Update Merchant
        // If application exists, update it too
        const updateData: any = {
            businessName,
            ownerName,
            profilePicture
        };

        if (existingMerchant.application) {
            updateData.application = {
                update: {
                    businessName,
                    ownerName,
                    phone,
                    address
                }
            };
        }

        const updatedMerchant = await prisma.merchant.update({
            where: { id },
            data: updateData,
            include: {
                application: true
            }
        });

        const { password: _, ...merchantData } = updatedMerchant;

        return NextResponse.json({
            success: true,
            data: merchantData
        });
    } catch (error: any) {
        console.error('Update profile error:', error);
        return NextResponse.json({ success: false, error: 'Gagal mengupdate profil: ' + (error.message || error) }, { status: 500 });
    }
}
