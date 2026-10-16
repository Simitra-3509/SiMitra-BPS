import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { Settings, Plus, Edit, Trash2, ArrowLeft } from 'lucide-react';

export default function Index({ configs }) {
    return (
        <AuthenticatedLayout header="Konfigurasi Anggaran">
            <Head title="Konfigurasi Anggaran" />

            <div className="max-w-5xl mx-auto space-y-6 pb-12">
                <div className="flex items-center gap-4">
                    <Link
                        href={route('dashboard')}
                        className="p-2 rounded-lg bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                    >
                        <ArrowLeft size={20} />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            <Settings className="text-[#D9531E]" /> Konfigurasi Anggaran
                        </h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Kelola kode program, akun, komponen default per tahun anggaran.
                        </p>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Daftar Konfigurasi</h2>
                        <Link
                            href={route('konfigurasi-anggaran.create')}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-orange-50 dark:bg-orange-950 text-[#D9531E] hover:bg-orange-100 dark:hover:bg-orange-900 rounded-lg text-sm font-medium transition"
                        >
                            <Plus size={16} /> Tambah Tahun
                        </Link>
                    </div>

                    {configs.data.length === 0 ? (
                        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                            Belum ada konfigurasi anggaran.
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="border-b border-gray-200 dark:border-gray-700 text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                        <th className="px-4 py-3">Tahun</th>
                                        <th className="px-4 py-3">Kode Program</th>
                                        <th className="px-4 py-3">Akun</th>
                                        <th className="px-4 py-3">Komponen Default</th>
                                        <th className="px-4 py-3">Subkomponen</th>
                                        <th className="px-4 py-3 text-right">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                    {configs.data.map((config) => (
                                        <tr key={config.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                            <td className="px-4 py-3 font-semibold text-gray-900 dark:text-white">{config.tahun_anggaran}</td>
                                            <td className="px-4 py-3 font-mono text-sm">{config.kode_program}</td>
                                            <td className="px-4 py-3 font-mono text-sm">{config.kode_akun}</td>
                                            <td className="px-4 py-3 font-mono text-sm">{config.komponen_default}</td>
                                            <td className="px-4 py-3 font-mono text-sm">{config.subkomponen_default}</td>
                                            <td className="px-4 py-3 text-right space-x-2">
                                                <Link
                                                    href={route('konfigurasi-anggaran.edit', config.id)}
                                                    className="inline-flex items-center gap-1 px-2 py-1 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950 rounded text-sm transition"
                                                >
                                                    <Edit size={14} /> Edit
                                                </Link>
                                                <form action={route('konfigurasi-anggaran.destroy', config.id)} method="POST" className="inline-block" onsubmit="return confirm('Hapus konfigurasi ini?')">
                                                    <input type="hidden" name="_method" value="DELETE" />
                                                    <input type="hidden" name="_token" value={document.querySelector('meta[name="csrf-token"]')?.content || ''} />
                                                    <button type="submit" className="inline-flex items-center gap-1 px-2 py-1 text-red-600 hover:bg-red-50 dark:hover:bg-red-950 rounded text-sm transition">
                                                        <Trash2 size={14} /> Hapus
                                                    </button>
                                                </form>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Pagination */}
                {configs.links && (
                    <div className="flex justify-center gap-1 mt-4">
                        {configs.links.map((link, i) => (
                            link.url ? (
                                <Link
                                    key={i}
                                    href={link.url}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                    className={`px-3 py-1 rounded text-sm ${link.active ? 'bg-[#D9531E] text-white' : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-50'}`}
                                />
                            ) : (
                                <span key={i} dangerouslySetInnerHTML={{ __html: link.label }} className="px-3 py-1 rounded text-sm text-gray-400" />
                            )
                        ))}
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
