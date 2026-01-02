'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  LayoutDashboard, CreditCard, History, Settings, LogOut,
  ExternalLink, QrCode, Loader2, Wallet, Copy, CheckCircle2,
  Terminal, ShieldCheck, Key, RefreshCw, Menu, X, User, Edit2, Save, Eye as EyeIcon, EyeOff, Camera
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { ToastContainer, ToastType } from '@/components/Toast';

export default function DashboardPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('overview');
  const [showQR, setShowQR] = useState(false);
  const [merchant, setMerchant] = useState<any>(null);
  const [qrisData, setQrisData] = useState<any>(null);
  const [inputAmount, setInputAmount] = useState<string>('1000');
  const [generating, setGenerating] = useState(false);
  const [toasts, setToasts] = useState<any[]>([]);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Profile & Settings State
  const [showApiKey, setShowApiKey] = useState(false);
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({
    businessName: '',
    ownerName: '',
    phone: '',
    address: '',
    profilePicture: ''
  });
  const [savingProfile, setSavingProfile] = useState(false);

  const addToast = (message: string, type: ToastType) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
  };

  const removeToast = (id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };
  const [withdrawForm, setWithdrawForm] = useState({
    amount: '',
    bankName: '',
    accountName: '',
    accountNumber: ''
  });
  const [copied, setCopied] = useState<string | null>(null);
  const [stats, setStats] = useState<any[]>([
    { label: 'Total Transaksi', value: 'Rp 0', trend: '+0%' },
    { label: 'Transaksi Hari Ini', value: 'Rp 0', trend: '+0%' },
    { label: 'Merchant Status', value: 'Active', color: 'text-emerald-400' },
  ]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingWithdrawals, setLoadingWithdrawals] = useState(false);
  const [withdrawals, setWithdrawals] = useState<any[]>([]);

  useEffect(() => {
    const savedMerchant = localStorage.getItem('merchant');
    if (!savedMerchant) {
      router.push('/login');
      return;
    }
    const parsed = JSON.parse(savedMerchant);
    setMerchant(parsed);
    fetchProfile(parsed.id);
    fetchStats(parsed.id);

    if (activeTab === 'withdraw') {
      fetchWithdrawals(parsed.id);
    }
  }, [router, activeTab]);

  const fetchWithdrawals = async (id: string) => {
    setLoadingWithdrawals(true);
    try {
      const res = await fetch(`/api/merchant/withdraw?merchantId=${id}&t=${Date.now()}`);
      const result = await res.json();
      if (result.success) {
        setWithdrawals(result.data);
      }
    } catch (err) {
      console.error('Failed to fetch withdrawals');
    } finally {
      setLoadingWithdrawals(false);
    }
  };

  const fetchStats = async (id: string) => {
    setLoadingStats(true);
    try {
      const res = await fetch(`/api/merchant/stats?merchantId=${id}&t=${Date.now()}`);
      const result = await res.json();
      if (result.success) {
        setStats(result.data.stats);
        setTransactions(result.data.transactions);
      }
    } catch (err) {
      console.error('Failed to fetch stats');
    } finally {
      setLoadingStats(false);
    }
  };



  const fetchProfile = async (id: string) => {
    try {
      const res = await fetch(`/api/merchant/profile?id=${id}`);
      const result = await res.json();
      if (result.success) {
        setMerchant(result.data);
        localStorage.setItem('merchant', JSON.stringify(result.data));
        setProfileForm({
          businessName: result.data.businessName || '',
          ownerName: result.data.ownerName || '',
          phone: result.data.application?.phone || '',
          address: result.data.application?.address || '',
          profilePicture: result.data.profilePicture || ''
        });
      }
    } catch (err) {
      console.error('Failed to fetch profile');
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 500000) { // 500KB limit
        addToast('Ukuran gambar maksimal 500KB', 'error');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileForm(prev => ({ ...prev, profilePicture: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const res = await fetch('/api/merchant/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: merchant.id,
          ...profileForm
        })
      });
      const result = await res.json();
      if (result.success) {
        setMerchant(result.data);
        localStorage.setItem('merchant', JSON.stringify(result.data));
        setEditingProfile(false);
        addToast('Profil berhasil diperbarui!', 'success');
      } else {
        addToast(result.error || 'Gagal memperbarui profil', 'error');
      }
    } catch (err) {
      addToast('Terjadi kesalahan koneksi', 'error');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleGenerateQRIS = async () => {
    if (!merchant) return;
    setGenerating(true);
    setShowQR(true);
    try {
      const res = await fetch('/api/merchant/qris', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          merchantId: merchant.id,
          amount: parseInt(inputAmount) || 1000
        }),
      });
      const result = await res.json();
      if (result.success) {
        setQrisData(result.data);
        fetchStats(merchant.id);
        addToast('QRIS berhasil dibuat!', 'success');
      } else {
        addToast(result.error || 'Gagal generate QRIS', 'error');
        setShowQR(false);
      }
    } catch (err) {
      addToast('Terjadi kesalahan koneksi', 'error');
      setShowQR(false);
    } finally {
      setGenerating(false);
    }
  };

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!merchant) return;

    if (parseInt(withdrawForm.amount) < 20000) {
      alert('Minimal penarikan adalah Rp 20.000');
      return;
    }

    try {
      const res = await fetch('/api/merchant/withdraw', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          merchantId: merchant.id,
          ...withdrawForm
        }),
      });
      const result = await res.json();
      if (result.success) {
        addToast('Permintaan penarikan berhasil dikirim!', 'success');
        setWithdrawForm({ amount: '', bankName: '', accountName: '', accountNumber: '' });
        fetchWithdrawals(merchant.id);
      } else {
        addToast(result.error || 'Gagal mengirim permintaan withdraw', 'error');
      }
    } catch (err) {
      addToast('Terjadi kesalahan koneksi', 'error');
    }
  };

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    addToast(`${label} berhasil disalin!`, 'info');
    setTimeout(() => setCopied(null), 2000);
  };

  const handleLogout = () => {
    localStorage.removeItem('merchant');
    router.push('/login');
  };

  return (
    <div className="flex min-h-screen bg-[#020408] text-white font-['Outfit',sans-serif]">
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 bg-[#020408]/80 backdrop-blur-xl border-b border-white/10 p-4 z-50 flex justify-between items-center">
        <span className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">SawargiPay</span>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 text-gray-400 hover:text-white">
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 bg-black/80 z-40" onClick={() => setIsMobileMenuOpen(false)} />
      )}

      {/* Sidebar (Desktop & Mobile) */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50 w-64 bg-[#0a0c10] lg:bg-white/5 backdrop-blur-xl border-r lg:border border-white/10 
        transform transition-transform duration-300 ease-in-out lg:transform-none lg:m-4 lg:rounded-3xl p-6 flex flex-col
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="text-2xl font-bold mb-12 px-4 hidden lg:block">
          <span className="bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">SawargiPay</span>
        </div>
        <nav className="flex-1 flex flex-col gap-2 mt-16 lg:mt-0">
          {[
            { id: 'overview', icon: LayoutDashboard, label: 'Overview' },
            { id: 'payments', icon: CreditCard, label: 'Payments' },
            { id: 'withdraw', icon: Wallet, label: 'Withdraw' },
            { id: 'history', icon: History, label: 'History' },
            { id: 'settings', icon: Settings, label: 'Settings' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                setIsMobileMenuOpen(false);
              }}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === item.id
                ? 'bg-cyan-400/10 text-cyan-400'
                : 'text-gray-400 hover:bg-white/5 hover:text-white'
                }`}
            >
              <item.icon size={20} /> {item.label}
            </button>
          ))}
        </nav>
        <div className="pt-6 border-t border-white/10">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-400/10 transition-all w-full"
          >
            <LogOut size={20} /> Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 lg:p-10 pt-24 lg:pt-10 overflow-y-auto">
        <header className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-3xl font-bold capitalize">{activeTab}</h1>
            <p className="text-gray-400 text-sm mt-1">
              {activeTab === 'overview' && 'Ringkasan performa bisnis Anda'}
              {activeTab === 'payments' && 'Pembuatan QRIS dan Dokumentasi API'}
              {activeTab === 'withdraw' && 'Tarik saldo ke rekening Anda'}
              {activeTab === 'history' && 'Daftar lengkap transaksi'}
              {activeTab === 'settings' && 'Pengaturan akun dan keamanan'}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-gray-400 hidden sm:inline">{merchant?.businessName || 'Loading...'}</span>
            <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center font-bold overflow-hidden">
              {merchant?.profilePicture ? (
                <img src={merchant.profilePicture} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                merchant?.businessName?.substring(0, 2).toUpperCase() || '...'
              )}
            </div>
          </div>
        </header>

        {/* Tab Contents */}
        {activeTab === 'overview' && (
          <div className="space-y-10">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {stats.map((stat, i) => (
                <div key={i} className="bg-white/5 border border-white/10 p-6 rounded-2xl">
                  <span className="text-sm text-gray-400">{stat.label}</span>
                  <div className={`text-2xl font-bold my-2 ${stat.color || ''}`}>{stat.value}</div>
                  <span className={`text-xs ${stat.trend?.startsWith('-') ? 'text-red-400' : 'text-emerald-400'}`}>
                    {stat.trend}
                  </span>
                </div>
              ))}
            </div>

            <section className="bg-white/5 border border-white/10 p-6 rounded-2xl">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">Transaksi Terakhir</h2>
                <button onClick={() => setActiveTab('history')} className="text-sm text-cyan-400 hover:underline">Lihat Semua</button>
              </div>
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="text-gray-400 text-xs uppercase tracking-wider border-b border-white/10">
                      <th className="pb-4 px-2">ID</th>
                      <th className="pb-4 px-2">Tanggal</th>
                      <th className="pb-4 px-2">Jumlah</th>
                      <th className="pb-4 px-2">Metode</th>
                      <th className="pb-4 px-2">Status</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm">
                    {transactions.slice(0, 5).map((trx) => (
                      <tr key={trx.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                        <td className="py-4 px-2">{trx.id}</td>
                        <td className="py-4 px-2">{trx.date}</td>
                        <td className="py-4 px-2 font-medium">{trx.amount}</td>
                        <td className="py-4 px-2">{trx.method}</td>
                        <td className="py-4 px-2">
                          <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${trx.status === 'Success' || trx.status === 'Completed' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'
                            }`}>
                            {trx.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card View for Overview */}
              <div className="md:hidden space-y-3">
                {transactions.slice(0, 5).map((trx) => (
                  <div key={trx.id} className="bg-white/5 p-4 rounded-xl border border-white/5 flex flex-col gap-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="text-xs text-gray-400 mb-1">{trx.date}</div>
                        <div className="font-bold text-white text-lg">{trx.amount}</div>
                      </div>
                      <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${trx.status === 'Success' || trx.status === 'Completed' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'
                        }`}>
                        {trx.status}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-xs border-t border-white/5 pt-3 mt-1">
                      <span className="font-mono text-gray-500">{trx.id}</span>
                      <span className="uppercase text-gray-400 font-bold">{trx.method}</span>
                    </div>
                  </div>
                ))}
                {transactions.length === 0 && (
                  <div className="py-8 text-center text-gray-500 text-xs">Belum ada transaksi.</div>
                )}
              </div>
            </section>
          </div>
        )}

        {activeTab === 'payments' && (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            {/* QRIS Generator */}
            <section className="bg-white/5 border border-white/10 p-6 md:p-8 rounded-3xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-cyan-400/10 rounded-xl">
                  <QrCode className="text-cyan-400" size={24} />
                </div>
                <h2 className="text-xl font-bold">Generate QRIS</h2>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="text-sm text-gray-400 mb-2 block">Jumlah Pembayaran (Rp)</label>
                  <input
                    type="number"
                    value={inputAmount}
                    onChange={(e) => setInputAmount(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 focus:border-cyan-400 outline-none transition-all text-lg font-bold"
                    placeholder="Masukkan nominal..."
                  />
                </div>

                <button
                  onClick={handleGenerateQRIS}
                  disabled={generating}
                  className="w-full bg-gradient-to-r from-cyan-400 to-purple-600 text-white py-4 rounded-xl font-bold shadow-lg hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                >
                  {generating ? <Loader2 className="animate-spin" size={20} /> : <QrCode size={20} />}
                  Generate QRIS Sekarang
                </button>

                {showQR && (
                  <div className="mt-8 p-4 md:p-8 bg-white/5 border border-white/10 rounded-2xl text-center animate-in fade-in zoom-in duration-300">
                    <h3 className="font-bold mb-6">QRIS SawargiPay</h3>
                    <div className="bg-white p-4 rounded-2xl inline-block mb-6 shadow-2xl max-w-full">
                      {qrisData?.payment_number ? (
                        <QRCodeSVG
                          value={qrisData.payment_number}
                          size={240}
                          className="w-full h-auto max-w-[240px]"
                        />
                      ) : (
                        <div className="w-[240px] h-[240px] flex items-center justify-center text-black">
                          <Loader2 className="animate-spin" size={40} />
                        </div>
                      )}
                    </div>
                    <p className="text-sm text-gray-400 mb-2 break-all">Scan untuk membayar ke {merchant?.businessName}</p>
                    {qrisData?.total_payment && (
                      <p className="text-2xl font-bold text-cyan-400 mb-6">Rp {qrisData.total_payment.toLocaleString('id-ID')}</p>
                    )}
                    <button
                      onClick={() => {
                        setShowQR(false);
                        setQrisData(null);
                      }}
                      className="text-sm text-gray-400 hover:text-white underline"
                    >
                      Tutup
                    </button>
                  </div>
                )}
              </div>
            </section>

            {/* API Docs */}
            <section className="bg-white/5 border border-white/10 p-8 rounded-3xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-purple-500/10 rounded-xl">
                  <Terminal className="text-purple-500" size={24} />
                </div>
                <h2 className="text-xl font-bold">API Documentation</h2>
              </div>

              <div className="space-y-6">
                {/* Base URL */}
                <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                  <span className="text-[10px] font-bold text-gray-500 uppercase block mb-2">Base URL</span>
                  <div className="flex justify-between items-center">
                    <code className="text-sm text-cyan-400 font-mono">
                      {process.env.NEXT_PUBLIC_BASE_URL || (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000')}
                    </code>
                    <button
                      onClick={() => handleCopy(process.env.NEXT_PUBLIC_BASE_URL || (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'), 'Base URL')}
                      className="p-2 hover:bg-white/5 rounded-lg transition-colors"
                    >
                      <Copy size={14} className="text-gray-400" />
                    </button>
                  </div>
                </div>

                {/* Create QRIS */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold text-cyan-400 uppercase">1. Create QRIS</span>
                    <span className="text-[10px] text-gray-500 font-mono">POST /api/merchant/qris</span>
                  </div>

                  <div className="bg-black/40 rounded-xl border border-white/5 overflow-hidden">
                    <div className="px-4 py-2 bg-white/5 border-b border-white/5 flex justify-between items-center">
                      <span className="text-[10px] text-gray-500 font-bold uppercase">JSON Payload</span>
                    </div>
                    <pre className="p-4 text-[11px] font-mono text-gray-300 overflow-x-auto">
                      {`{
  "merchantId": "${merchant?.id || 'YOUR_ID'}",
  "amount": 10000
}`}
                    </pre>
                  </div>

                  <div className="bg-black/40 rounded-xl border border-white/5 overflow-hidden">
                    <div className="px-4 py-2 bg-white/5 border-b border-white/5 flex justify-between items-center">
                      <span className="text-[10px] text-gray-500 font-bold uppercase">cURL Example</span>
                      <button
                        onClick={() => handleCopy(`curl -X POST ${process.env.NEXT_PUBLIC_BASE_URL || (typeof window !== 'undefined' ? window.location.origin : '')}/api/merchant/qris \\
-H "Content-Type: application/json" \\
-d '{"merchantId": "${merchant?.id}", "amount": 10000}'`, 'cURL')}
                        className="p-1 hover:bg-white/10 rounded transition-colors"
                      >
                        <Copy size={12} className="text-gray-400" />
                      </button>
                    </div>
                    <pre className="p-4 text-[11px] font-mono text-gray-300 overflow-x-auto whitespace-pre-wrap">
                      {`curl -X POST ${process.env.NEXT_PUBLIC_BASE_URL || (typeof window !== 'undefined' ? window.location.origin : '')}/api/merchant/qris \\
  -H "Content-Type: application/json" \\
  -d '{"merchantId": "${merchant?.id}", "amount": 10000}'`}
                    </pre>
                  </div>
                </div>

                {/* Check Status */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold text-purple-400 uppercase">2. Check Payment Status</span>
                    <span className="text-[10px] text-gray-500 font-mono">GET /api/merchant/payment-status</span>
                  </div>

                  <div className="bg-black/40 rounded-xl border border-white/5 overflow-hidden">
                    <div className="px-4 py-2 bg-white/5 border-b border-white/5 flex justify-between items-center">
                      <span className="text-[10px] text-gray-500 font-bold uppercase">Query Parameters</span>
                    </div>
                    <pre className="p-4 text-[11px] font-mono text-gray-300 overflow-x-auto">
                      {`?merchantId=${merchant?.id || 'YOUR_ID'}
&orderId=INV-123456789`}
                    </pre>
                  </div>

                  <div className="bg-black/40 rounded-xl border border-white/5 overflow-hidden">
                    <div className="px-4 py-2 bg-white/5 border-b border-white/5 flex justify-between items-center">
                      <span className="text-[10px] text-gray-500 font-bold uppercase">cURL Example</span>
                      <button
                        onClick={() => handleCopy(`curl -X GET "${process.env.NEXT_PUBLIC_BASE_URL || (typeof window !== 'undefined' ? window.location.origin : '')}/api/merchant/payment-status?merchantId=${merchant?.id}&orderId=INV-XXXXX"`, 'cURL')}
                        className="p-1 hover:bg-white/10 rounded transition-colors"
                      >
                        <Copy size={12} className="text-gray-400" />
                      </button>
                    </div>
                    <pre className="p-4 text-[11px] font-mono text-gray-300 overflow-x-auto whitespace-pre-wrap">
                      {`curl -X GET "${process.env.NEXT_PUBLIC_BASE_URL || (typeof window !== 'undefined' ? window.location.origin : '')}/api/merchant/payment-status?merchantId=${merchant?.id}&orderId=INV-XXXXX"`}
                    </pre>
                  </div>
                </div>

                <div className="bg-cyan-400/5 border border-cyan-400/20 p-4 rounded-xl">
                  <p className="text-xs text-cyan-400 leading-relaxed">
                    Gunakan endpoint ini untuk mengecek apakah pembayaran dengan ID tertentu sudah lunas (SUCCESS/COMPLETED) atau belum.
                  </p>
                </div>

                {/* Security (SHA256) */}
                <div className="space-y-3 pt-6 border-t border-white/10">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold text-emerald-400 uppercase">3. Security (SHA256 Signature)</span>
                    <span className="text-[10px] text-gray-500 font-mono"><ShieldCheck size={12} className="inline mr-1" /> HMAC-SHA256</span>
                  </div>

                  <div className="bg-emerald-500/5 border border-emerald-500/20 p-4 rounded-xl mb-2">
                    <p className="text-xs text-emerald-400 leading-relaxed">
                      Untuk keamanan ekstra, Anda dapat memverifikasi integritas data menggunakan HMAC-SHA256.
                      Gunakan <strong>API Key</strong> Anda sebagai secret key.
                    </p>
                  </div>

                  <div className="bg-black/40 rounded-xl border border-white/5 overflow-hidden">
                    <div className="px-4 py-2 bg-white/5 border-b border-white/5 flex justify-between items-center">
                      <span className="text-[10px] text-gray-500 font-bold uppercase">Node.js Example</span>
                    </div>
                    <pre className="p-4 text-[11px] font-mono text-gray-300 overflow-x-auto whitespace-pre-wrap">
                      {`const crypto = require('crypto');

function generateSignature(payload, secretKey) {
  // Sort keys alphabetically
  const sortedKeys = Object.keys(payload).sort();
  const sortedPayload = {};
  sortedKeys.forEach(key => {
    if (key !== 'signature') sortedPayload[key] = payload[key];
  });

  const data = JSON.stringify(sortedPayload);
  return crypto.createHmac('sha256', secretKey).update(data).digest('hex');
}`}
                    </pre>
                  </div>
                </div>
              </div>
            </section>
          </div>
        )}

        {activeTab === 'withdraw' && (
          <div className="max-w-2xl mx-auto space-y-8">
            <section className="bg-white/5 border border-white/10 p-8 rounded-3xl">
              <div className="flex items-center gap-3 mb-8">
                <div className="p-3 bg-emerald-500/10 rounded-xl">
                  <Wallet className="text-emerald-500" size={24} />
                </div>
                <h2 className="text-xl font-bold">Penarikan Saldo</h2>
              </div>

              <form onSubmit={handleWithdraw} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm text-gray-400 mb-2 block">Bank / E-Wallet</label>
                    <select
                      required
                      value={withdrawForm.bankName}
                      onChange={(e) => setWithdrawForm({ ...withdrawForm, bankName: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:border-cyan-400 outline-none transition-all text-sm"
                    >
                      <option value="" className="bg-[#0a0c10]">Pilih Bank/E-Wallet</option>
                      <option value="BCA" className="bg-[#0a0c10]">BCA</option>
                      <option value="Seabank" className="bg-[#0a0c10]">Seabank</option>
                      <option value="Jago" className="bg-[#0a0c10]">Bank Jago</option>
                      <option value="Dana" className="bg-[#0a0c10]">DANA</option>
                      <option value="Gopay" className="bg-[#0a0c10]">GoPay</option>
                      <option value="OVO" className="bg-[#0a0c10]">OVO</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm text-gray-400 mb-2 block">Jumlah (Min. 20.000)</label>
                    <input
                      type="number"
                      required
                      min="20000"
                      value={withdrawForm.amount}
                      onChange={(e) => setWithdrawForm({ ...withdrawForm, amount: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:border-cyan-400 outline-none transition-all text-sm"
                      placeholder="0"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm text-gray-400 mb-2 block">Nomor Rekening / HP</label>
                  <input
                    type="text"
                    required
                    value={withdrawForm.accountNumber}
                    onChange={(e) => setWithdrawForm({ ...withdrawForm, accountNumber: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:border-cyan-400 outline-none transition-all text-sm"
                    placeholder="Contoh: 1234567890"
                  />
                </div>

                <div>
                  <label className="text-sm text-gray-400 mb-2 block">Nama Pemilik Rekening</label>
                  <input
                    type="text"
                    required
                    value={withdrawForm.accountName}
                    onChange={(e) => setWithdrawForm({ ...withdrawForm, accountName: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:border-cyan-400 outline-none transition-all text-sm"
                    placeholder="Nama sesuai buku tabungan"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-emerald-500 text-white py-4 rounded-xl font-bold shadow-lg hover:bg-emerald-600 transition-all flex items-center justify-center gap-2"
                >
                  <CheckCircle2 size={20} />
                  Kirim Permintaan Withdraw
                </button>
              </form>
            </section>

            {/* Withdrawal History */}
            <section className="bg-white/5 border border-white/10 p-8 rounded-3xl">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold">Riwayat Penarikan</h3>
                <button
                  onClick={() => fetchWithdrawals(merchant?.id)}
                  disabled={loadingWithdrawals}
                  className="flex items-center gap-2 text-xs text-cyan-400 hover:text-cyan-300 transition-colors disabled:opacity-50"
                >
                  <RefreshCw size={14} className={loadingWithdrawals ? "animate-spin" : ""} /> Refresh
                </button>
              </div>
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="text-gray-400 text-xs uppercase tracking-wider border-b border-white/10">
                      <th className="pb-4 px-2">Tanggal</th>
                      <th className="pb-4 px-2">Jumlah</th>
                      <th className="pb-4 px-2">Tujuan</th>
                      <th className="pb-4 px-2">Status</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm">
                    {withdrawals.map((w) => (
                      <tr key={w.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                        <td className="py-4 px-2 text-gray-400 text-xs">
                          {new Date(w.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </td>
                        <td className="py-4 px-2 font-bold text-cyan-400">Rp {w.amount.toLocaleString('id-ID')}</td>
                        <td className="py-4 px-2">
                          <div className="font-bold text-xs">{w.bankName}</div>
                          <div className="text-[10px] text-gray-500">{w.accountNumber}</div>
                        </td>
                        <td className="py-4 px-2">
                          <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${w.status === 'COMPLETED' ? 'bg-emerald-500/10 text-emerald-400' :
                            w.status === 'REJECTED' ? 'bg-red-500/10 text-red-400' :
                              'bg-amber-500/10 text-amber-400'
                            }`}>
                            {w.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                    {withdrawals.length === 0 && (
                      <tr>
                        <td colSpan={4} className="py-8 text-center text-gray-500 text-xs">Belum ada riwayat penarikan.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card View for Withdrawals */}
              <div className="md:hidden space-y-3">
                {withdrawals.map((w) => (
                  <div key={w.id} className="bg-white/5 p-4 rounded-xl border border-white/5 flex flex-col gap-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="text-xs text-gray-400 mb-1">
                          {new Date(w.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </div>
                        <div className="font-bold text-cyan-400 text-lg">Rp {w.amount.toLocaleString('id-ID')}</div>
                      </div>
                      <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${w.status === 'COMPLETED' ? 'bg-emerald-500/10 text-emerald-400' :
                        w.status === 'REJECTED' ? 'bg-red-500/10 text-red-400' :
                          'bg-amber-500/10 text-amber-400'
                        }`}>
                        {w.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-black/20 rounded-lg">
                      <div className="p-2 bg-white/5 rounded-full">
                        <Wallet size={16} className="text-gray-400" />
                      </div>
                      <div>
                        <div className="font-bold text-sm">{w.bankName}</div>
                        <div className="text-xs text-gray-500">{w.accountNumber}</div>
                      </div>
                    </div>
                  </div>
                ))}
                {withdrawals.length === 0 && (
                  <div className="py-8 text-center text-gray-500 text-xs">Belum ada riwayat penarikan.</div>
                )}
              </div>
            </section>
          </div>
        )}

        {activeTab === 'history' && (
          <section className="bg-white/5 border border-white/10 p-8 rounded-3xl">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-xl font-bold">Riwayat Transaksi Lengkap</h2>
              <button
                onClick={() => fetchStats(merchant?.id)}
                disabled={loadingStats}
                className="flex items-center gap-2 text-sm text-cyan-400 hover:text-cyan-300 transition-colors disabled:opacity-50"
              >
                <RefreshCw size={16} className={loadingStats ? "animate-spin" : ""} /> Refresh
              </button>
            </div>
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-gray-400 text-xs uppercase tracking-wider border-b border-white/10">
                    <th className="pb-4 px-2">ID Transaksi</th>
                    <th className="pb-4 px-2">Tanggal & Waktu</th>
                    <th className="pb-4 px-2">Jumlah</th>
                    <th className="pb-4 px-2">Metode</th>
                    <th className="pb-4 px-2">Status</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {transactions.map((trx) => (
                    <tr key={trx.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                      <td className="py-5 px-2 font-mono text-xs">{trx.id}</td>
                      <td className="py-5 px-2 text-gray-400">{trx.date}</td>
                      <td className="py-5 px-2 font-bold">{trx.amount}</td>
                      <td className="py-5 px-2 uppercase text-xs text-gray-400">{trx.method}</td>
                      <td className="py-5 px-2">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${trx.status === 'Success' || trx.status === 'Completed' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                          'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          }`}>
                          {trx.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {transactions.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-20 text-center text-gray-500">Belum ada transaksi.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View for Full History */}
            <div className="md:hidden space-y-3">
              {transactions.map((trx) => (
                <div key={trx.id} className="bg-white/5 p-4 rounded-xl border border-white/5 flex flex-col gap-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="text-xs text-gray-400 mb-1">{trx.date}</div>
                      <div className="font-bold text-white text-lg">{trx.amount}</div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${trx.status === 'Success' || trx.status === 'Completed' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                      'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                      }`}>
                      {trx.status}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-xs border-t border-white/5 pt-3 mt-1">
                    <span className="font-mono text-gray-500">{trx.id}</span>
                    <span className="uppercase text-gray-400 font-bold">{trx.method}</span>
                  </div>
                </div>
              ))}
              {transactions.length === 0 && (
                <div className="py-20 text-center text-gray-500">Belum ada transaksi.</div>
              )}
            </div>
          </section>
        )}

        {activeTab === 'settings' && (
          <div className="max-w-3xl space-y-8">
            {/* Profile Settings */}
            <section className="bg-white/5 border border-white/10 p-6 md:p-8 rounded-3xl">
              <div className="flex justify-between items-center mb-8">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-cyan-400/10 rounded-xl">
                    <User className="text-cyan-400" size={24} />
                  </div>
                  <h2 className="text-xl font-bold">Profil Merchant</h2>
                </div>
                {!editingProfile && (
                  <button
                    onClick={() => setEditingProfile(true)}
                    className="flex items-center gap-2 text-sm text-cyan-400 hover:text-cyan-300 transition-colors"
                  >
                    <Edit2 size={16} /> Edit Profil
                  </button>
                )}
              </div>

              {editingProfile ? (
                <form onSubmit={handleSaveProfile} className="space-y-6">
                  <div className="flex justify-center mb-6">
                    <div className="relative group">
                      <div className="w-24 h-24 rounded-full overflow-hidden bg-white/10 border-2 border-white/20">
                        {profileForm.profilePicture ? (
                          <img src={profileForm.profilePicture} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400">
                            <User size={40} />
                          </div>
                        )}
                      </div>
                      <label className="absolute bottom-0 right-0 p-2 bg-cyan-400 rounded-full cursor-pointer hover:bg-cyan-300 transition-colors shadow-lg">
                        <Camera size={16} className="text-black" />
                        <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                      </label>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="text-sm text-gray-400 mb-2 block">Nama Bisnis</label>
                      <input
                        type="text"
                        value={profileForm.businessName}
                        onChange={(e) => setProfileForm({ ...profileForm, businessName: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:border-cyan-400 outline-none transition-all"
                      />
                    </div>
                    <div>
                      <label className="text-sm text-gray-400 mb-2 block">Nama Pemilik</label>
                      <input
                        type="text"
                        value={profileForm.ownerName}
                        onChange={(e) => setProfileForm({ ...profileForm, ownerName: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:border-cyan-400 outline-none transition-all"
                      />
                    </div>
                    <div>
                      <label className="text-sm text-gray-400 mb-2 block">Nomor WhatsApp</label>
                      <input
                        type="text"
                        value={profileForm.phone}
                        onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:border-cyan-400 outline-none transition-all"
                      />
                    </div>
                    <div>
                      <label className="text-sm text-gray-400 mb-2 block">Alamat</label>
                      <input
                        type="text"
                        value={profileForm.address}
                        onChange={(e) => setProfileForm({ ...profileForm, address: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:border-cyan-400 outline-none transition-all"
                      />
                    </div>
                  </div>
                  <div className="flex gap-3 justify-end">
                    <button
                      type="button"
                      onClick={() => setEditingProfile(false)}
                      className="px-6 py-3 rounded-xl text-gray-400 hover:bg-white/5 transition-all"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      disabled={savingProfile}
                      className="bg-gradient-to-r from-cyan-400 to-purple-600 text-white px-8 py-3 rounded-xl font-bold shadow-lg hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-2 disabled:opacity-50"
                    >
                      {savingProfile ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                      Simpan Perubahan
                    </button>
                  </div>
                </form>
              ) : (
                <div className="flex flex-col md:flex-row gap-8 items-start">
                  <div className="w-24 h-24 rounded-full overflow-hidden bg-white/10 border-2 border-white/20 shrink-0">
                    {merchant?.profilePicture ? (
                      <img src={merchant.profilePicture} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <User size={40} />
                      </div>
                    )}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 flex-1 w-full">
                    <div>
                      <span className="text-xs text-gray-500 uppercase font-bold block mb-1">Nama Bisnis</span>
                      <div className="text-lg font-bold">{merchant?.businessName}</div>
                    </div>
                    <div>
                      <span className="text-xs text-gray-500 uppercase font-bold block mb-1">Nama Pemilik</span>
                      <div className="text-lg font-bold">{merchant?.ownerName}</div>
                    </div>
                    <div>
                      <span className="text-xs text-gray-500 uppercase font-bold block mb-1">Nomor WhatsApp</span>
                      <div className="text-lg font-bold">{merchant?.application?.phone || '-'}</div>
                    </div>
                    <div>
                      <span className="text-xs text-gray-500 uppercase font-bold block mb-1">Alamat</span>
                      <div className="text-lg font-bold">{merchant?.application?.address || '-'}</div>
                    </div>
                    <div>
                      <span className="text-xs text-gray-500 uppercase font-bold block mb-1">Email</span>
                      <div className="text-lg font-bold text-gray-400">{merchant?.email}</div>
                    </div>
                    <div>
                      <span className="text-xs text-gray-500 uppercase font-bold block mb-1">Tipe Bisnis</span>
                      <div className="text-lg font-bold capitalize">{merchant?.application?.businessType || '-'}</div>
                    </div>
                  </div>
                </div>
              )}
            </section>

            {/* Security & API */}
            <section className="bg-white/5 border border-white/10 p-6 md:p-8 rounded-3xl">
              <div className="flex items-center gap-3 mb-8">
                <div className="p-3 bg-purple-500/10 rounded-xl">
                  <ShieldCheck className="text-purple-500" size={24} />
                </div>
                <h2 className="text-xl font-bold">Keamanan & API</h2>
              </div>

              <div className="space-y-8">
                <div className="flex flex-col gap-4">
                  <div className="flex justify-between items-end">
                    <div>
                      <span className="text-xs text-gray-500 uppercase font-bold flex items-center gap-2">
                        <Key size={12} /> Merchant Identifier
                      </span>
                      <div className="mt-2 text-lg font-mono font-bold text-cyan-400 break-all">
                        {merchant?.merchantId || 'Not set'}
                      </div>
                    </div>
                    <button
                      onClick={() => handleCopy(merchant?.merchantId, 'merchant_id')}
                      className="text-xs text-gray-400 hover:text-white flex items-center gap-1 shrink-0"
                    >
                      {copied === 'merchant_id' ? <CheckCircle2 size={14} className="text-emerald-400" /> : <Copy size={14} />}
                      {copied === 'merchant_id' ? 'Copied!' : 'Copy'}
                    </button>
                  </div>

                  <div className="h-px bg-white/5" />

                  <div className="flex justify-between items-end">
                    <div className="flex-1 mr-4">
                      <span className="text-xs text-gray-500 uppercase font-bold flex items-center gap-2">
                        <Key size={12} /> API Key
                      </span>
                      <div className="mt-2 text-lg font-mono text-gray-400 break-all">
                        {showApiKey ? (merchant?.apiKey || 'Not generated') : '••••••••••••••••••••••••••••••••'}
                      </div>
                    </div>
                    <button
                      onClick={() => setShowApiKey(!showApiKey)}
                      className="text-xs text-gray-400 hover:text-white flex items-center gap-1 shrink-0"
                    >
                      {showApiKey ? <EyeOff size={14} /> : <EyeIcon size={14} />}
                      {showApiKey ? 'Hide' : 'View'}
                    </button>
                  </div>
                </div>

                <div className="p-6 bg-amber-500/5 border border-amber-500/20 rounded-2xl">
                  <h4 className="text-sm font-bold text-amber-500 mb-2">Peringatan Keamanan</h4>
                  <p className="text-xs text-gray-400 leading-relaxed">
                    Jangan pernah memberikan API Key Anda kepada siapapun. Tim SawargiPay tidak pernah meminta API Key Anda. Gunakan API Key hanya di sisi server (backend) aplikasi Anda.
                  </p>
                </div>
              </div>
            </section>
          </div>
        )}
      </main>
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  );
}

function Eye({ size, className }: { size: number, className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}
