import { useState, useEffect } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, usePage } from '@inertiajs/react';
import { 
    Users, 
    Calendar, 
    Banknote, 
    FileSpreadsheet, 
    TrendingUp, 
    LineChart as LineChartIcon, 
    PieChart as PieChartIcon,
    Moon,
    Sun
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

export default function Dashboard({ stats, sbml, chartData }) {
    const user = usePage().props.auth.user;
    const [isDarkMode, setIsDarkMode] = useState(false);

    useEffect(() => {
        if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
            document.documentElement.classList.add('dark');
            setIsDarkMode(true);
        } else {
            document.documentElement.classList.remove('dark');
            setIsDarkMode(false);
        }
    }, []);

    const toggleDarkMode = () => {
        if (isDarkMode) {
            document.documentElement.classList.remove('dark');
            localStorage.theme = 'light';
            setIsDarkMode(false);
        } else {
            document.documentElement.classList.add('dark');
            localStorage.theme = 'dark';
            setIsDarkMode(true);
        }
    };
    
    const COLORS = ['#F26522', '#00AEEF', '#00A651', '#808285'];
    
    // Format to IDR
    const formatRp = (number) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(number);
    };

    return (
        <AuthenticatedLayout header="Dashboard">
            <Head title="Dashboard" />

            <div className="space-y-6">
                
                {/* Header Title & Dark Mode Toggle */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Dashboard</h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Selamat datang di SIMITRA Lite - Sistem Informasi Mitra Terpadu</p>
                    </div>

                    <div className="flex items-center gap-3">
                        <button 
                            onClick={toggleDarkMode}
                            className="flex items-center gap-2 border border-simitra-orange text-simitra-orange hover:bg-orange-50 dark:hover:bg-gray-800 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors bg-white dark:bg-gray-800"
                        >
                            {isDarkMode ? <Sun size={16} /> : <Moon size={16} />}
                            {isDarkMode ? 'Light Mode' : 'Dark Mode'}
                        </button>
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                            Mode saat ini: <strong className="text-gray-800 dark:text-gray-200">{isDarkMode ? 'Dark' : 'Light'}</strong>
                        </span>
                    </div>
                </div>

                {/* Striped Progress Bar Decor */}
                <div className="h-3 bg-blue-600 rounded-full w-full opacity-90" style={{ backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,.2) 10px, rgba(255,255,255,.2) 20px)' }}></div>

                {/* Stat Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
                    {/* Card 1: Total Mitra Ditugaskan */}
                    <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1.5 border-l-4 border-l-[#F26522] border border-y-gray-100 border-r-gray-100 dark:border-y-gray-700 dark:border-r-gray-700 relative overflow-hidden group cursor-pointer flex flex-col justify-between">
                        <div>
                            <div className="text-sm text-gray-500 dark:text-gray-400 font-medium mb-1">Mitra Ditugaskan</div>
                            <div className="text-3xl font-bold text-simitra-orange">{stats.totalMitra}</div>
                            <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-1">Mitra sedang ada penugasan</p>
                        </div>
                        <div className="absolute right-4 top-5 opacity-10 group-hover:opacity-25 group-hover:scale-110 text-gray-800 dark:text-white transition-all duration-300 pointer-events-none">
                            <Users size={40} />
                        </div>
                    </div>

                    {/* Card 2: Kegiatan Aktif */}
                    <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1.5 border-l-4 border-l-[#F26522] border border-y-gray-100 border-r-gray-100 dark:border-y-gray-700 dark:border-r-gray-700 relative overflow-hidden group cursor-pointer flex flex-col justify-between">
                        <div>
                            <div className="text-sm text-gray-500 dark:text-gray-400 font-medium mb-1">Kegiatan Aktif</div>
                            <div className="text-3xl font-bold text-simitra-orange">{stats.kegiatanAktif}</div>
                            <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-1">Sedang dilaksanakan / ditugaskan</p>
                        </div>
                        <div className="absolute right-4 top-5 opacity-10 group-hover:opacity-25 group-hover:scale-110 text-gray-800 dark:text-white transition-all duration-300 pointer-events-none">
                            <Calendar size={40} />
                        </div>
                    </div>

                    {/* Card 3: Honor Mitra Bulan Ini (Rata-rata, Terkecil, Terbesar) */}
                    <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1.5 border-l-4 border-l-[#F26522] border border-y-gray-100 border-r-gray-100 dark:border-y-gray-700 dark:border-r-gray-700 relative overflow-hidden group cursor-pointer flex flex-col justify-between">
                        <div>
                            <div className="text-sm text-gray-500 dark:text-gray-400 font-medium mb-1">Statistik Honor Bulan Ini</div>
                            <div className="text-xl font-extrabold text-simitra-orange">{formatRp(stats.rataRataHonor)}</div>
                            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Rata-Rata Honor Bulan Ini</div>

                            <div className="pt-2 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between gap-2 text-xs">
                                <div>
                                    <span className="text-[10px] text-gray-400 block">Terkecil</span>
                                    <span className="font-bold text-emerald-600 dark:text-emerald-400">{formatRp(stats.honorTerkecil)}</span>
                                </div>
                                <div className="text-right">
                                    <span className="text-[10px] text-gray-400 block">Terbesar</span>
                                    <span className="font-bold text-blue-600 dark:text-blue-400">{formatRp(stats.honorTerbesar)}</span>
                                </div>
                            </div>
                        </div>
                        <div className="absolute right-4 top-5 opacity-10 group-hover:opacity-25 group-hover:scale-110 text-gray-800 dark:text-white transition-all duration-300 pointer-events-none">
                            <Banknote size={40} />
                        </div>
                    </div>

                    {/* Card 4: Rata-Rata Honor Setahun */}
                    <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1.5 border-l-4 border-l-[#F26522] border border-y-gray-100 border-r-gray-100 dark:border-y-gray-700 dark:border-r-gray-700 relative overflow-hidden group cursor-pointer flex flex-col justify-between">
                        <div>
                            <div className="text-sm text-gray-500 dark:text-gray-400 font-medium mb-1">Rata-Rata Honor Setahun</div>
                            <div className="text-xl font-extrabold text-simitra-orange">{formatRp(stats.rataRataHonorSetahun)}</div>
                            <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-1">Rata-rata per mitra (Tahun {new Date().getFullYear()})</p>
                        </div>
                        <div className="absolute right-4 top-5 opacity-10 group-hover:opacity-25 group-hover:scale-110 text-gray-800 dark:text-white transition-all duration-300 pointer-events-none">
                            <TrendingUp size={40} />
                        </div>
                    </div>
                </div>



                {/* Charts */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Line Chart */}
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 border border-gray-100 dark:border-gray-700">
                        <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2 text-sm">
                            <LineChartIcon size={16} className="text-simitra-orange" /> Performa Bulanan
                        </h3>
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={chartData.performa}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="name" />
                                    <YAxis />
                                    <RechartsTooltip />
                                    <Legend />
                                    <Line type="monotone" dataKey="honor" name="Honor Bulanan (proyeksi)" stroke="#F26522" activeDot={{ r: 8 }} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Donut Chart */}
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 border border-gray-100 dark:border-gray-700">
                        <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2 text-sm">
                            <PieChartIcon size={16} className="text-simitra-orange" /> Komposisi Data
                        </h3>
                        <div className="h-64 flex justify-center">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={chartData.komposisi}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {chartData.komposisi.map((entry, index) => (
                                             <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <RechartsTooltip />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

            </div>
        </AuthenticatedLayout>
    );
}
