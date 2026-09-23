<?php

namespace App\Services;

use App\Models\ActivityLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class ActivityLogger
{
    /**
     * Record an activity in the activity_log table for audit trail.
     *
     * @param string $aktivitas Description of the action (e.g., 'Mengunci periode penugasan bulan 9 tahun 2026')
     * @param Request|null $request Current HTTP request
     * @param mixed $user Optional User instance (defaults to Auth::user())
     */
    public static function log(string $aktivitas, ?Request $request = null, $user = null): ?ActivityLog
    {
        try {
            $currentUser = $user ?? Auth::user();
            $currentReq = $request ?? request();

            return ActivityLog::create([
                'user_id'    => $currentUser ? $currentUser->id : null,
                'aktivitas'  => $aktivitas,
                'ip_address' => $currentReq ? $currentReq->ip() : null,
                'user_agent' => $currentReq ? substr((string) $currentReq->userAgent(), 0, 500) : null,
            ]);
        } catch (\Throwable $e) {
            // Log silently to system log so business flow is never interrupted
            Log::warning('Gagal mencatat audit activity log: ' . $e->getMessage());
            return null;
        }
    }
}
