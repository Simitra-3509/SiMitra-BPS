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
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border-l-4 border-l-[#F26522] border border-y-gray-100 border-r-gray-100 dark:border-y-gray-700 dark:border-r-gray-700 relative overflow-hidden">
                        <div className="text-sm text-gray-500 dark:text-gray-400 font-medium mb-1">Total Mitra Aktif</div>
                        <div className="text-3xl font-bold text-simitra-orange">{stats.totalMitra}</div>
                        <div className="absolute right-4 top-6 opacity-10 text-gray-800 dark:text-white">
                            <Users size={40} />
                        </div>
                    </div>
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border-l-4 border-l-[#F26522] border border-y-gray-100 border-r-gray-100 dark:border-y-gray-700 dark:border-r-gray-700 relative overflow-hidden">
                        <div className="text-sm text-gray-500 dark:text-gray-400 font-medium mb-1">Kegiatan Aktif</div>
                        <div className="text-3xl font-bold text-simitra-orange">{stats.kegiatanAktif}</div>
                        <div className="absolute right-4 top-6 opacity-10 text-gray-800 dark:text-white">
                            <Calendar size={40} />
                        </div>
                    </div>
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border-l-4 border-l-[#F26522] border border-y-gray-100 border-r-gray-100 dark:border-y-gray-700 dark:border-r-gray-700 relative overflow-hidden">
                        <div className="text-sm text-gray-500 dark:text-gray-400 font-medium mb-1">Honor Bulan Ini</div>
                        <div className="text-3xl font-bold text-simitra-orange">{formatRp(stats.honorBulanIni)}</div>
                        <div className="absolute right-4 top-6 opacity-10 text-gray-800 dark:text-white">
                            <Banknote size={40} />
                        </div>
                    </div>
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border-l-4 border-l-[#F26522] border border-y-gray-100 border-r-gray-100 dark:border-y-gray-700 dark:border-r-gray-700 relative overflow-hidden">
                        <div className="text-sm text-gray-500 dark:text-gray-400 font-medium mb-1">Jumlah Input Honor</div>
                        <div className="text-3xl font-bold text-simitra-orange">{stats.jumlahInputHonor}</div>
                        <div className="absolute right-4 top-6 opacity-10 text-gray-800 dark:text-white">
                            <FileSpreadsheet size={40} />
                        </div>
                    </div>
                </div>

                {/* SBML Info Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                        <div className="bg-simitra-orange text-white px-4 py-2 font-medium flex items-center gap-2 text-sm">
                            <TrendingUp size={16} /> Batas SBML Pendataan
                        </div>
                        <div className="p-6">
                            <div className="text-2xl font-bold text-gray-800 dark:text-gray-100">{formatRp(sbml.pendataan)}</div>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Batas maksimal honor per mitra per bulan untuk Pendataan.</p>
                        </div>
                    </div>
                    
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                        <div className="bg-simitra-orange text-white px-4 py-2 font-medium flex items-center gap-2 text-sm">
                            <TrendingUp size={16} /> Batas SBML Pengolahan
                        </div>
                        <div className="p-6">
                            <div className="text-2xl font-bold text-gray-800 dark:text-gray-100">{formatRp(sbml.pengolahan)}</div>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Batas maksimal honor per mitra per bulan untuk Pengolahan.</p>
                        </div>
                    </div>
                </div>

                {/* Charts */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Line Chart */}
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
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
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
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
