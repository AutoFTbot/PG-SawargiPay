'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
    Users, FileText, Check, X, Eye, ExternalLink, LogOut,
    Loader2, Settings as SettingsIcon, Save, Wallet,
    Clock, CheckCircle2, AlertCircle, Menu
} from 'lucide-react';
import { ToastContainer, ToastType } from '@/components/Toast';

export default function AdminPage() {
    const router = useRouter();
    const [isAuth, setIsAuth] = useState(false);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('merchants');
    const [applications, setApplications] = useState<any[]>([]);
    const [withdrawals, setWithdrawals] = useState<any[]>([]);
    const [editingMerchant, setEditingMerchant] = useState<any>(null);
    const [settingsForm, setSettingsForm] = useState({ apiKey: '', merchantId: '' });
    const [saving, setSaving] = useState(false);
    const [toasts, setToasts] = useState<any[]>([]);
    const [confirmAction, setConfirmAction] = useState<{ message: string, type: 'danger' | 'success', onConfirm: () => void } | null>(null);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const addToast = (message: string, type: ToastType) => {
        const id = Date.now();
        setToasts((prev) => [...prev, { id, message, type }]);
    };

    const removeToast = (id: number) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    };

    useEffect(() => {
        // Middleware handles protection now
        setIsAuth(true);
        fetchApplications();
        fetchWithdrawals();
    }, []);

    const handleLogout = async () => {
        await fetch('/api/admin/logout', { method: 'POST' });
        router.push('/admin/login');
        router.refresh();
    };

    const fetchApplications = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/applications');
            const result = await res.json();
            if (result.success) {
                setApplications(result.data);
            }
        } catch (err) {
            console.error('Fetch error:', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchWithdrawals = async () => {
        try {
            const res = await fetch('/api/admin/withdrawals');
            const result = await res.json();
            if (result.success) {
                setWithdrawals(result.data);
            }
        } catch (err) {
            console.error('Fetch withdrawals error:', err);
        }
    };

    const handleUpdateStatus = async (id: string, status: string) => {
        try {
            const res = await fetch('/api/admin/applications', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, status }),
            });
            const result = await res.json();
            if (result.success) {
                setApplications(apps => apps.map(app => app.id === id ? { ...app, status } : app));
                addToast(`Status merchant berhasil diubah ke ${status}`, 'success');
            }
        } catch (err) {
            addToast('Gagal memperbarui status.', 'error');
        }
    };

    const handleUpdateWithdrawStatus = (id: string, status: string) => {
        let message = `Apakah Anda yakin ingin mengubah status menjadi ${status}?`;
        let type: 'danger' | 'success' = 'success';

        if (status === 'COMPLETED') {
            message = `PENTING: Pastikan Anda SUDAH mentransfer dana ke rekening merchant melalui dashboard Pakasir.\n\nApakah Anda yakin ingin menandai penarikan ini sebagai SELESAI?`;
        } else if (status === 'REJECTED') {
            message = `Apakah Anda yakin ingin MENOLAK permintaan penarikan ini?`;
            type = 'danger';
        }

        setConfirmAction({
            message,
            type,
            onConfirm: async () => {
                try {
                    const res = await fetch('/api/admin/withdrawals', {
                        method: 'PATCH',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ id, status }),
                    });
                    const result = await res.json();
                    if (result.success) {
                        setWithdrawals(items => items.map(item => item.id === id ? { ...item, status } : item));
                        addToast(`Status penarikan berhasil diubah ke ${status}`, 'success');
                    }
                } catch (err) {
                    addToast('Gagal memperbarui status penarikan.', 'error');
                }
            }
        });
    };

    const handleSaveSettings = async () => {
        if (!editingMerchant) return;
        setSaving(true);
        try {
            const res = await fetch('/api/admin/applications', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: editingMerchant.merchant.id,
                    apiKey: settingsForm.apiKey,
                    merchantId: settingsForm.merchantId
                }),
            });
            const result = await res.json();
            if (result.success) {
                setApplications(apps => apps.map(app =>
                    app.id === editingMerchant.id
                        ? { ...app, merchant: { ...app.merchant, ...settingsForm } }
                        : app
                ));
                setEditingMerchant(null);
                addToast('Konfigurasi merchant berhasil disimpan!', 'success');
            }
        } catch (err) {
            addToast('Gagal menyimpan konfigurasi.', 'error');
        } finally {
            setSaving(false);
        }
    };



    if (!isAuth) return null;

    return (
        <div className="min-h-screen bg-[#05070a] text-white font-['Outfit',sans-serif]">
            {/* Mobile Header */}
            <div className="lg:hidden fixed top-0 left-0 right-0 bg-[#05070a]/80 backdrop-blur-xl border-b border-white/10 p-4 z-50 flex justify-between items-center">
                <span className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">SawargiPay Admin</span>
                <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 text-gray-400 hover:text-white">
                    {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>

            {/* Mobile Sidebar Overlay */}
            {isMobileMenuOpen && (
                <div className="lg:hidden fixed inset-0 bg-black/80 z-40" onClick={() => setIsMobileMenuOpen(false)} />
            )}

            <header className="hidden lg:block bg-white/[0.02] border-b border-white/5 py-12 mb-12">
                <div className="container mx-auto px-6 flex justify-between items-center">
                    <div>
                        <h1 className="text-4xl font-extrabold mb-2">
                            Admin <span className="bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">SawargiPay</span>
                        </h1>
                        <p className="text-gray-400">Panel manajemen merchant dan penarikan saldo.</p>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 px-4 py-2 bg-red-500/10 text-red-400 border border-red-500/20 rounded-xl hover:bg-red-500/20 transition-all"
                    >
                        <LogOut size={18} /> Logout
                    </button>
                </div>
            </header>

            <div className="container mx-auto px-6 pt-24 lg:pt-0">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    <aside className={`
                        fixed lg:static inset-y-0 left-0 z-50 w-64 lg:w-auto bg-[#0a0c10] lg:bg-transparent border-r lg:border-none border-white/10 
                        transform transition-transform duration-300 ease-in-out lg:transform-none p-6 lg:p-0 flex flex-col lg:block gap-4
                        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
                    `}>
                        <div className="lg:hidden mb-8">
                            <span className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">SawargiPay Admin</span>
                        </div>

                        <button
                            onClick={() => { setActiveTab('merchants'); setIsMobileMenuOpen(false); }}
                            className={`flex items-center gap-4 p-6 rounded-2xl border transition-all w-full ${activeTab === 'merchants'
                                ? 'bg-cyan-400/10 border-cyan-400/50 text-cyan-400'
                                : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'
                                }`}
                        >
                            <Users size={24} />
                            <div className="text-left">
                                <span className="text-xs block opacity-70">Manajemen</span>
                                <span className="text-lg font-bold">Merchants</span>
                            </div>
                        </button>

                        <button
                            onClick={() => { setActiveTab('withdrawals'); setIsMobileMenuOpen(false); }}
                            className={`flex items-center gap-4 p-6 rounded-2xl border transition-all w-full ${activeTab === 'withdrawals'
                                ? 'bg-purple-500/10 border-purple-500/50 text-purple-400'
                                : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'
                                }`}
                        >
                            <Wallet size={24} />
                            <div className="text-left">
                                <span className="text-xs block opacity-70">Permintaan</span>
                                <span className="text-lg font-bold">Withdrawals</span>
                            </div>
                        </button>

                        <div className="mt-8 p-6 bg-white/5 border border-white/10 rounded-2xl">
                            <h3 className="text-sm font-bold mb-4">Statistik Cepat</h3>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <span className="text-xs text-gray-400">Pending Merchant</span>
                                    <span className="text-sm font-bold text-amber-400">
                                        {applications.filter(a => a.status === 'PENDING').length}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-xs text-gray-400">Pending Withdraw</span>
                                    <span className="text-sm font-bold text-purple-400">
                                        {withdrawals.filter(w => w.status === 'PENDING').length}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="lg:hidden mt-auto pt-6 border-t border-white/10">
                            <button
                                onClick={handleLogout}
                                className="flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-400/10 transition-all w-full"
                            >
                                <LogOut size={20} /> Logout
                            </button>
                        </div>
                    </aside>

                    <main className="lg:col-span-3 bg-white/5 border border-white/10 p-8 rounded-3xl shadow-2xl min-h-[600px]">
                        {activeTab === 'merchants' && (
                            <>
                                <div className="flex justify-between items-center mb-8">
                                    <h2 className="text-xl font-bold">Daftar Pengajuan Merchant</h2>
                                    <button onClick={fetchApplications} className="text-cyan-400 hover:underline text-sm">Refresh</button>
                                </div>

                                {loading ? (
                                    <div className="flex justify-center py-20">
                                        <Loader2 className="animate-spin text-cyan-400" size={40} />
                                    </div>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left">
                                            <thead>
                                                <tr className="text-gray-400 text-xs uppercase tracking-wider border-b border-white/10">
                                                    <th className="pb-4 px-2">Merchant</th>
                                                    <th className="pb-4 px-2">Pemilik</th>
                                                    <th className="pb-4 px-2">Tipe</th>
                                                    <th className="pb-4 px-2">Status</th>
                                                    <th className="pb-4 px-2">Aksi</th>
                                                </tr>
                                            </thead>
                                            <tbody className="text-sm">
                                                {applications.map((app) => (
                                                    <tr key={app.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                                                        <td className="py-5 px-2 font-bold">{app.businessName}</td>
                                                        <td className="py-5 px-2 text-gray-400">{app.ownerName}</td>
                                                        <td className="py-5 px-2 text-gray-400 capitalize">{app.businessType}</td>
                                                        <td className="py-5 px-2">
                                                            <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${app.status === 'APPROVED' ? 'bg-emerald-500/10 text-emerald-400' :
                                                                app.status === 'REJECTED' ? 'bg-red-500/10 text-red-400' :
                                                                    'bg-amber-500/10 text-amber-400'
                                                                }`}>
                                                                {app.status}
                                                            </span>
                                                        </td>
                                                        <td className="py-5 px-2">
                                                            <div className="flex gap-2">
                                                                <button
                                                                    className="p-2 bg-white/5 rounded-lg hover:bg-white/10 transition-colors text-gray-400 hover:text-white"
                                                                    onClick={() => alert(`Detail:\nEmail: ${app.email}\nPhone: ${app.phone}\nAlamat: ${app.address}`)}
                                                                >
                                                                    <Eye size={18} />
                                                                </button>
                                                                {app.status === 'PENDING' && (
                                                                    <>
                                                                        <button
                                                                            onClick={() => handleUpdateStatus(app.id, 'APPROVED')}
                                                                            className="p-2 bg-emerald-500/10 rounded-lg hover:bg-emerald-500/20 transition-colors text-emerald-400"
                                                                        >
                                                                            <Check size={18} />
                                                                        </button>
                                                                        <button
                                                                            onClick={() => handleUpdateStatus(app.id, 'REJECTED')}
                                                                            className="p-2 bg-red-500/10 rounded-lg hover:bg-red-500/20 transition-colors text-red-400"
                                                                        >
                                                                            <X size={18} />
                                                                        </button>
                                                                    </>
                                                                )}
                                                                {app.status === 'APPROVED' && (
                                                                    <button
                                                                        onClick={() => {
                                                                            setEditingMerchant(app);
                                                                            setSettingsForm({
                                                                                apiKey: app.merchant?.apiKey || '',
                                                                                merchantId: app.merchant?.merchantId || ''
                                                                            });
                                                                        }}
                                                                        className="p-2 bg-purple-500/10 rounded-lg hover:bg-purple-500/20 transition-colors text-purple-400"
                                                                    >
                                                                        <SettingsIcon size={18} />
                                                                    </button>
                                                                )}
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </>
                        )}

                        {activeTab === 'withdrawals' && (
                            <>
                                <div className="flex justify-between items-center mb-8">
                                    <h2 className="text-xl font-bold">Permintaan Penarikan Saldo</h2>
                                    <button onClick={fetchWithdrawals} className="text-purple-400 hover:underline text-sm">Refresh</button>
                                </div>

                                <div className="overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead>
                                            <tr className="text-gray-400 text-xs uppercase tracking-wider border-b border-white/10">
                                                <th className="pb-4 px-2">Merchant</th>
                                                <th className="pb-4 px-2">Jumlah</th>
                                                <th className="pb-4 px-2">Rekening</th>
                                                <th className="pb-4 px-2">Status</th>
                                                <th className="pb-4 px-2">Aksi</th>
                                            </tr>
                                        </thead>
                                        <tbody className="text-sm">
                                            {withdrawals.map((w) => (
                                                <tr key={w.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                                                    <td className="py-5 px-2">
                                                        <div className="font-bold">{w.merchant.businessName}</div>
                                                        <div className="text-[10px] text-gray-500">{w.merchant.email}</div>
                                                    </td>
                                                    <td className="py-5 px-2 font-bold text-cyan-400">
                                                        Rp {w.amount.toLocaleString('id-ID')}
                                                    </td>
                                                    <td className="py-5 px-2">
                                                        <div className="text-xs font-bold">{w.bankName}</div>
                                                        <div className="text-[10px] text-gray-400">{w.accountNumber}</div>
                                                        <div className="text-[10px] text-gray-400 uppercase">{w.accountName}</div>
                                                    </td>
                                                    <td className="py-5 px-2">
                                                        <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${w.status === 'COMPLETED' ? 'bg-emerald-500/10 text-emerald-400' :
                                                            w.status === 'REJECTED' ? 'bg-red-500/10 text-red-400' :
                                                                'bg-amber-500/10 text-amber-400'
                                                            }`}>
                                                            {w.status}
                                                        </span>
                                                    </td>
                                                    <td className="py-5 px-2">
                                                        {w.status === 'PENDING' && (
                                                            <div className="flex gap-2">
                                                                <button
                                                                    onClick={() => handleUpdateWithdrawStatus(w.id, 'COMPLETED')}
                                                                    className="p-2 bg-emerald-500/10 rounded-lg hover:bg-emerald-500/20 transition-colors text-emerald-400"
                                                                    title="Selesaikan"
                                                                >
                                                                    <CheckCircle2 size={18} />
                                                                </button>
                                                                <button
                                                                    onClick={() => handleUpdateWithdrawStatus(w.id, 'REJECTED')}
                                                                    className="p-2 bg-red-500/10 rounded-lg hover:bg-red-500/20 transition-colors text-red-400"
                                                                    title="Tolak"
                                                                >
                                                                    <AlertCircle size={18} />
                                                                </button>
                                                            </div>
                                                        )}
                                                        {w.status !== 'PENDING' && (
                                                            <span className="text-gray-600 text-xs italic">No actions</span>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                            {withdrawals.length === 0 && (
                                                <tr>
                                                    <td colSpan={5} className="py-20 text-center text-gray-500">Belum ada permintaan penarikan.</td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </>
                        )}
                    </main>
                </div>
            </div>

            {/* Settings Modal */}
            {editingMerchant && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-6 z-50">
                    <div className="bg-[#0a0c10] border border-white/10 w-full max-w-md rounded-3xl p-8 shadow-2xl animate-in fade-in zoom-in duration-200">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold">Merchant Settings</h3>
                            <button onClick={() => setEditingMerchant(null)} className="text-gray-400 hover:text-white">
                                <X size={24} />
                            </button>
                        </div>
                        <div className="flex flex-col gap-5">
                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-medium text-gray-400">Merchant Identifier (Gateway)</label>
                                <input
                                    type="text"
                                    value={settingsForm.merchantId}
                                    onChange={(e) => setSettingsForm({ ...settingsForm, merchantId: e.target.value })}
                                    className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:border-cyan-400 outline-none transition-all"
                                />
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-medium text-gray-400">Gateway API Key</label>
                                <input
                                    type="password"
                                    value={settingsForm.apiKey}
                                    onChange={(e) => setSettingsForm({ ...settingsForm, apiKey: e.target.value })}
                                    className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:border-cyan-400 outline-none transition-all"
                                />
                            </div>
                            <button
                                onClick={handleSaveSettings}
                                disabled={saving}
                                className="mt-4 bg-gradient-to-r from-cyan-400 to-purple-600 text-white py-4 rounded-xl font-bold shadow-lg hover:scale-[1.02] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                                Simpan Konfigurasi
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Confirmation Modal */}
            {confirmAction && (
                <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center p-6 z-[60]">
                    <div className="bg-[#0a0c10] border border-white/10 w-full max-w-md rounded-3xl p-8 shadow-2xl animate-in fade-in zoom-in duration-200">
                        <div className="flex flex-col items-center text-center mb-6">
                            <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${confirmAction.type === 'danger' ? 'bg-red-500/10 text-red-500' : 'bg-emerald-500/10 text-emerald-500'
                                }`}>
                                {confirmAction.type === 'danger' ? <AlertCircle size={32} /> : <CheckCircle2 size={32} />}
                            </div>
                            <h3 className="text-xl font-bold mb-2">Konfirmasi Tindakan</h3>
                            <p className="text-gray-400 text-sm whitespace-pre-line">{confirmAction.message}</p>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setConfirmAction(null)}
                                className="flex-1 py-3 rounded-xl border border-white/10 hover:bg-white/5 transition-all text-gray-400 font-bold"
                            >
                                Batal
                            </button>
                            <button
                                onClick={() => {
                                    confirmAction.onConfirm();
                                    setConfirmAction(null);
                                }}
                                className={`flex-1 py-3 rounded-xl font-bold text-white shadow-lg transition-all ${confirmAction.type === 'danger' ? 'bg-red-500 hover:bg-red-600' : 'bg-emerald-500 hover:bg-emerald-600'
                                    }`}
                            >
                                Ya, Lanjutkan
                            </button>
                        </div>
                    </div>
                </div>
            )}
            <ToastContainer toasts={toasts} removeToast={removeToast} />
        </div>
    );
}
