import { useState, useEffect } from 'react';
import InputError from '@/Components/InputError';
import { Head, useForm } from '@inertiajs/react';
import { User, Lock, Eye, EyeOff, LogIn, Shield, BarChart3, Activity, Users2 } from 'lucide-react';
import AmbientLineChart from '@/Components/AmbientLineChart';

export default function Login({ status, canResetPassword }) {
    const [showPassword, setShowPassword] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const { data, setData, post, processing, errors, reset } = useForm({
        username: '',
        password: '',
        remember: false,
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <>
            <Head title="SIMITRA — Login" />

            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');

                * { font-family: 'Inter', sans-serif; box-sizing: border-box; margin: 0; padding: 0; }

                .login-root {
                    min-height: 100vh;
                    display: flex;
                    align-items: stretch;
                    background: #09090b;
                }

                /* ── LEFT PANEL ── */
                .left-panel {
                    display: none;
                    flex-direction: column;
                    justify-content: space-between;
                    position: relative;
                    overflow: hidden;
                    padding: 2.5rem;
                    background: linear-gradient(145deg, #0f172a 0%, #1a2744 40%, #0f172a 100%);
                    flex: 1;
                }

                @media (min-width: 1024px) {
                    .left-panel { display: flex; }
                }

                /* Animated glow orbs */
                .orb {
                    position: absolute;
                    border-radius: 50%;
                    filter: blur(80px);
                    opacity: 0.25;
                    animation: floatOrb 8s ease-in-out infinite;
                }
                .orb-1 { width: 380px; height: 380px; background: #ea580c; top: -80px; left: -80px; animation-delay: 0s; }
                .orb-2 { width: 300px; height: 300px; background: #3b82f6; bottom: 60px; right: -60px; animation-delay: 3s; }
                .orb-3 { width: 220px; height: 220px; background: #f97316; top: 50%; left: 50%; transform: translate(-50%,-50%); animation-delay: 1.5s; }

                @keyframes floatOrb {
                    0%, 100% { transform: translateY(0px) scale(1); }
                    50% { transform: translateY(-30px) scale(1.05); }
                }
                .orb-3 { animation: floatOrb3 10s ease-in-out infinite; }
                @keyframes floatOrb3 {
                    0%, 100% { transform: translate(-50%,-50%) scale(1); }
                    50% { transform: translate(-50%, calc(-50% - 20px)) scale(1.08); }
                }

                /* Grid lines overlay */
                .grid-overlay {
                    position: absolute; inset: 0;
                    background-image:
                        linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
                        linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px);
                    background-size: 50px 50px;
                }

                .left-content { position: relative; z-index: 10; }

                .brand-logo {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                }
                .brand-logo .logo-icon {
                    width: 42px; height: 42px;
                    background: linear-gradient(135deg, #f97316, #ea580c);
                    border-radius: 10px;
                    display: flex; align-items: center; justify-content: center;
                    box-shadow: 0 0 20px rgba(249,115,22,0.4);
                }
                .brand-logo .logo-img {
                    width: 42px; height: 42px;
                    border-radius: 10px;
                    object-fit: contain;
                    box-shadow: 0 0 20px rgba(249,115,22,0.4);
                }
                .brand-logo .logo-text-main {
                    font-size: 1.1rem; font-weight: 800; color: #fff; letter-spacing: 0.05em;
                }
                .brand-logo .logo-text-sub {
                    font-size: 0.65rem; font-weight: 400; color: #94a3b8; letter-spacing: 0.08em; text-transform: uppercase;
                }

                .left-hero { margin-top: auto; padding-bottom: 1rem; }
                .left-hero h2 {
                    font-size: 2.25rem; font-weight: 800;
                    color: #fff; line-height: 1.2;
                    margin-bottom: 1rem;
                }
                .left-hero h2 span { color: #f97316; }
                .left-hero p { font-size: 0.875rem; color: #94a3b8; line-height: 1.7; max-width: 340px; }



                /* Stats cards */
                .stats-row { display: flex; gap: 0.75rem; margin-top: 2rem; }
                .stat-card {
                    flex: 1;
                    background: rgba(255,255,255,0.06);
                    border: 1px solid rgba(255,255,255,0.1);
                    border-radius: 12px;
                    padding: 0.875rem;
                    backdrop-filter: blur(8px);
                    transition: transform 0.2s;
                }
                .stat-card:hover { transform: translateY(-2px); }
                .stat-card .stat-icon {
                    width: 32px; height: 32px;
                    background: rgba(249,115,22,0.2);
                    border-radius: 8px;
                    display: flex; align-items: center; justify-content: center;
                    margin-bottom: 0.5rem;
                }
                .stat-card .stat-label { font-size: 0.65rem; color: #64748b; text-transform: uppercase; letter-spacing: 0.08em; }
                .stat-card .stat-val { font-size: 1.2rem; font-weight: 700; color: #fff; margin-top: 0.1rem; }

                .left-footer { position: relative; z-index: 10; font-size: 0.7rem; color: #475569; }

                /* ── RIGHT PANEL ── */
                .right-panel {
                    width: 100%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: linear-gradient(160deg, #18181b 0%, #0f172a 100%);
                    padding: 2rem 1.5rem;
                    min-height: 100vh;
                }
                @media (min-width: 1024px) {
                    .right-panel {
                        width: 480px;
                        min-width: 480px;
                        flex-shrink: 0;
                    }
                }

                .login-card {
                    width: 100%;
                    max-width: 400px;
                    opacity: 0;
                    transform: translateY(24px);
                    transition: opacity 0.6s ease, transform 0.6s ease;
                }
                .login-card.mounted { opacity: 1; transform: translateY(0); }

                .card-header {
                    text-align: center;
                    margin-bottom: 2rem;
                }


                .icon-ring {
                    width: 72px; height: 72px;
                    background: transparent;
                    border-radius: 50%;
                    display: flex; align-items: center; justify-content: center;
                    margin: 0 auto 1.25rem;
                    box-shadow: 0 0 0 8px rgba(234,88,12,0.12), 0 0 0 16px rgba(234,88,12,0.06);
                    position: relative;
                    overflow: hidden;
                }
                .icon-ring::after {
                    content: '';
                    position: absolute; inset: -4px;
                    border-radius: 50%;
                    border: 2px solid rgba(249,115,22,0.3);
                    animation: ripplePulse 2s ease-in-out infinite;
                }
                .icon-ring img {
                    width: 100%; height: 100%;
                    object-fit: cover;
                    border-radius: 50%;
                }
                @keyframes ripplePulse {
                    0%, 100% { opacity: 1; transform: scale(1); }
                    50% { opacity: 0.5; transform: scale(1.1); }
                }

                .card-header h1 { font-size: 1.6rem; font-weight: 800; color: #f1f5f9; letter-spacing: -0.02em; }
                .card-header p { font-size: 0.775rem; color: #64748b; margin-top: 0.25rem; text-transform: uppercase; letter-spacing: 0.1em; }

                /* Glassmorphism form box */
                .form-box {
                    background: rgba(255,255,255,0.04);
                    border: 1px solid rgba(255,255,255,0.08);
                    border-radius: 20px;
                    padding: 2rem;
                    backdrop-filter: blur(12px);
                    box-shadow: 0 32px 64px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.04) inset;
                }

                .status-banner {
                    margin-bottom: 1.25rem;
                    padding: 0.75rem 1rem;
                    background: rgba(34,197,94,0.1);
                    border: 1px solid rgba(34,197,94,0.2);
                    border-radius: 10px;
                    font-size: 0.8rem;
                    color: #4ade80;
                }

                /* Input groups */
                .input-group { margin-bottom: 1.25rem; }
                .input-label {
                    display: flex; align-items: center; gap: 0.4rem;
                    font-size: 0.75rem; font-weight: 600;
                    color: #94a3b8; text-transform: uppercase; letter-spacing: 0.08em;
                    margin-bottom: 0.5rem;
                }
                .input-wrap {
                    position: relative;
                    display: flex;
                    align-items: center;
                    background: rgba(255,255,255,0.05);
                    border: 1.5px solid rgba(255,255,255,0.08);
                    border-radius: 12px;
                    transition: border-color 0.2s, box-shadow 0.2s, background 0.2s;
                    overflow: hidden;
                }
                .input-wrap:focus-within {
                    border-color: rgba(249,115,22,0.6);
                    box-shadow: 0 0 0 3px rgba(249,115,22,0.12);
                    background: rgba(249,115,22,0.04);
                }
                .input-icon {
                    position: absolute; left: 14px;
                    color: #475569;
                    display: flex; align-items: center;
                    pointer-events: none;
                    transition: color 0.2s;
                }
                .input-wrap:focus-within .input-icon { color: #f97316; }
                .field-input {
                    width: 100%;
                    padding: 0.875rem 0.875rem 0.875rem 2.75rem;
                    background: transparent;
                    border: none; outline: none;
                    font-size: 0.875rem;
                    color: #e2e8f0;
                    font-family: 'Inter', sans-serif;
                }
                .field-input::placeholder { color: #475569; }
                .field-input:-webkit-autofill,
                .field-input:-webkit-autofill:hover,
                .field-input:-webkit-autofill:focus {
                    -webkit-text-fill-color: #e2e8f0;
                    -webkit-box-shadow: 0 0 0px 1000px transparent inset;
                    transition: background-color 9999s ease-in-out 0s;
                }
                .toggle-btn {
                    padding: 0.875rem 0.875rem;
                    color: #475569;
                    background: transparent;
                    border: none; cursor: pointer;
                    display: flex; align-items: center; justify-content: center;
                    transition: color 0.2s;
                    flex-shrink: 0;
                }
                .toggle-btn:hover { color: #f97316; }

                .error-msg { font-size: 0.72rem; color: #f87171; margin-top: 0.4rem; padding-left: 0.25rem; }

                /* Submit btn */
                .submit-btn {
                    width: 100%;
                    margin-top: 1.75rem;
                    padding: 0.9rem;
                    background: linear-gradient(135deg, #ea580c, #f97316);
                    color: #fff;
                    font-size: 0.875rem;
                    font-weight: 700;
                    letter-spacing: 0.1em;
                    text-transform: uppercase;
                    border: none; border-radius: 12px;
                    cursor: pointer;
                    display: flex; align-items: center; justify-content: center; gap: 0.5rem;
                    box-shadow: 0 8px 24px rgba(234,88,12,0.35);
                    transition: transform 0.15s, box-shadow 0.15s, opacity 0.15s;
                    position: relative; overflow: hidden;
                    font-family: 'Inter', sans-serif;
                }
                .submit-btn::before {
                    content: '';
                    position: absolute; inset: 0;
                    background: linear-gradient(135deg, rgba(255,255,255,0.15), transparent);
                }
                .submit-btn:hover:not(:disabled) {
                    transform: translateY(-1px);
                    box-shadow: 0 12px 32px rgba(234,88,12,0.45);
                }
                .submit-btn:active:not(:disabled) { transform: translateY(0px); }
                .submit-btn:disabled { opacity: 0.6; cursor: not-allowed; }

                /* Loading spinner */
                @keyframes spin { to { transform: rotate(360deg); } }
                .spinner {
                    width: 16px; height: 16px;
                    border: 2px solid rgba(255,255,255,0.3);
                    border-top-color: #fff;
                    border-radius: 50%;
                    animation: spin 0.7s linear infinite;
                }

                /* Security note */
                .security-note {
                    display: flex; align-items: flex-start; gap: 0.5rem;
                    margin-top: 1.25rem;
                    font-size: 0.7rem;
                    color: #475569;
                    line-height: 1.5;
                    padding: 0.625rem 0.75rem;
                    background: rgba(255,255,255,0.02);
                    border: 1px solid rgba(255,255,255,0.05);
                    border-radius: 8px;
                }
                .security-note svg { flex-shrink: 0; margin-top: 0.05rem; color: #f97316; opacity: 0.7; }

                /* Card footer */
                .card-footer {
                    margin-top: 1.75rem;
                    text-align: center;
                    border-top: 1px solid rgba(255,255,255,0.06);
                    padding-top: 1.25rem;
                }
                .card-footer .org { font-size: 0.75rem; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.08em; }
                .card-footer .version { font-size: 0.67rem; color: #374151; margin-top: 0.2rem; }
                .card-footer .dev { font-size: 0.67rem; color: #374151; margin-top: 0.1rem; }
                .card-footer .dev a { color: #f97316; text-decoration: none; transition: color 0.2s; }
                .card-footer .dev a:hover { color: #ea580c; }
            `}</style>

            <div className="login-root">
                {/* ── LEFT PANEL ── */}
                <div className="left-panel">
                    <div className="orb orb-1" />
                    <div className="orb orb-2" />
                    <div className="orb orb-3" />
                    <div className="grid-overlay" />

                    <div className="left-content">
                        <div className="brand-logo">
                            <img src="/logo.png" alt="SIMITRA" className="logo-img" />
                            <div>
                                <div className="logo-text-main">SIMITRA</div>
                                <div className="logo-text-sub">BPS Kabupaten Jember</div>
                            </div>
                        </div>
                    </div>

                    <div className="left-hero left-content">
                        <h2>
                            Sistem Informasi<br />
                            <span>Mitra Terpadu</span>
                        </h2>
                        <p>
                            Platform manajemen mitra statistik BPS Kabupaten Jember yang terintegrasi untuk pengelolaan kegiatan, penugasan, dan honorarium secara efisien.
                        </p>

                        {/* ══ Minimalist Animated Line Chart ══ */}
                        <AmbientLineChart />

                        <div className="stats-row">
                            <div className="stat-card">
                                <div className="stat-icon">
                                    <Users2 size={16} color="#f97316" />
                                </div>
                                <div className="stat-label">Mitra</div>
                                <div className="stat-val">177+</div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-icon">
                                    <Activity size={16} color="#f97316" />
                                </div>
                                <div className="stat-label">Kegiatan</div>
                                <div className="stat-val">SE 2026</div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-icon">
                                    <BarChart3 size={16} color="#f97316" />
                                </div>
                                <div className="stat-label">Sistem</div>
                                <div className="stat-val">v2.0</div>
                            </div>
                        </div>
                    </div>

                    <div className="left-footer left-content">
                        © 2026 BPS Kabupaten Jember · Sensus Ekonomi 2026
                    </div>
                </div>

                {/* ── RIGHT PANEL ── */}
                <div className="right-panel">
                    <div className={`login-card${mounted ? ' mounted' : ''}`}>

                        {/* Header */}
                        <div className="card-header">
                            <div className="icon-ring">
                                <img src="/logo.png" alt="SIMITRA" />
                            </div>
                            <h1>SIMITRA</h1>
                            <p>Masuk ke Akun Anda</p>
                        </div>

                        {/* Form Box */}
                        <div className="form-box">
                            {status && (
                                <div className="status-banner">{status}</div>
                            )}

                            <form onSubmit={submit}>
                                {/* Username */}
                                <div className="input-group">
                                    <label htmlFor="username" className="input-label">
                                        <User size={12} />
                                        Username
                                    </label>
                                    <div className="input-wrap">
                                        <span className="input-icon">
                                            <User size={16} />
                                        </span>
                                        <input
                                            id="username"
                                            type="text"
                                            name="username"
                                            value={data.username}
                                            placeholder="Masukkan username"
                                            className="field-input"
                                            autoComplete="username"
                                            autoFocus
                                            onChange={(e) => setData('username', e.target.value)}
                                        />
                                    </div>
                                    {errors.username && (
                                        <div className="error-msg">⚠ {errors.username}</div>
                                    )}
                                </div>

                                {/* Password */}
                                <div className="input-group">
                                    <label htmlFor="password" className="input-label">
                                        <Lock size={12} />
                                        Password
                                    </label>
                                    <div className="input-wrap">
                                        <span className="input-icon">
                                            <Lock size={16} />
                                        </span>
                                        <input
                                            id="password"
                                            type={showPassword ? 'text' : 'password'}
                                            name="password"
                                            value={data.password}
                                            placeholder="Masukkan password"
                                            className="field-input"
                                            autoComplete="current-password"
                                            onChange={(e) => setData('password', e.target.value)}
                                        />
                                        <button
                                            type="button"
                                            className="toggle-btn"
                                            onClick={() => setShowPassword(!showPassword)}
                                            tabIndex={-1}
                                            title={showPassword ? 'Sembunyikan' : 'Tampilkan'}
                                        >
                                            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                        </button>
                                    </div>
                                    {errors.password && (
                                        <div className="error-msg">⚠ {errors.password}</div>
                                    )}
                                </div>

                                {/* Submit */}
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="submit-btn"
                                >
                                    {processing ? (
                                        <>
                                            <span className="spinner" />
                                            <span>Memproses...</span>
                                        </>
                                    ) : (
                                        <>
                                            <LogIn size={16} />
                                            <span>MASUK</span>
                                        </>
                                    )}
                                </button>

                                {/* Security note */}
                                <div className="security-note">
                                    <Shield size={13} />
                                    <span>Percobaan login gagal akan dicatat. Akun terkunci otomatis setelah <strong>5 percobaan</strong> gagal.</span>
                                </div>
                            </form>
                        </div>

                        {/* Footer */}
                        <div className="card-footer">
                            <div className="org">BPS Kabupaten Jember</div>
                            <div className="version">SIMITRA V2.0 · Sensus Ekonomi 2026</div>
                            <div className="dev">Developed by <a href="#">Nanang Pamungkas</a></div>
                        </div>

                    </div>
                </div>
            </div>
        </>
    );
}
