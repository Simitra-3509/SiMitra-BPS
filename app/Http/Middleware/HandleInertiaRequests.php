<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;
use App\Models\Mitra;
use App\Models\Kegiatan;
use App\Models\Penugasan;
use App\Models\Honorarium;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that is loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determine the current asset version.
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        return [
            ...parent::share($request),
            'auth' => [
                'user' => $request->user(),
            ],
            'flash' => [
                'message' => fn () => $request->session()->get('message')
            ],
            'counts' => [
                'recycleBinMitra' => fn () => $request->user() ? Mitra::onlyTrashed()->count() : 0,
                'recycleBinKegiatan' => fn () => $request->user() ? Kegiatan::onlyTrashed()->count() : 0,
                'recycleBinPenugasan' => fn () => $request->user() ? Penugasan::onlyTrashed()->count() : 0,
                'recycleBinHonorarium' => fn () => $request->user() ? Honorarium::onlyTrashed()->count() : 0,
            ],
        ];
    }
}
