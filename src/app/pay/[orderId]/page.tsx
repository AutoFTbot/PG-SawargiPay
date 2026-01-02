'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { QRCodeSVG } from 'qrcode.react';
import {
    Loader2, ShieldCheck, Clock, AlertCircle,
    CheckCircle2, CreditCard, ArrowLeft
} from 'lucide-react';

export default function PaymentPage() {
    const params = useParams();
    const orderId = params.orderId as string;
    const [loading, setLoading] = useState(true);
    const [paymentData, setPaymentData] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);
    const [timeLeft, setTimeLeft] = useState<string>('');

    useEffect(() => {
        fetchPaymentData();
        const interval = setInterval(fetchPaymentData, 10000); // Poll every 10s
        return () => clearInterval(interval);
    }, [orderId]);

    const fetchPaymentData = async () => {
        try {
            // We need a public endpoint to get payment data by orderId
            // For now, we'll use a modified version of the payment-status API or create a new one
            const res = await fetch(`/api/public/payment/${orderId}`);
            const result = await res.json();
            if (result.success) {
                setPaymentData(result.data);
                if (result.data.status === 'SUCCESS' || result.data.status === 'COMPLETED') {
                    // Stop loading if paid
                    setLoading(false);
                }
            } else {
                setError(result.error);
            }
        } catch (err) {
            setError('Gagal memuat data pembayaran');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#020408] flex flex-col items-center justify-center text-white p-6">
                <Loader2 className="animate-spin text-cyan-400 mb-4" size={48} />
                <p className="text-gray-400 animate-pulse">Menyiapkan pembayaran...</p>
            </div>
        );
    }

    if (error || !paymentData) {
        return (
            <div className="min-h-screen bg-[#020408] flex flex-col items-center justify-center text-white p-6">
                <div className="bg-red-500/10 border border-red-500/20 p-8 rounded-3xl text-center max-w-md">
                    <AlertCircle className="text-red-500 mx-auto mb-4" size={48} />
                    <h1 className="text-xl font-bold mb-2">Oops! Terjadi Kesalahan</h1>
                    <p className="text-gray-400 mb-6">{error || 'Data pembayaran tidak ditemukan'}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="w-full bg-white/5 hover:bg-white/10 py-3 rounded-xl transition-all"
                    >
                        Coba Lagi
                    </button>
                </div>
            </div>
        );
    }

    const isPaid = paymentData.status === 'SUCCESS' || paymentData.status === 'COMPLETED';
    const isExpired = paymentData.status === 'EXPIRED';

    return (
        <div className="min-h-screen bg-[#020408] text-white font-['Outfit',sans-serif] p-4 md:p-8 flex items-center justify-center">
            <div className="w-full max-w-lg">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-extrabold mb-2">
                        <span className="bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">SawargiPay</span>
                    </h1>
                    <p className="text-gray-500 text-sm">Secure Payment Gateway</p>
                </div>

                <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl">
                    {/* Status Banner */}
                    {isPaid ? (
                        <div className="bg-emerald-500/20 border-b border-emerald-500/20 p-6 text-center">
                            <div className="bg-emerald-500 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 shadow-[0_0_20px_rgba(16,185,129,0.4)]">
                                <CheckCircle2 size={28} />
                            </div>
                            <h2 className="text-xl font-bold text-emerald-400">Pembayaran Berhasil!</h2>
                            <p className="text-emerald-500/70 text-sm">Terima kasih atas pembayaran Anda.</p>
                        </div>
                    ) : isExpired ? (
                        <div className="bg-red-500/20 border-b border-red-500/20 p-6 text-center">
                            <AlertCircle className="text-red-500 mx-auto mb-3" size={48} />
                            <h2 className="text-xl font-bold text-red-400">Pembayaran Kadaluarsa</h2>
                            <p className="text-red-500/70 text-sm">Silakan lakukan generate ulang QRIS.</p>
                        </div>
                    ) : (
                        <div className="p-6 border-b border-white/5 flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-cyan-400/10 rounded-xl flex items-center justify-center">
                                    <CreditCard className="text-cyan-400" size={20} />
                                </div>
                                <div>
                                    <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Metode Pembayaran</p>
                                    <p className="font-bold">QRIS All Payment</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Order ID</p>
                                <p className="font-mono text-xs">{orderId}</p>
                            </div>
                        </div>
                    )}

                    <div className="p-6 md:p-10 flex flex-col items-center">
                        {!isPaid && !isExpired && (
                            <>
                                <div className="mb-8 text-center">
                                    <p className="text-gray-400 text-sm mb-1">Total Pembayaran</p>
                                    <p className="text-3xl md:text-4xl font-black text-white">
                                        Rp {paymentData.amount.toLocaleString('id-ID')}
                                    </p>
                                </div>

                                <div className="bg-white p-4 rounded-[2rem] shadow-[0_0_50px_rgba(255,255,255,0.1)] mb-8 relative group max-w-full">
                                    <QRCodeSVG
                                        value={paymentData.payment_number}
                                        size={240}
                                        className="w-full h-auto max-w-[240px]"
                                    />
                                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-white/80 rounded-[2rem]">
                                        <p className="text-black font-bold text-sm">Scan QRIS</p>
                                    </div>
                                </div>

                                <div className="w-full space-y-4">
                                    <div className="flex items-center justify-center gap-2 text-amber-400 bg-amber-400/10 py-3 rounded-2xl border border-amber-400/20">
                                        <Clock size={18} />
                                        <span className="text-sm font-bold">Menunggu Pembayaran...</span>
                                    </div>

                                    <div className="p-4 bg-white/[0.02] rounded-2xl border border-white/5">
                                        <p className="text-[10px] text-gray-500 uppercase font-bold mb-3 text-center">Cara Pembayaran</p>
                                        <ol className="text-xs text-gray-400 space-y-2 list-decimal list-inside">
                                            <li>Buka aplikasi pembayaran (Gopay, OVO, Dana, M-Banking, dll)</li>
                                            <li>Pilih menu <span className="text-white">Scan / Bayar</span></li>
                                            <li>Scan kode QR di atas</li>
                                            <li>Periksa nominal dan selesaikan pembayaran</li>
                                        </ol>
                                    </div>
                                </div>
                            </>
                        )}

                        {isPaid && (
                            <div className="w-full space-y-6 text-center">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-4 bg-white/5 rounded-2xl border border-white/10 text-left">
                                        <p className="text-[10px] text-gray-500 uppercase font-bold mb-1">Jumlah</p>
                                        <p className="font-bold">Rp {paymentData.amount.toLocaleString('id-ID')}</p>
                                    </div>
                                    <div className="p-4 bg-white/5 rounded-2xl border border-white/10 text-left">
                                        <p className="text-[10px] text-gray-500 uppercase font-bold mb-1">Waktu</p>
                                        <p className="font-bold text-xs">{new Date(paymentData.updatedAt).toLocaleTimeString()}</p>
                                    </div>
                                </div>
                                <p className="text-gray-400 text-sm">
                                    Pembayaran Anda telah kami terima. Anda dapat menutup halaman ini.
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="p-6 bg-white/5 border-t border-white/5 flex items-center justify-center gap-2 text-gray-500">
                        <ShieldCheck size={16} />
                        <span className="text-[10px] font-bold uppercase tracking-widest">Verified by SawargiPay</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
