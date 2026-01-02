'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Send, CheckCircle2, Loader2 } from 'lucide-react';

import Turnstile from 'react-turnstile';

export default function RegisterPage() {
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);
    const [showOTP, setShowOTP] = useState(false);
    const [otp, setOtp] = useState('');
    const [verifying, setVerifying] = useState(false);
    const [turnstileToken, setTurnstileToken] = useState('');
    const [formData, setFormData] = useState({
        businessName: '',
        businessType: '',
        ownerName: '',
        email: '',
        phone: '',
        password: '',
        address: '',
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!turnstileToken) {
            alert('Silakan selesaikan captcha terlebih dahulu.');
            return;
        }
        setLoading(true);
        try {
            const res = await fetch('/api/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...formData, turnstileToken }),
            });
            const result = await res.json();
            if (result.success) {
                if (result.requireVerification) {
                    setShowOTP(true);
                } else {
                    setSubmitted(true);
                }
            } else {
                alert('Gagal mengirim pendaftaran: ' + result.error);
            }
        } catch (err) {
            alert('Terjadi kesalahan koneksi.');
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOTP = async () => {
        setVerifying(true);
        try {
            const res = await fetch('/api/register/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: formData.email, otp }),
            });
            const result = await res.json();
            if (result.success) {
                setShowOTP(false);
                setSubmitted(true);
            } else {
                alert('Verifikasi gagal: ' + result.error);
            }
        } catch (err) {
            alert('Terjadi kesalahan koneksi.');
        } finally {
            setVerifying(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    if (submitted) {
        return (
            <div className="min-h-screen bg-[#05070a] text-white flex items-center justify-center p-6 font-['Outfit',sans-serif]">
                <div className="bg-white/5 backdrop-blur-xl border border-white/10 max-w-lg w-full p-6 md:p-12 rounded-3xl text-center shadow-2xl">
                    <CheckCircle2 size={64} className="text-emerald-400 mx-auto mb-6" />
                    <h2 className="text-3xl font-bold mb-4">Pendaftaran Berhasil!</h2>
                    <p className="text-gray-400 mb-8">Terima kasih telah mendaftar di SawargiPay. Tim kami akan meninjau data Anda dan menghubungi Anda dalam 1-2 hari kerja untuk proses aktivasi QRIS.</p>
                    <Link href="/" className="inline-block bg-gradient-to-r from-cyan-400 to-purple-600 text-white px-8 py-4 rounded-xl font-bold shadow-lg hover:scale-105 transition-all">
                        Kembali ke Beranda
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#05070a] text-white py-10 md:py-20 font-['Outfit',sans-serif]">
            <div className="container mx-auto px-6">
                <div className="max-w-3xl mx-auto">
                    <div className="text-center mb-12">
                        <h1 className="text-4xl md:text-5xl font-extrabold mb-4 bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
                            Pendaftaran Merchant SawargiPay
                        </h1>
                        <p className="text-gray-400">Lengkapi data di bawah ini untuk memulai integrasi pembayaran.</p>
                    </div>

                    <form className="bg-white/5 backdrop-blur-xl border border-white/10 p-6 md:p-12 rounded-3xl shadow-2xl flex flex-col gap-6" onSubmit={handleSubmit}>
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-medium text-gray-400">Nama Bisnis / Toko</label>
                            <input
                                type="text"
                                name="businessName"
                                required
                                placeholder="Contoh: Toko Berkah Jaya"
                                className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:border-cyan-400 outline-none transition-all"
                                onChange={handleChange}
                                value={formData.businessName}
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-medium text-gray-400">Tipe Bisnis</label>
                                <select
                                    name="businessType"
                                    required
                                    className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:border-cyan-400 outline-none transition-all appearance-none"
                                    onChange={handleChange}
                                    value={formData.businessType}
                                >
                                    <option value="" className="bg-[#05070a]">Pilih Tipe</option>
                                    <option value="retail" className="bg-[#05070a]">Retail / Toko</option>
                                    <option value="food" className="bg-[#05070a]">Makanan & Minuman</option>
                                    <option value="service" className="bg-[#05070a]">Jasa</option>
                                    <option value="online" className="bg-[#05070a]">Online Shop</option>
                                </select>
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-medium text-gray-400">Nama Pemilik</label>
                                <input
                                    type="text"
                                    name="ownerName"
                                    required
                                    placeholder="Nama sesuai KTP"
                                    className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:border-cyan-400 outline-none transition-all"
                                    onChange={handleChange}
                                    value={formData.ownerName}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-medium text-gray-400">Email</label>
                                <input
                                    type="email"
                                    name="email"
                                    required
                                    placeholder="email@bisnisanda.com"
                                    className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:border-cyan-400 outline-none transition-all"
                                    onChange={handleChange}
                                    value={formData.email}
                                />
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-medium text-gray-400">Nomor WhatsApp</label>
                                <input
                                    type="tel"
                                    name="phone"
                                    required
                                    placeholder="0812xxxx"
                                    className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:border-cyan-400 outline-none transition-all"
                                    onChange={handleChange}
                                    value={formData.phone}
                                />
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-medium text-gray-400">Password</label>
                                <input
                                    type="password"
                                    name="password"
                                    required
                                    placeholder="Min. 8 karakter"
                                    className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:border-cyan-400 outline-none transition-all"
                                    onChange={handleChange}
                                    value={formData.password}
                                />
                            </div>
                        </div>

                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-medium text-gray-400">Alamat Bisnis</label>
                            <textarea
                                name="address"
                                rows={3}
                                required
                                placeholder="Alamat lengkap operasional"
                                className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:border-cyan-400 outline-none transition-all resize-none"
                                onChange={handleChange}
                                value={formData.address}
                            ></textarea>
                        </div>

                        <div className="flex justify-center my-4">
                            <Turnstile
                                sitekey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || "1x00000000000000000000AA"}
                                onVerify={(token) => setTurnstileToken(token)}
                                theme="dark"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="mt-4 bg-gradient-to-r from-cyan-400 to-purple-600 text-white py-4 rounded-xl font-bold shadow-lg hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            {loading ? <Loader2 className="animate-spin" size={18} /> : 'Kirim Pengajuan'} <Send size={18} />
                        </button>
                    </form>
                </div>
                <div className="mt-8 text-center">
                    <Link href="/" className="text-sm text-gray-500 hover:text-white transition-colors">
                        Kembali ke Beranda
                    </Link>
                </div>
            </div>

            {/* OTP Modal */}
            {showOTP && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
                    <div className="bg-[#0a0c10] border border-white/10 p-8 rounded-3xl max-w-md w-full text-center">
                        <h3 className="text-2xl font-bold mb-4">Verifikasi Email</h3>
                        <p className="text-gray-400 mb-6">Masukkan kode OTP yang telah dikirim ke email <strong>{formData.email}</strong></p>

                        <input
                            type="text"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                            placeholder="Masukan 6 digit kode"
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 text-center text-2xl font-bold tracking-widest mb-6 focus:border-cyan-400 outline-none"
                            maxLength={6}
                        />

                        <button
                            onClick={handleVerifyOTP}
                            disabled={verifying || otp.length < 6}
                            className="w-full bg-cyan-400 text-black py-4 rounded-xl font-bold hover:bg-cyan-300 transition-all disabled:opacity-50"
                        >
                            {verifying ? 'Memverifikasi...' : 'Verifikasi OTP'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
