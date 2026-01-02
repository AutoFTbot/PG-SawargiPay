import nodemailer from 'nodemailer';

// Configure transporter
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

export async function sendOTPEmail(to: string, otp: string) {
    try {
        await transporter.sendMail({
            from: `"SawargiPay Security" <${process.env.SMTP_USER}>`,
            to,
            subject: 'Kode Verifikasi Pendaftaran SawargiPay',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
                    <h2 style="color: #0891b2; text-align: center;">Verifikasi Email Anda</h2>
                    <p>Halo,</p>
                    <p>Terima kasih telah mendaftar di SawargiPay. Gunakan kode OTP berikut untuk memverifikasi email Anda:</p>
                    <div style="background-color: #f3f4f6; padding: 15px; text-align: center; border-radius: 8px; margin: 20px 0;">
                        <span style="font-size: 24px; font-weight: bold; letter-spacing: 5px; color: #1f2937;">${otp}</span>
                    </div>
                    <p>Kode ini berlaku selama 15 menit. Jangan berikan kode ini kepada siapapun.</p>
                    <p style="font-size: 12px; color: #6b7280; text-align: center; margin-top: 30px;">
                        &copy; ${new Date().getFullYear()} SawargiPay. All rights reserved.
                    </p>
                </div>
            `,
        });
        return true;
    } catch (error) {
        console.error('Email sending failed:', error);
        return false;
    }
}

export async function sendApprovalEmail(to: string, businessName: string) {
    try {
        await transporter.sendMail({
            from: `"SawargiPay Team" <${process.env.SMTP_USER}>`,
            to,
            subject: 'Selamat! Akun Merchant SawargiPay Anda Telah Aktif',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
                    <h2 style="color: #10b981; text-align: center;">Pendaftaran Disetujui!</h2>
                    <p>Halo <strong>${businessName}</strong>,</p>
                    <p>Selamat! Pengajuan merchant Anda telah disetujui oleh tim kami. Sekarang Anda sudah bisa login ke dashboard dan mulai menerima pembayaran.</p>
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${process.env.NEXT_PUBLIC_BASE_URL}/login" style="background-color: #0891b2; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">Login ke Dashboard</a>
                    </div>
                    <p>Jika Anda memiliki pertanyaan, jangan ragu untuk menghubungi tim support kami.</p>
                    <p style="font-size: 12px; color: #6b7280; text-align: center; margin-top: 30px;">
                        &copy; ${new Date().getFullYear()} SawargiPay. All rights reserved.
                    </p>
                </div>
            `,
        });
        return true;
    } catch (error) {
        console.error('Approval email sending failed:', error);
        return false;
    }
}
