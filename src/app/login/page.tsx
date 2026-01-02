'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { LogIn, Loader2, ArrowLeft, ShieldCheck } from 'lucide-react';
import Turnstile from 'react-turnstile';

export default function MerchantLoginPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });
    const [error, setError] = useState('');
    const [turnstileToken, setTurnstileToken] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        if (!turnstileToken) {
            setError('Silakan selesaikan captcha terlebih dahulu.');
            setLoading(false);
            return;
        }

        try {
            const res = await fetch('/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...formData, turnstileToken }),
            });

            const result = await res.json();

            if (result.success) {
                // For now, we'll just redirect to dashboard
                // In a real app, we'd set a cookie or use a library like NextAuth
                localStorage.setItem('merchant', JSON.stringify(result.data));
                router.push('/dashboard');
            } else {
                setError(result.error || 'Email atau password salah');
            }
        } catch (err) {
            setError('Terjadi kesalahan koneksi.');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    return (
        <div className="min-h-screen bg-[#05070a] text-white flex items-center justify-center p-6 font-['Outfit',sans-serif]">
            <div className="max-w-md w-full">

                <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-6 md:p-10 rounded-3xl shadow-2xl">
                    <div className="text-center mb-8">
                        <div className="w-16 h-16 bg-cyan-400/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <ShieldCheck size={32} className="text-cyan-400" />
                        </div>
                        <h1 className="text-3xl font-bold mb-2">Merchant Login</h1>
                        <p className="text-gray-400">Masuk ke dashboard SawargiPay Anda</p>
                    </div>

                    {error && (
                        <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl text-sm mb-6 text-center">
                            {error}
                        </div>
                    )}

                    <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-medium text-gray-400">Email Address</label>
                            <input
                                type="email"
                                name="email"
                                required
                                placeholder="nama@bisnis.com"
                                className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:border-cyan-400 outline-none transition-all"
                                onChange={handleChange}
                            />
                        </div>

                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-medium text-gray-400">Password</label>
                            <input
                                type="password"
                                name="password"
                                required
                                placeholder="••••••••"
                                className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:border-cyan-400 outline-none transition-all"
                                onChange={handleChange}
                            />
                        </div>

                        <div className="flex justify-center my-4">
                            <Turnstile
                                sitekey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || '1x00000000000000000000AA'}
                                onVerify={(token: string) => setTurnstileToken(token)}
                                theme="dark"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="mt-2 bg-gradient-to-r from-cyan-400 to-purple-600 text-white py-4 rounded-xl font-bold shadow-lg hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            {loading ? <Loader2 className="animate-spin" size={18} /> : 'Masuk Dashboard'} <LogIn size={18} />
                        </button>
                    </form>

                    <div className="mt-8 text-center text-sm text-gray-400">
                        Belum punya akun? <Link href="/register" className="text-cyan-400 hover:underline">Daftar Sekarang</Link>
                    </div>
                </div>
                <div className="mt-8 text-center">
                    <Link href="/" className="text-sm text-gray-500 hover:text-white transition-colors">
                        Kembali ke Beranda
                    </Link>
                </div>
            </div>
        </div>
    );
}
