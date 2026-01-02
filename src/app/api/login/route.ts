import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

import bcrypt from 'bcryptjs';

import { verifyTurnstile } from '@/lib/security';

export async function POST(request: Request) {
    try {
        const { email, password, turnstileToken } = await request.json();

        // Verify Turnstile
        const isCaptchaValid = await verifyTurnstile(turnstileToken);
        if (!isCaptchaValid) {
            return NextResponse.json({ success: false, error: 'Captcha tidak valid' }, { status: 400 });
        }

        const merchant = await prisma.merchant.findUnique({
            where: { email },
        });

        if (!merchant) {
            return NextResponse.json(
                { success: false, error: 'Email atau password salah' },
                { status: 401 }
            );
        }

        const isValid = await bcrypt.compare(password, merchant.password);

        if (!isValid) {
            return NextResponse.json(
                { success: false, error: 'Email atau password salah' },
                { status: 401 }
            );
        }

        // Return merchant data (excluding password)
        const { password: _, ...merchantData } = merchant;

        return NextResponse.json({
            success: true,
            data: merchantData
        });
    } catch (error: any) {
        console.error('Login error:', error);
        return NextResponse.json(
            { success: false, error: 'Terjadi kesalahan server' },
            { status: 500 }
        );
    }
}
