'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Lock, User, ArrowRight } from 'lucide-react';

export default function AdminLoginPage() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        try {
            const res = await fetch('/api/admin/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
            });

            const result = await res.json();

            if (result.success) {
                router.push('/admin');
                router.refresh(); // Refresh to update middleware state
            } else {
                setError(result.error || 'Login gagal');
            }
        } catch (err) {
            setError('Terjadi kesalahan koneksi');
        }
    };

    return (
        <div className="min-h-screen bg-[#05070a] text-white flex items-center justify-center p-6 font-['Outfit',sans-serif]">
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 max-w-md w-full p-6 md:p-10 rounded-3xl shadow-2xl">
                <div className="text-center mb-10">
                    <h1 className="text-3xl font-extrabold mb-2 bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
                        Admin Login
                    </h1>
                    <p className="text-gray-400">Masuk untuk mengelola SawargiPay</p>
                </div>

                <form onSubmit={handleLogin} className="flex flex-col gap-6">
                    {error && (
                        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-xl text-sm text-center">
                            {error}
                        </div>
                    )}

                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-medium text-gray-400">Username</label>
                        <div className="relative">
                            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                                placeholder="admin"
                                className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3 focus:border-cyan-400 outline-none transition-all"
                            />
                        </div>
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-medium text-gray-400">Password</label>
                        <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                placeholder="••••••••"
                                className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3 focus:border-cyan-400 outline-none transition-all"
                            />
                        </div>
                    </div>

                    <button type="submit" className="mt-4 bg-gradient-to-r from-cyan-400 to-purple-600 text-white py-4 rounded-xl font-bold shadow-lg hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2">
                        Login <ArrowRight size={18} />
                    </button>
                </form>

                <div className="mt-8 text-center">
                    <Link href="/" className="text-sm text-gray-500 hover:text-white transition-colors">
                        Kembali ke Beranda
                    </Link>
                </div>
            </div>
        </div>
    );
}
