import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { sendOTPEmail } from '@/lib/email';
import crypto from 'crypto';

import { verifyTurnstile } from '@/lib/security';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { businessName, businessType, ownerName, email, phone, address, password, turnstileToken } = body;

        // Verify Turnstile
        const isCaptchaValid = await verifyTurnstile(turnstileToken);
        if (!isCaptchaValid) {
            return NextResponse.json({ success: false, error: 'Captcha tidak valid' }, { status: 400 });
        }

        // Check if email already exists in Merchant
        const existingMerchant = await prisma.merchant.findUnique({
            where: { email }
        });

        if (existingMerchant) {
            return NextResponse.json({ success: false, error: 'Email sudah terdaftar' }, { status: 400 });
        }

        // Check if email exists in pending applications
        // If pending but not verified, we can update the OTP and resend
        const existingApplication = await prisma.merchantApplication.findFirst({
            where: {
                email,
                status: 'PENDING'
            }
        });

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
        const hashedPassword = await bcrypt.hash(password, 10);

        if (existingApplication && !existingApplication.isEmailVerified) {
            // Update existing pending application
            await prisma.merchantApplication.update({
                where: { id: existingApplication.id },
                data: {
                    businessName,
                    businessType,
                    ownerName,
                    phone,
                    address,
                    password: hashedPassword,
                    otp,
                    otpExpires
                }
            });
        } else if (existingApplication && existingApplication.isEmailVerified) {
            return NextResponse.json({ success: false, error: 'Email sedang dalam proses verifikasi admin' }, { status: 400 });
        } else {
            // Create new application
            await prisma.merchantApplication.create({
                data: {
                    businessName,
                    businessType,
                    ownerName,
                    email,
                    phone,
                    address,
                    password: hashedPassword,
                    otp,
                    otpExpires,
                    isEmailVerified: false
                },
            });
        }

        // Send OTP Email
        await sendOTPEmail(email, otp);

        return NextResponse.json({ success: true, message: 'OTP sent to email', requireVerification: true, email });
    } catch (error: any) {
        console.error('Registration Error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
