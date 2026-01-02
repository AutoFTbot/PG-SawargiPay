import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const { username, password } = await request.json();

        // In a real app, use Environment Variables or Database
        const ADMIN_USER = 'admin';
        const ADMIN_PASS = 'admin123';

        if (username === ADMIN_USER && password === ADMIN_PASS) {
            const response = NextResponse.json({ success: true, message: 'Login successful' });

            // Set HttpOnly Cookie
            response.cookies.set({
                name: 'admin_session',
                value: 'true', // In real app, use a JWT or Session ID
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                path: '/',
                maxAge: 60 * 60 * 24 // 1 day
            });

            return response;
        }

        return NextResponse.json({ success: false, error: 'Invalid credentials' }, { status: 401 });

    } catch (error) {
        return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
    }
}
