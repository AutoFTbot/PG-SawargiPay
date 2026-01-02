'use client';

import React from 'react';
import Link from 'next/link';
import { Shield, Zap, CreditCard, ArrowRight } from 'lucide-react';

export default function LandingPage() {
  const [stats, setStats] = React.useState({
    activeMerchants: 0,
    totalTransactions: 0,
    totalVolume: 0,
    recentTransaction: null as any
  });

  React.useEffect(() => {
    fetch('/api/public/stats')
      .then(res => res.json())
      .then(res => {
        if (res.success) {
          setStats(res.data);
        }
      })
      .catch(err => console.error(err));
  }, []);

  return (
    <main className="min-h-screen bg-[#05070a] text-white font-['Outfit',sans-serif]">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        {/* Background Glow */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-cyan-500/20 blur-[100px] rounded-full -z-10" />
        <div className="absolute top-1/2 -left-24 w-72 h-72 bg-purple-600/10 blur-[80px] rounded-full -z-10" />

        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center mb-16">
            <h1 className="text-4xl md:text-7xl font-extrabold leading-tight mb-6">
              Solusi <span className="bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">SawargiPay</span> Modern untuk Bisnis Anda
            </h1>
            <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto">
              Terima pembayaran QRIS, Virtual Account, dan lainnya dengan mudah. Proses pendaftaran cepat dan transparan melalui ekosistem sawargipay.
            </p>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-8 mb-12 max-w-3xl mx-auto">
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
                <div className="text-2xl md:text-3xl font-bold text-cyan-400 mb-1">
                  {stats.activeMerchants > 0 ? stats.activeMerchants + '+' : '-'}
                </div>
                <div className="text-xs text-gray-400 uppercase tracking-wider">Active Merchants</div>
              </div>
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
                <div className="text-2xl md:text-3xl font-bold text-purple-400 mb-1">
                  {stats.totalTransactions > 0 ? stats.totalTransactions + '+' : '-'}
                </div>
                <div className="text-xs text-gray-400 uppercase tracking-wider">Total Transaksi</div>
              </div>
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm col-span-2 md:col-span-1">
                <div className="text-2xl md:text-3xl font-bold text-emerald-400 mb-1">
                  {stats.totalVolume > 0 ? 'Rp ' + (stats.totalVolume / 1000000).toFixed(1) + 'M+' : '-'}
                </div>
                <div className="text-xs text-gray-400 uppercase tracking-wider">Total Volume</div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/register" className="bg-gradient-to-r from-cyan-400 to-purple-600 text-white px-8 py-4 rounded-xl font-bold shadow-[0_0_20px_rgba(34,211,238,0.3)] hover:scale-105 transition-all flex items-center justify-center">
                Daftar Merchant Sekarang <ArrowRight size={18} className="ml-2" />
              </Link>
              <Link href="/login" className="px-8 py-4 rounded-xl font-bold bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-center">
                Merchant Login
              </Link>
            </div>
          </div>

          <div className="flex justify-center mt-10">
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-6 w-80 rounded-2xl shadow-2xl animate-bounce-slow relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 to-purple-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-5 text-sm text-gray-400">
                  <div className="p-2 bg-cyan-400/20 rounded-lg">
                    <CreditCard className="text-cyan-400" size={20} />
                  </div>
                  <span>Live Transaction</span>
                </div>
                {stats.recentTransaction ? (
                  <>
                    <div className="text-3xl font-bold mb-2">Rp {stats.recentTransaction.amount.toLocaleString('id-ID')}</div>
                    <div className="flex justify-between items-end text-xs">
                      <div>
                        <div className="text-gray-500 mb-1">Merchant</div>
                        <div className="font-bold text-cyan-400">{stats.recentTransaction.merchantName}</div>
                      </div>
                      <span className="bg-emerald-500/10 text-emerald-400 px-2 py-1 rounded border border-emerald-500/20">Success</span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="text-3xl font-bold mb-5">Rp 150.000</div>
                    <div className="flex justify-between text-xs">
                      <span>Merchant: Toko Berkah</span>
                      <span className="bg-emerald-500/10 text-emerald-400 px-2 py-1 rounded">Example</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24">
        <div className="container mx-auto px-6">
          <h2 className="text-4xl font-bold text-center mb-16">Mengapa Memilih SawargiPay?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-10 rounded-2xl transition-transform hover:-translate-y-2">
              <Zap className="w-12 h-12 mb-6 text-cyan-400" />
              <h3 className="text-2xl font-bold mb-4">Aktivasi Cepat</h3>
              <p className="text-gray-400">Proses pengajuan merchant yang simpel. Kami bantu proses pembuatan QRIS Anda secara manual di sistem sawargipay.</p>
            </div>
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-10 rounded-2xl transition-transform hover:-translate-y-2">
              <Shield className="w-12 h-12 mb-6 text-purple-500" />
              <h3 className="text-2xl font-bold mb-4">Aman & Terpercaya</h3>
              <p className="text-gray-400">Didukung oleh infrastruktur sawargipay yang handal dan sistem keamanan tingkat tinggi.</p>
            </div>
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-10 rounded-2xl transition-transform hover:-translate-y-2">
              <CreditCard className="w-12 h-12 mb-6 text-pink-500" />
              <h3 className="text-2xl font-bold mb-4">Multi Metode</h3>
              <p className="text-gray-400">Mendukung QRIS, Berbagai Bank Virtual Account, dan metode pembayaran populer lainnya.</p>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-24 bg-white/[0.02]">
        <div className="container mx-auto px-6">
          <h2 className="text-4xl font-bold text-center mb-16">Cara Bergabung</h2>
          <div className="flex flex-wrap justify-between gap-10">
            <div className="flex-1 min-w-[250px] text-center">
              <div className="w-12 h-12 bg-gradient-to-br from-cyan-400 to-purple-600 rounded-full flex items-center justify-center font-bold text-xl mx-auto mb-6 shadow-[0_0_15px_rgba(34,211,238,0.4)]">1</div>
              <h4 className="text-xl font-bold mb-3">Daftar</h4>
              <p className="text-gray-400">Isi formulir pendaftaran merchant dengan data bisnis Anda.</p>
            </div>
            <div className="flex-1 min-w-[250px] text-center">
              <div className="w-12 h-12 bg-gradient-to-br from-cyan-400 to-purple-600 rounded-full flex items-center justify-center font-bold text-xl mx-auto mb-6 shadow-[0_0_15px_rgba(34,211,238,0.4)]">2</div>
              <h4 className="text-xl font-bold mb-3">Verifikasi</h4>
              <p className="text-gray-400">Tim kami akan meninjau data Anda dan memproses pembuatan merchant di sawargipay.</p>
            </div>
            <div className="flex-1 min-w-[250px] text-center">
              <div className="w-12 h-12 bg-gradient-to-br from-cyan-400 to-purple-600 rounded-full flex items-center justify-center font-bold text-xl mx-auto mb-6 shadow-[0_0_15px_rgba(34,211,238,0.4)]">3</div>
              <h4 className="text-xl font-bold mb-3">Mulai Jualan</h4>
              <p className="text-gray-400">Setelah disetujui, Anda bisa langsung menerima pembayaran dari pelanggan.</p>
            </div>
          </div>
        </div>
      </section>
      {/* Footer */}
      <footer className="py-12 border-t border-white/5 bg-black/20">
        <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-xl font-bold">
            <span className="bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">SawargiPay</span>
          </div>
          <div className="text-gray-500 text-sm">
            &copy; {new Date().getFullYear()} SawargiPay. Powered by Pakasir.
          </div>
        </div>
      </footer>
    </main>
  );
}
