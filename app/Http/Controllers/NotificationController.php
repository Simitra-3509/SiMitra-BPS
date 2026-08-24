<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class NotificationController extends Controller
{
    /**
     * Tandai semua notifikasi pengguna saat ini sebagai dibaca.
     */
    public function markAllRead(Request $request)
    {
        $user = $request->user();
        if ($user) {
            $user->unreadNotifications->markAsRead();
        }

        return redirect()->back()->with('message', 'Semua notifikasi telah ditandai dibaca.');
    }

    /**
     * Tandai 1 notifikasi spesifik sebagai dibaca.
     */
    public function markAsRead(Request $request, $id)
    {
        $user = $request->user();
        if ($user) {
            $notification = $user->notifications()->where('id', $id)->first();
            if ($notification) {
                $notification->markAsRead();
            }
        }

        return redirect()->back();
    }

    /**
     * Set highlight_cleared = true pada notifikasi spesifik.
     */
    public function clearHighlight(Request $request, $id)
    {
        $user = $request->user();
        if ($user) {
            $notification = $user->notifications()->where('id', $id)->first();
            if ($notification) {
                $data = $notification->data;
                $data['highlight_cleared'] = true;
                $notification->data = $data;
                $notification->save();
            }
        }

        return response()->json(['success' => true]);
    }
}
