import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, usePage } from '@inertiajs/react';
import {
    Users,
    Calendar,
    Banknote,
    Moon,
    Sun,
    ChevronDown,
    Loader2,
    CalendarRange,
    CalendarDays,
    AlertTriangle,
    AlertCircle,
    CheckCircle2,
    Eye,
    X,
    Search,
    MapPin,
    Building2,
    ChevronLeft,
    ChevronRight,
    Briefcase,
    ShieldAlert,
} from 'lucide-react';

// ─── Constants ────────────────────────────────────────────────────────────────

const BULAN_NAMES = [
    'Januari','Februari','Maret','April','Mei','Juni',
    'Juli','Agustus','September','Oktober','November','Desember',
];

const currentYear  = new Date().getFullYear();
const currentMonth = new Date().getMonth() + 1;

// Daftar tahun yang tersedia (5 tahun ke belakang)
const YEAR_OPTIONS = Array.from({ length: 6 }, (_, i) => currentYear - i);

// ─── Helper format Rupiah ─────────────────────────────────────────────────────
const formatRp = (number) =>
    new Intl.NumberFormat('id-ID', {
        style: 'currency', currency: 'IDR', minimumFractionDigits: 0,
    }).format(number ?? 0);

// ─── Reusable base dropdown ───────────────────────────────────────────────────
function BaseDropdown({ triggerLabel, triggerIcon, children, minWidth = 'min-w-[160px]' }) {
    const [open, setOpen] = useState(false);
    const ref = useRef(null);

    useEffect(() => {
        const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    return (
        <div ref={ref} className="relative">
            <button
                onClick={() => setOpen(o => !o)}
                className={`flex items-center gap-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-xl px-3.5 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 shadow-sm hover:border-[#F26522] hover:text-[#F26522] transition-all duration-200 ${minWidth}`}
            >
                {triggerIcon}
                <span className="flex-1 text-left truncate">{triggerLabel}</span>
                <ChevronDown
                    size={13}
                    className={`shrink-0 transition-transform duration-200 text-gray-400 ${open ? 'rotate-180' : ''}`}
                />
            </button>

            {open && (
                <div className="absolute z-50 top-full mt-2 left-0 w-52 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl shadow-2xl overflow-hidden"
                     style={{ boxShadow: '0 20px 60px -10px rgba(0,0,0,0.18)' }}
                >
                    <div className="py-2 max-h-72 overflow-y-auto">
                        {children(setOpen)}
                    </div>
                </div>
            )}
        </div>
    );
}

// ─── Dropdown item atom ───────────────────────────────────────────────────────
function DropItem({ active, onClick, indent = false, children }) {
    return (
        <button
            onClick={onClick}
            className={`
                w-full text-left flex items-center gap-2 px-4 py-2 text-sm transition-all duration-150
                ${indent ? 'pl-6' : ''}
                ${active
                    ? 'bg-orange-50 dark:bg-orange-900/25 text-[#F26522] font-semibold'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/60 hover:text-[#F26522]'}
            `}
        >
            <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${active ? 'bg-[#F26522]' : ''}`} />
            {children}
        </button>
    );
}

// ─── Group header (non-selectable) ───────────────────────────────────────────
function GroupHeader({ label }) {
    return (
        <div className="px-3 pt-2 pb-1 flex items-center gap-2">
            <div className="h-px flex-1 bg-gray-100 dark:bg-gray-700" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500">
                {label}
            </span>
            <div className="h-px flex-1 bg-gray-100 dark:bg-gray-700" />
        </div>
    );
}

// ─── Month Dropdown ───────────────────────────────────────────────────────────
function MonthDropdown({ value, onChange, disabled = false }) {
    const label = value === 'semua' ? 'Semua Bulan' : BULAN_NAMES[value - 1];

    // Disabled state: always render but block interaction + show tooltip
    if (disabled) {
        return (
            <div className="relative group/tip">
                {/* Redup, tidak bisa diklik */}
                <div
                    className="flex items-center gap-2 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl px-3.5 py-2 text-sm font-medium text-gray-300 dark:text-gray-500 min-w-[170px] cursor-not-allowed opacity-50 select-none"
                >
                    <CalendarDays size={15} className="shrink-0 text-gray-300 dark:text-gray-500" />
                    <span className="flex-1 text-left truncate">{label}</span>
                    <ChevronDown size={13} className="shrink-0 text-gray-300 dark:text-gray-500" />
                </div>

                {/* Tooltip muncul saat hover */}
                <div className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50
                                whitespace-nowrap px-3 py-1.5 rounded-lg text-xs font-medium
                                bg-gray-800 dark:bg-gray-700 text-white shadow-lg
                                opacity-0 group-hover/tip:opacity-100 transition-opacity duration-200">
                    Pilih tahun spesifik untuk mengaktifkan
                    {/* Panah tooltip */}
                    <span className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-800 dark:border-t-gray-700" />
                </div>
            </div>
        );
    }

    return (
        <BaseDropdown
            triggerLabel={label}
            triggerIcon={<CalendarDays size={15} className="text-[#F26522] shrink-0" />}
            minWidth="min-w-[170px]"
        >
            {(close) => (
                <>
                    <DropItem active={value === 'semua'} onClick={() => { onChange('semua'); close(false); }}>
                        Semua Bulan
                    </DropItem>
                    <GroupHeader label="Pilih Bulan" />
                    {BULAN_NAMES.map((name, i) => (
                        <DropItem
                            key={i + 1}
                            indent
                            active={value === i + 1}
                            onClick={() => { onChange(i + 1); close(false); }}
                        >
                            {name}
                        </DropItem>
                    ))}
                </>
            )}
        </BaseDropdown>
    );
}

// ─── Year Dropdown ────────────────────────────────────────────────────────────
// value: 'tahunan' | number
function YearDropdown({ value, onChange }) {
    const label = value === 'tahunan' ? 'Tahunan' : String(value);
    return (
        <BaseDropdown
            triggerLabel={label}
            triggerIcon={<CalendarRange size={15} className="text-[#F26522] shrink-0" />}
            minWidth="min-w-[145px]"
        >
            {(close) => (
                <>
                    {/* Tahunan (all-time across years) */}
                    <DropItem active={value === 'tahunan'} onClick={() => { onChange('tahunan'); close(false); }}>
                        Tahunan
                    </DropItem>
                    <GroupHeader label="Pilih Tahun" />
                    {YEAR_OPTIONS.map((yr) => (
                        <DropItem
                            key={yr}
                            indent
                            active={value === yr}
                            onClick={() => { onChange(yr); close(false); }}
                        >
                            {yr}
                        </DropItem>
                    ))}
                </>
            )}
        </BaseDropdown>
    );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────
export default function Dashboard({ stats: initStats, sbml: initSbml, chartData: initChartData, mitraList: initMitraList }) {
    usePage().props.auth.user;

    // dark mode
    const [isDarkMode, setIsDarkMode] = useState(false);
    useEffect(() => {
        if (
            localStorage.theme === 'dark' ||
            (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)
        ) {
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

    // ── filter state ──────────────────────────────────────────────────────────
    // yearSel : 'tahunan' | number
    // monthSel: 'semua'   | number (1-12)
    const [yearSel,  setYearSel]  = useState(currentYear);
    const [monthSel, setMonthSel] = useState('semua');

    // derived filter for backend
    const filter = yearSel === 'tahunan'
        ? 'semua'       // all-time per-year bar chart
        : monthSel === 'semua'
        ? 'tahunan'     // all months of a year line chart
        : 'bulanan';    // daily of a specific month

    const tahun = yearSel === 'tahunan' ? currentYear : yearSel;
    const bulan = monthSel === 'semua' ? 1 : monthSel;

    // ── data state ────────────────────────────────────────────────────────────
    const [stats,         setStats]         = useState(initStats);
    const [chartData,     setChartData]     = useState(initChartData);
    const [sbml,          setSbml]          = useState(initSbml || { pendataan: 3085000, pengolahan: 2854000 });
    const [mitraList,     setMitraList]     = useState(initMitraList || []);
    const [filterLabel,   setFilterLabel]   = useState(
        monthSel === 'semua' ? `Tahun ${currentYear}` : `Bulan ${BULAN_NAMES[monthSel - 1]} ${currentYear}`
    );
    const [loading,       setLoading]       = useState(false);

    // ── Table & Modal state ───────────────────────────────────────────────────
    const [selectedMitra, setSelectedMitra] = useState(null);
    const [searchQuery,   setSearchQuery]   = useState('');
    const [statusFilter,  setStatusFilter]  = useState('semua'); // 'semua' | 'kritis' | 'warning' | 'normal'
    const [currentPage,   setCurrentPage]   = useState(1);
    const [perPage,       setPerPage]       = useState(10);

    const fetchFilterData = useCallback(async (f, t, b) => {
        setLoading(true);
        try {
            const params = new URLSearchParams({ filter: f, tahun: t, bulan: b });
            const res = await fetch(`/api/dashboard-filter?${params}`, {
                headers: { 'X-Requested-With': 'XMLHttpRequest' },
            });
            if (!res.ok) throw new Error('Gagal memuat data');
            const data = await res.json();
            setStats(data.stats);
            setChartData(data.chartData);
            if (data.label) setFilterLabel(data.label);
            if (data.mitraList) setMitraList(data.mitraList);
            if (data.sbml) setSbml(data.sbml);
            setCurrentPage(1);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchFilterData(filter, tahun, bulan);
    }, [filter, tahun, bulan, fetchFilterData]);

    // Close modal on ESC key
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') setSelectedMitra(null);
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    // Month dropdown always visible; disabled (dimmed) when year = tahunan
    const monthDisabled = yearSel === 'tahunan';

    // Stat card label
    const statHonorTitle =
        filter === 'semua'    ? 'Statistik Honor (Semua Waktu)' :
        filter === 'tahunan'  ? `Statistik Honor Tahun ${tahun}` :
                                `Statistik Honor — ${BULAN_NAMES[bulan - 1]} ${tahun}`;

    // ── Mitra Table computation ───────────────────────────────────────────────
    const filteredMitras = useMemo(() => {
        return (mitraList || []).filter((m) => {
            if (statusFilter === 'kritis' && !m.melewati_sbml) return false;
            if (statusFilter === 'warning' && m.status_sbml !== 'warning') return false;
            if (statusFilter === 'normal' && (m.status_sbml !== 'normal' || m.melewati_sbml)) return false;

            if (searchQuery.trim()) {
                const q = searchQuery.toLowerCase();
                const matchNama = (m.nama_lengkap || '').toLowerCase().includes(q);
                const matchSobat = (m.sobat_id || '').toLowerCase().includes(q);
                const matchKec = (m.kecamatan || '').toLowerCase().includes(q);
                if (!matchNama && !matchSobat && !matchKec) return false;
            }

            return true;
        });
    }, [mitraList, statusFilter, searchQuery]);

    const totalCount = mitraList.length;
    const kritisCount = useMemo(() => (mitraList || []).filter(m => m.melewati_sbml).length, [mitraList]);
    const warningCount = useMemo(() => (mitraList || []).filter(m => m.status_sbml === 'warning').length, [mitraList]);
    const normalCount = useMemo(() => (mitraList || []).filter(m => m.status_sbml === 'normal' && !m.melewati_sbml).length, [mitraList]);

    const totalPages = perPage === 'semua' ? 1 : Math.ceil(filteredMitras.length / perPage) || 1;
    const paginatedMitras = useMemo(() => {
        if (perPage === 'semua') return filteredMitras;
        const start = (currentPage - 1) * perPage;
        return filteredMitras.slice(start, start + perPage);
    }, [filteredMitras, currentPage, perPage]);

    return (
        <AuthenticatedLayout header="Dashboard">
            <Head title="Dashboard" />

            <div className="space-y-6">

                {/* ── Header ──────────────────────────────────────── */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Dashboard</h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Selamat datang di SIMITRA Lite - Sistem Informasi Mitra Terpadu
                        </p>
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

                {/* ── Animated Loading Progress Bar ────────────────── */}
                <div
                    className={`transition-all duration-300 ease-in-out overflow-hidden ${
                        loading
                            ? 'opacity-100 max-h-16 mb-2 scale-100'
                            : 'opacity-0 max-h-0 mb-0 scale-98 pointer-events-none'
                    }`}
                >
                    <div className="flex items-center justify-between text-xs font-semibold text-[#F26522] dark:text-orange-400 mb-1.5 px-1">
                        <span className="flex items-center gap-1.5">
                            <Loader2 size={13} className="animate-spin text-[#F26522]" />
                            <span>Memperbarui data periode {filterLabel}...</span>
                        </span>
                        <span className="text-[10px] text-gray-400 dark:text-gray-500 font-normal">
                            Menyinkronkan statistik & mitra
                        </span>
                    </div>
                    <div className="h-2.5 w-full rounded-full overflow-hidden bg-orange-100/70 dark:bg-gray-700/80 p-0.5 shadow-inner">
                        <div
                            className="h-full rounded-full w-full animate-loading-stripes bg-gradient-to-r from-[#F26522] via-amber-500 to-blue-600 shadow-sm"
                            style={{
                                backgroundSize: '30px 30px',
                                backgroundImage: 'repeating-linear-gradient(45deg, rgba(255,255,255,0.28) 0, rgba(255,255,255,0.28) 10px, transparent 10px, transparent 20px)'
                            }}
                        />
                    </div>
                </div>

                {/* ── Filter Bar ───────────────────────────────────── */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 px-5 py-3.5">
                    <div className="flex flex-wrap items-center gap-3">

                        <span className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-widest">
                            Filter
                        </span>

                        {/* Month dropdown — selalu tampil, disabled saat Tahunan */}
                        <MonthDropdown
                            value={monthSel}
                            onChange={setMonthSel}
                            disabled={monthDisabled}
                        />

                        {/* Year dropdown — always visible */}
                        <YearDropdown value={yearSel} onChange={setYearSel} />

                        {/* Spinner loading */}
                        {loading && (
                            <div className="ml-auto">
                                <Loader2 size={15} className="animate-spin text-[#F26522]" />
                            </div>
                        )}
                    </div>

                    {/* Hint saat mode Tahunan aktif */}
                    {monthDisabled && (
                        <div className="mt-2.5 flex items-center gap-1.5 text-[11px] text-gray-400 dark:text-gray-500">
                            <span className="inline-block w-3.5 h-3.5 rounded-full bg-gray-200 dark:bg-gray-600 text-gray-500 dark:text-gray-400 text-[9px] font-bold flex items-center justify-center shrink-0">i</span>
                            Filter bulan tidak aktif dalam mode <strong className="text-gray-500 dark:text-gray-400">Tahunan</strong>.
                            Pilih tahun spesifik pada dropdown kanan untuk mengaktifkannya.
                        </div>
                    )}
                </div>

                {/* ── Stat Cards ───────────────────────────────────── */}
                <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6 transition-opacity duration-300 ${loading ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>

                    {/* Card 1 – Mitra */}
                    <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1.5 border-l-4 border-l-[#F26522] border border-y-gray-100 border-r-gray-100 dark:border-y-gray-700 dark:border-r-gray-700 relative overflow-hidden group cursor-pointer flex flex-col justify-between">
                        <div>
                            <div className="text-sm text-gray-500 dark:text-gray-400 font-medium mb-1">Mitra Ditugaskan</div>
                            <div className="text-3xl font-bold text-simitra-orange">{stats?.totalMitra ?? 0}</div>
                            <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-1 truncate" title={`Sesuai filter: ${filterLabel}`}>
                                Sesuai filter: {filterLabel}
                            </p>
                        </div>
                        <div className="absolute right-4 top-5 opacity-10 group-hover:opacity-25 group-hover:scale-110 text-gray-800 dark:text-white transition-all duration-300 pointer-events-none">
                            <Users size={40} />
                        </div>
                    </div>

                    {/* Card 2 – Kegiatan */}
                    <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1.5 border-l-4 border-l-[#F26522] border border-y-gray-100 border-r-gray-100 dark:border-y-gray-700 dark:border-r-gray-700 relative overflow-hidden group cursor-pointer flex flex-col justify-between">
                        <div>
                            <div className="text-sm text-gray-500 dark:text-gray-400 font-medium mb-1">Kegiatan Aktif</div>
                            <div className="text-3xl font-bold text-simitra-orange">{stats?.kegiatanAktif ?? 0}</div>
                            <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-1 truncate" title={`Sesuai filter: ${filterLabel}`}>
                                Sesuai filter: {filterLabel}
                            </p>
                        </div>
                        <div className="absolute right-4 top-5 opacity-10 group-hover:opacity-25 group-hover:scale-110 text-gray-800 dark:text-white transition-all duration-300 pointer-events-none">
                            <Calendar size={40} />
                        </div>
                    </div>

                    {/* Card 3 – Honor */}
                    <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1.5 border-l-4 border-l-[#F26522] border border-y-gray-100 border-r-gray-100 dark:border-y-gray-700 dark:border-r-gray-700 relative overflow-hidden group cursor-pointer flex flex-col justify-between">
                        <div>
                            <div className="text-sm text-gray-500 dark:text-gray-400 font-medium mb-1">{statHonorTitle}</div>
                            <div className="text-xl font-extrabold text-simitra-orange">{formatRp(stats?.rataRataHonor)}</div>
                            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Rata-Rata Honor</div>
                            <div className="pt-2 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between gap-2 text-xs">
                                <div>
                                    <span className="text-[10px] text-gray-400 block">Terkecil</span>
                                    <span className="font-bold text-emerald-600 dark:text-emerald-400">{formatRp(stats?.honorTerkecil)}</span>
                                </div>
                                <div className="text-right">
                                    <span className="text-[10px] text-gray-400 block">Terbesar</span>
                                    <span className="font-bold text-blue-600 dark:text-blue-400">{formatRp(stats?.honorTerbesar)}</span>
                                </div>
                            </div>
                        </div>
                        <div className="absolute right-4 top-5 opacity-10 group-hover:opacity-25 group-hover:scale-110 text-gray-800 dark:text-white transition-all duration-300 pointer-events-none">
                            <Banknote size={40} />
                        </div>
                    </div>
                </div>

                {/* ── Mitra Honor & SBML Monitoring Table ─────────── */}
                <div className={`bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden transition-opacity duration-300 ${loading ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
                    
                    {/* Table Header / Toolbar */}
                    <div className="p-5 border-b border-gray-100 dark:border-gray-700 space-y-4">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                            <div>
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                    <Users className="text-[#F26522]" size={20} />
                                    Daftar Penugasan & Honor Mitra
                                </h3>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 flex items-center gap-1.5">
                                    <span>Periode: <strong className="text-gray-700 dark:text-gray-300">{filterLabel}</strong></span>
                                    <span>•</span>
                                    <span>Klik baris mitra untuk melihat rincian kegiatan & honor</span>
                                </p>
                            </div>

                            {/* SBML Threshold limits info pill */}
                            <div className="flex flex-wrap items-center gap-2 text-xs">
                                <span className="text-gray-500 dark:text-gray-400">Pagu SBML {tahun}:</span>
                                <span className="px-2.5 py-1 bg-orange-50 dark:bg-orange-950/30 text-[#F26522] rounded-lg font-semibold border border-orange-200 dark:border-orange-900/50">
                                    Pendataan: {formatRp(sbml?.pendataan)}
                                </span>
                                <span className="px-2.5 py-1 bg-cyan-50 dark:bg-cyan-950/30 text-cyan-600 dark:text-cyan-400 rounded-lg font-semibold border border-cyan-200 dark:border-cyan-900/50">
                                    Pengolahan: {formatRp(sbml?.pengolahan)}
                                </span>
                            </div>
                        </div>

                        {/* Filter Tabs and Search */}
                        <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-3 pt-2">
                            {/* Filter Status Tabs */}
                            <div className="flex flex-wrap items-center gap-1.5 p-1 bg-gray-100/80 dark:bg-gray-700/60 rounded-xl">
                                <button
                                    type="button"
                                    onClick={() => { setStatusFilter('semua'); setCurrentPage(1); }}
                                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${statusFilter === 'semua' ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-xs' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}
                                >
                                    Semua ({totalCount})
                                </button>
                                <button
                                    type="button"
                                    onClick={() => { setStatusFilter('kritis'); setCurrentPage(1); }}
                                    className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${statusFilter === 'kritis' ? 'bg-red-500 text-white shadow-xs' : 'text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30'}`}
                                >
                                    <AlertTriangle size={13} />
                                    Melebihi SBML ({kritisCount})
                                </button>
                                <button
                                    type="button"
                                    onClick={() => { setStatusFilter('warning'); setCurrentPage(1); }}
                                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${statusFilter === 'warning' ? 'bg-amber-500 text-white shadow-xs' : 'text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/30'}`}
                                >
                                    <AlertCircle size={13} />
                                    Mendekati Pagu ({warningCount})
                                </button>
                                <button
                                    type="button"
                                    onClick={() => { setStatusFilter('normal'); setCurrentPage(1); }}
                                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${statusFilter === 'normal' ? 'bg-emerald-600 text-white shadow-xs' : 'text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30'}`}
                                >
                                    <CheckCircle2 size={13} />
                                    Sesuai Pagu ({normalCount})
                                </button>
                            </div>

                            {/* Search box */}
                            <div className="relative min-w-[240px] md:w-72">
                                <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Cari nama, ID Sobat, kecamatan..."
                                    value={searchQuery}
                                    onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                                    className="w-full pl-9 pr-8 py-1.5 text-xs bg-gray-50 dark:bg-gray-900/60 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-800 dark:text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#F26522]/30 focus:border-[#F26522] transition-all"
                                />
                                {searchQuery && (
                                    <button
                                        type="button"
                                        onClick={() => setSearchQuery('')}
                                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 cursor-pointer"
                                    >
                                        <X size={13} />
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Table Data */}
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse min-w-[800px]">
                            <thead className="bg-gray-50/80 dark:bg-gray-700/50 border-b border-gray-100 dark:border-gray-700 text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                <tr>
                                    <th className="p-4 w-12 text-center">NO</th>
                                    <th className="p-4">ID SOBAT</th>
                                    <th className="p-4">NAMA MITRA</th>
                                    <th className="p-4">ASAL KECAMATAN</th>
                                    <th className="p-4 text-right">TOTAL HONOR</th>
                                    <th className="p-4 text-center">STATUS SBML</th>
                                    <th className="p-4 text-center">AKSI</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-700 text-sm">
                                {paginatedMitras.length > 0 ? (
                                    paginatedMitras.map((mitra, idx) => {
                                        const rowNum = perPage === 'semua' ? idx + 1 : (currentPage - 1) * perPage + idx + 1;
                                        const isKritis = mitra.melewati_sbml;
                                        const isWarning = mitra.status_sbml === 'warning';

                                        return (
                                            <tr
                                                key={mitra.id}
                                                onClick={() => setSelectedMitra(mitra)}
                                                className={`group transition-all duration-150 cursor-pointer ${
                                                    isKritis
                                                        ? 'bg-red-50/70 hover:bg-red-100/80 dark:bg-red-950/25 dark:hover:bg-red-950/40 border-l-4 border-l-red-500'
                                                        : isWarning
                                                        ? 'bg-amber-50/40 hover:bg-amber-100/60 dark:bg-amber-950/15 dark:hover:bg-amber-950/30 border-l-4 border-l-amber-500'
                                                        : 'hover:bg-orange-50/30 dark:hover:bg-gray-700/30 border-l-4 border-l-transparent hover:border-l-[#F26522]'
                                                }`}
                                            >
                                                {/* No */}
                                                <td className="p-4 text-center text-xs font-semibold text-gray-500 dark:text-gray-400">
                                                    {rowNum}
                                                </td>

                                                {/* ID Sobat */}
                                                <td className="p-4">
                                                    <span className="font-mono text-xs px-2.5 py-1 bg-gray-100 dark:bg-gray-700/70 text-gray-700 dark:text-gray-200 rounded-md font-semibold tracking-wide border border-gray-200 dark:border-gray-600">
                                                        {mitra.sobat_id}
                                                    </span>
                                                </td>

                                                {/* Nama Mitra */}
                                                <td className="p-4">
                                                    <div className="font-bold text-gray-900 dark:text-white group-hover:text-[#F26522] transition-colors">
                                                        {mitra.nama_lengkap}
                                                    </div>
                                                    <div className="text-[11px] text-gray-400 dark:text-gray-500">
                                                        {mitra.jumlah_kegiatan} kegiatan ditugaskan
                                                    </div>
                                                </td>

                                                {/* Asal Kecamatan */}
                                                <td className="p-4">
                                                    <div className="flex items-center gap-1.5 text-xs text-gray-700 dark:text-gray-300 font-medium">
                                                        <MapPin size={13} className="text-gray-400 shrink-0" />
                                                        <span>{mitra.kecamatan}</span>
                                                    </div>
                                                </td>

                                                {/* Total Honor */}
                                                <td className="p-4 text-right">
                                                    <div className={`text-sm font-extrabold ${isKritis ? 'text-red-600 dark:text-red-400' : 'text-[#F26522]'}`}>
                                                        {formatRp(mitra.total_honor)}
                                                    </div>
                                                    <div className="text-[10px] text-gray-400 dark:text-gray-500">
                                                        {filter === 'bulanan' ? 'Honor Bulan Ini' : 'Total Periode'}
                                                    </div>
                                                </td>

                                                {/* Status SBML */}
                                                <td className="p-4 text-center">
                                                    {isKritis ? (
                                                        <div className="inline-flex flex-col items-center">
                                                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300 border border-red-200 dark:border-red-800 shadow-xs">
                                                                <AlertTriangle size={13} className="text-red-600 shrink-0 animate-bounce" />
                                                                Melebihi SBML
                                                            </span>
                                                            {mitra.alasan_sbml && (
                                                                <span className="text-[10px] text-red-500 dark:text-red-400 mt-0.5 max-w-[200px] truncate" title={mitra.alasan_sbml}>
                                                                    {mitra.alasan_sbml}
                                                                </span>
                                                            )}
                                                        </div>
                                                    ) : isWarning ? (
                                                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                                                            <AlertCircle size={13} className="text-amber-600 shrink-0" />
                                                            Mendekati Pagu
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                                                            <CheckCircle2 size={13} className="text-emerald-600 shrink-0" />
                                                            Sesuai Pagu
                                                        </span>
                                                    )}
                                                </td>

                                                {/* Aksi */}
                                                <td className="p-4 text-center">
                                                    <button
                                                        type="button"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setSelectedMitra(mitra);
                                                        }}
                                                        className="px-3 py-1.5 text-xs font-semibold text-[#F26522] hover:text-white border border-[#F26522] hover:bg-[#F26522] rounded-lg transition-all inline-flex items-center gap-1.5 shadow-xs cursor-pointer"
                                                    >
                                                        <Eye size={13} />
                                                        <span>Lihat Kegiatan</span>
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan={7} className="p-8 text-center text-gray-500 dark:text-gray-400">
                                            <div className="flex flex-col items-center justify-center gap-2">
                                                <Users size={32} className="text-gray-300 dark:text-gray-600" />
                                                <p className="font-semibold text-gray-600 dark:text-gray-300 text-sm">
                                                    Tidak ada data mitra yang ditemukan.
                                                </p>
                                                <p className="text-xs text-gray-400">
                                                    {searchQuery
                                                        ? `Tidak ditemukan mitra dengan kata kunci "${searchQuery}". Coba kata kunci lain.`
                                                        : `Tidak ada penugasan mitra pada periode ${filterLabel}.`}
                                                </p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination / Footer */}
                    {filteredMitras.length > 0 && (
                        <div className="p-4 border-t border-gray-100 dark:border-gray-700 flex flex-col sm:flex-row justify-between items-center gap-4 bg-gray-50/50 dark:bg-gray-800 text-xs text-gray-600 dark:text-gray-400">
                            <div className="flex items-center gap-3">
                                <span>Tampilkan:</span>
                                <select
                                    value={perPage}
                                    onChange={(e) => {
                                        const val = e.target.value === 'semua' ? 'semua' : Number(e.target.value);
                                        setPerPage(val);
                                        setCurrentPage(1);
                                    }}
                                    className="border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 rounded-lg py-1 px-2.5 text-xs focus:border-[#F26522] focus:ring-[#F26522]"
                                >
                                    <option value={10}>10</option>
                                    <option value={25}>25</option>
                                    <option value={50}>50</option>
                                    <option value="semua">Semua</option>
                                </select>
                                <span>
                                    Menampilkan {perPage === 'semua' ? 1 : (currentPage - 1) * perPage + 1} -{' '}
                                    {perPage === 'semua' ? filteredMitras.length : Math.min(currentPage * perPage, filteredMitras.length)} dari {filteredMitras.length} mitra
                                </span>
                            </div>

                            {perPage !== 'semua' && totalPages > 1 && (
                                <div className="flex items-center gap-1.5">
                                    <button
                                        type="button"
                                        disabled={currentPage <= 1}
                                        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                                        className="px-2.5 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
                                    >
                                        <ChevronLeft size={14} />
                                    </button>
                                    <span className="px-3 py-1 font-semibold text-gray-700 dark:text-gray-300">
                                        Halaman {currentPage} dari {totalPages}
                                    </span>
                                    <button
                                        type="button"
                                        disabled={currentPage >= totalPages}
                                        onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                                        className="px-2.5 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
                                    >
                                        <ChevronRight size={14} />
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* ── Modal Detail Kegiatan Ditugaskan ─────────────── */}
                {selectedMitra && (
                    <div
                        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 overflow-y-auto animate-in fade-in duration-200"
                        onClick={() => setSelectedMitra(null)}
                    >
                        <div
                            className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden border border-gray-100 dark:border-gray-700 transform transition-all"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Modal Header */}
                            <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-start bg-gradient-to-r from-orange-50/50 to-transparent dark:from-gray-800 dark:to-gray-800">
                                <div className="flex items-start gap-3.5">
                                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#F26522] to-orange-400 text-white font-black text-lg flex items-center justify-center shadow-md shrink-0">
                                        {selectedMitra.nama_lengkap ? selectedMitra.nama_lengkap.slice(0, 2).toUpperCase() : 'MT'}
                                    </div>
                                    <div>
                                        <div className="flex flex-wrap items-center gap-2">
                                            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                                                {selectedMitra.nama_lengkap}
                                            </h3>
                                            {selectedMitra.melewati_sbml ? (
                                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300 border border-red-200 dark:border-red-800">
                                                    <AlertTriangle size={12} className="text-red-600 shrink-0" />
                                                    Melebihi SBML
                                                </span>
                                            ) : selectedMitra.status_sbml === 'warning' ? (
                                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                                                    <AlertCircle size={12} className="text-amber-600 shrink-0" />
                                                    Mendekati Pagu
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                                                    <CheckCircle2 size={12} className="text-emerald-600 shrink-0" />
                                                    Sesuai Pagu
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs text-gray-500 dark:text-gray-400">
                                            <span>SOBAT ID: <strong className="font-mono text-gray-700 dark:text-gray-300">{selectedMitra.sobat_id}</strong></span>
                                            <span>•</span>
                                            <span className="flex items-center gap-1">
                                                <MapPin size={12} className="text-gray-400" />
                                                Kecamatan: <strong className="text-gray-700 dark:text-gray-300">{selectedMitra.kecamatan}</strong>
                                            </span>
                                            <span>•</span>
                                            <span>Periode: <strong className="text-gray-700 dark:text-gray-300">{filterLabel}</strong></span>
                                        </div>
                                    </div>
                                </div>

                                <button
                                    type="button"
                                    onClick={() => setSelectedMitra(null)}
                                    className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition cursor-pointer"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            {/* Modal Scrollable Body */}
                            <div className="p-6 overflow-y-auto space-y-6 max-h-[calc(90vh-140px)]">

                                {/* Alert Peringatan Melebihi SBML */}
                                {selectedMitra.melewati_sbml && (
                                    <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 flex items-start gap-3 text-red-800 dark:text-red-200">
                                        <AlertTriangle size={20} className="text-red-600 dark:text-red-400 shrink-0 mt-0.5 animate-bounce" />
                                        <div className="text-xs space-y-1">
                                            <div className="font-bold text-sm">Peringatan: Batas SBML Terlampaui!</div>
                                            <p className="text-red-700 dark:text-red-300">
                                                Mitra ini memiliki total honor penugasan yang melampaui standar batas SBML yang ditetapkan:
                                            </p>
                                            <div className="font-semibold text-red-900 dark:text-red-200 bg-white/60 dark:bg-red-900/40 px-3 py-1.5 rounded-lg inline-block border border-red-200/60 dark:border-red-800/60">
                                                {selectedMitra.alasan_sbml}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Kuota Breakdown Cards */}
                                {(() => {
                                    const isMonthly = filter === 'bulanan';

                                    // Pendataan
                                    const pctPendataan = isMonthly
                                        ? Math.round(((selectedMitra.terpakai_pendataan || 0) / (sbml?.pendataan || 1)) * 100)
                                        : Math.round(((selectedMitra.max_pendataan_sebulan || 0) / (sbml?.pendataan || 1)) * 100);
                                    const isExceededPendataan = isMonthly
                                        ? (selectedMitra.terpakai_pendataan || 0) > (sbml?.pendataan || 0)
                                        : Boolean(selectedMitra.melewati_pendataan);
                                    const isWarningPendataan = isMonthly
                                        ? (selectedMitra.terpakai_pendataan || 0) >= 0.8 * (sbml?.pendataan || 0)
                                        : (selectedMitra.max_pendataan_sebulan || 0) >= 0.8 * (sbml?.pendataan || 0);

                                    // Pengolahan
                                    const pctPengolahan = isMonthly
                                        ? Math.round(((selectedMitra.terpakai_pengolahan || 0) / (sbml?.pengolahan || 1)) * 100)
                                        : Math.round(((selectedMitra.max_pengolahan_sebulan || 0) / (sbml?.pengolahan || 1)) * 100);
                                    const isExceededPengolahan = isMonthly
                                        ? (selectedMitra.terpakai_pengolahan || 0) > (sbml?.pengolahan || 0)
                                        : Boolean(selectedMitra.melewati_pengolahan);
                                    const isWarningPengolahan = isMonthly
                                        ? (selectedMitra.terpakai_pengolahan || 0) >= 0.8 * (sbml?.pengolahan || 0)
                                        : (selectedMitra.max_pengolahan_sebulan || 0) >= 0.8 * (sbml?.pengolahan || 0);

                                    return (
                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                            {/* Card Total Honor */}
                                            <div className="p-4 rounded-xl bg-orange-50/60 dark:bg-gray-700/50 border border-orange-100 dark:border-gray-600">
                                                <div className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                    Total Honor Periode Ini
                                                </div>
                                                <div className="text-xl font-extrabold text-[#F26522] mt-1">
                                                    {formatRp(selectedMitra.total_honor)}
                                                </div>
                                                <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-1">
                                                    {selectedMitra.kegiatans.length} kegiatan
                                                </p>
                                            </div>

                                            {/* Card Pendataan */}
                                            <div className="p-4 rounded-xl bg-white dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600">
                                                <div className="flex justify-between items-center text-[11px] font-semibold text-gray-500 dark:text-gray-400">
                                                    <span className="uppercase tracking-wider">Honor Pendataan</span>
                                                    <span
                                                        className={`font-bold ${
                                                            isExceededPendataan
                                                                ? 'text-red-600 dark:text-red-400'
                                                                : isWarningPendataan
                                                                ? 'text-amber-600 dark:text-amber-400'
                                                                : 'text-orange-600 dark:text-orange-400'
                                                        }`}
                                                        title={isMonthly ? 'Utilisasi Pagu Bulan Ini' : 'Utilisasi Pagu Tertinggi dalam Sebulan'}
                                                    >
                                                        {pctPendataan}%{!isMonthly && <span className="text-[9px] font-normal text-gray-400 ml-1">(puncak/bln)</span>}
                                                    </span>
                                                </div>
                                                <div className="text-base font-bold text-gray-900 dark:text-white mt-1">
                                                    {formatRp(selectedMitra.terpakai_pendataan)}
                                                </div>
                                                <div className="w-full bg-gray-100 dark:bg-gray-600 h-1.5 rounded-full mt-2 overflow-hidden">
                                                    <div
                                                        className={`h-full rounded-full transition-all ${
                                                            isExceededPendataan
                                                                ? 'bg-red-500'
                                                                : isWarningPendataan
                                                                ? 'bg-amber-500'
                                                                : 'bg-[#F26522]'
                                                        }`}
                                                        style={{ width: `${Math.min(100, pctPendataan)}%` }}
                                                    />
                                                </div>
                                                <div className="flex justify-between items-center text-[10px] text-gray-400 dark:text-gray-500 mt-1">
                                                    <span>Pagu: {formatRp(sbml?.pendataan)}/bln</span>
                                                    {!isMonthly && (
                                                        <span>Maks: {formatRp(selectedMitra.max_pendataan_sebulan)}/bln</span>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Card Pengolahan */}
                                            <div className="p-4 rounded-xl bg-white dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600">
                                                <div className="flex justify-between items-center text-[11px] font-semibold text-gray-500 dark:text-gray-400">
                                                    <span className="uppercase tracking-wider">Honor Pengolahan</span>
                                                    <span
                                                        className={`font-bold ${
                                                            isExceededPengolahan
                                                                ? 'text-red-600 dark:text-red-400'
                                                                : isWarningPengolahan
                                                                ? 'text-amber-600 dark:text-amber-400'
                                                                : 'text-cyan-600 dark:text-cyan-400'
                                                        }`}
                                                        title={isMonthly ? 'Utilisasi Pagu Bulan Ini' : 'Utilisasi Pagu Tertinggi dalam Sebulan'}
                                                    >
                                                        {pctPengolahan}%{!isMonthly && <span className="text-[9px] font-normal text-gray-400 ml-1">(puncak/bln)</span>}
                                                    </span>
                                                </div>
                                                <div className="text-base font-bold text-gray-900 dark:text-white mt-1">
                                                    {formatRp(selectedMitra.terpakai_pengolahan)}
                                                </div>
                                                <div className="w-full bg-gray-100 dark:bg-gray-600 h-1.5 rounded-full mt-2 overflow-hidden">
                                                    <div
                                                        className={`h-full rounded-full transition-all ${
                                                            isExceededPengolahan
                                                                ? 'bg-red-500'
                                                                : isWarningPengolahan
                                                                ? 'bg-amber-500'
                                                                : 'bg-cyan-500'
                                                        }`}
                                                        style={{ width: `${Math.min(100, pctPengolahan)}%` }}
                                                    />
                                                </div>
                                                <div className="flex justify-between items-center text-[10px] text-gray-400 dark:text-gray-500 mt-1">
                                                    <span>Pagu: {formatRp(sbml?.pengolahan)}/bln</span>
                                                    {!isMonthly && (
                                                        <span>Maks: {formatRp(selectedMitra.max_pengolahan_sebulan)}/bln</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })()}

                                {/* Table Daftar Kegiatan */}
                                <div>
                                    <div className="flex items-center justify-between mb-2.5">
                                        <h4 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
                                            <Briefcase size={15} className="text-[#F26522]" />
                                            Kegiatan yang Ditugaskan ({selectedMitra.kegiatans.length})
                                        </h4>
                                        <span className="text-xs text-gray-400">Sesuai Filter: {filterLabel}</span>
                                    </div>

                                    <div className="border border-gray-100 dark:border-gray-700 rounded-xl overflow-hidden shadow-xs">
                                        <table className="w-full text-left border-collapse text-xs">
                                            <thead className="bg-gray-50 dark:bg-gray-700/60 text-gray-500 dark:text-gray-400 uppercase tracking-wider font-semibold border-b border-gray-100 dark:border-gray-700">
                                                <tr>
                                                    <th className="p-3 w-10 text-center">NO</th>
                                                    <th className="p-3">KEGIATAN & RINCIAN</th>
                                                    <th className="p-3 text-center">JENIS SBML</th>
                                                    <th className="p-3 text-center">PERIODE</th>
                                                    <th className="p-3 text-center">BEBAN TARGET</th>
                                                    <th className="p-3 text-right">HARGA SATUAN</th>
                                                    <th className="p-3 text-right">NILAI UANG</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-100 dark:divide-gray-700 text-gray-700 dark:text-gray-300">
                                                {selectedMitra.kegiatans.map((keg, kIdx) => (
                                                    <tr key={keg.id || kIdx} className="hover:bg-gray-50/70 dark:hover:bg-gray-700/30 transition">
                                                        <td className="p-3 text-center font-semibold text-gray-400">
                                                            {kIdx + 1}
                                                        </td>
                                                        <td className="p-3">
                                                            <div className="font-bold text-gray-900 dark:text-white">
                                                                {keg.nama_kegiatan}
                                                            </div>
                                                            {keg.detil_kegiatan && (
                                                                <div className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
                                                                    {keg.detil_kegiatan}
                                                                </div>
                                                            )}
                                                            {keg.kode_kegiatan && keg.kode_kegiatan !== '-' && (
                                                                <span className="font-mono text-[10px] text-gray-400">
                                                                    Kode: {keg.kode_kegiatan}
                                                                </span>
                                                            )}
                                                        </td>
                                                        <td className="p-3 text-center">
                                                            {keg.jenis_sbml === 'pengolahan' ? (
                                                                <span className="inline-block px-2 py-0.5 text-[10px] font-bold rounded bg-cyan-100 text-cyan-700 dark:bg-cyan-950/60 dark:text-cyan-300 uppercase">
                                                                    Pengolahan
                                                                </span>
                                                            ) : (
                                                                <span className="inline-block px-2 py-0.5 text-[10px] font-bold rounded bg-orange-100 text-[#F26522] dark:bg-orange-950/60 dark:text-orange-300 uppercase">
                                                                    Pendataan
                                                                </span>
                                                            )}
                                                        </td>
                                                        <td className="p-3 text-center text-gray-500 dark:text-gray-400 whitespace-nowrap">
                                                            {keg.periode_teks || `${keg.bulan}/${keg.tahun}`}
                                                        </td>
                                                        <td className="p-3 text-center font-semibold whitespace-nowrap">
                                                            {keg.kuota_target} {keg.satuan}
                                                        </td>
                                                        <td className="p-3 text-right text-gray-600 dark:text-gray-400 whitespace-nowrap">
                                                            {formatRp(keg.harga_satuan)}
                                                        </td>
                                                        <td className="p-3 text-right font-extrabold text-[#F26522] whitespace-nowrap">
                                                            {formatRp(keg.total_honor)}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                            <tfoot className="bg-gray-50 dark:bg-gray-700/60 font-bold border-t border-gray-200 dark:border-gray-700">
                                                <tr>
                                                    <td colSpan={6} className="p-3 text-right uppercase text-gray-600 dark:text-gray-300">
                                                        Total Honor Mitra:
                                                    </td>
                                                    <td className="p-3 text-right text-sm text-[#F26522] font-black whitespace-nowrap">
                                                        {formatRp(selectedMitra.total_honor)}
                                                    </td>
                                                </tr>
                                            </tfoot>
                                        </table>
                                    </div>
                                </div>
                            </div>

                            {/* Modal Footer */}
                            <div className="p-4 border-t border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/80 flex justify-between items-center">
                                <div className="text-xs text-gray-400">
                                    Tekan tombol <kbd className="px-1.5 py-0.5 bg-gray-200 dark:bg-gray-700 rounded text-[10px] font-mono">ESC</kbd> untuk menutup
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setSelectedMitra(null)}
                                    className="px-4 py-2 text-xs font-semibold text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 border border-gray-200 dark:border-gray-600 rounded-xl transition cursor-pointer"
                                >
                                    Tutup
                                </button>
                            </div>
                        </div>
                    </div>
                )}

            </div>
        </AuthenticatedLayout>
    );
}
