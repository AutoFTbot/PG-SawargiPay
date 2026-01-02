import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
    try {
        const { email, otp } = await request.json();

        const application = await prisma.merchantApplication.findFirst({
            where: {
                email,
                status: 'PENDING',
                isEmailVerified: false
            }
        });

        if (!application) {
            return NextResponse.json({ success: false, error: 'Aplikasi tidak ditemukan' }, { status: 404 });
        }

        if (application.otp !== otp) {
            return NextResponse.json({ success: false, error: 'Kode OTP salah' }, { status: 400 });
        }

        if (application.otpExpires && new Date() > application.otpExpires) {
            return NextResponse.json({ success: false, error: 'Kode OTP kadaluarsa' }, { status: 400 });
        }

        // Verify email
        await prisma.merchantApplication.update({
            where: { id: application.id },
            data: {
                isEmailVerified: true,
                otp: null,
                otpExpires: null
            }
        });

        return NextResponse.json({ success: true, message: 'Email berhasil diverifikasi' });
    } catch (error: any) {
        console.error('Verification Error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
