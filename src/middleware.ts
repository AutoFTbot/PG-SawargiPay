import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const path = request.nextUrl.pathname;

    // Define protected routes
    const isAdminRoute = path.startsWith('/admin');
    const isAdminApiRoute = path.startsWith('/api/admin');
    const isLoginRoute = path === '/admin/login';

    // Get the admin session cookie
    const adminSession = request.cookies.get('admin_session');

    // Protect Admin Pages
    if (isAdminRoute && !isLoginRoute) {
        if (!adminSession) {
            return NextResponse.redirect(new URL('/admin/login', request.url));
        }
    }

    // Protect Admin API Routes
    if (isAdminApiRoute && !path.startsWith('/api/admin/login')) {
        if (!adminSession) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            );
        }
    }

    // Redirect to dashboard if already logged in and trying to access login page
    if (isLoginRoute && adminSession) {
        return NextResponse.redirect(new URL('/admin', request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/admin/:path*', '/api/admin/:path*'],
};
