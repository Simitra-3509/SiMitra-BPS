<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class HonorariumStatusChanged extends Notification
{
    use Queueable;

    public array $payload;

    /**
     * Create a new notification instance.
     */
    public function __construct(array $payload)
    {
        $this->payload = array_merge([
            'honorarium_id'     => null,
            'jenis_perubahan'   => '',
            'catatan_ppk'       => null,
            'data_lama'         => null,
            'data_baru'         => null,
            'highlight_cleared' => false,
        ], $payload);
    }

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['database'];
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return $this->payload;
    }
}
