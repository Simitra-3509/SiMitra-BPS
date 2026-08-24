<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class ForceChangePassword
{
    /**
     * Handle an incoming request.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        if (Auth::check() && Auth::user()->must_change_password) {
            $allowedRoutes = [
                'profile.edit',
                'profile.update',
                'password.update',
                'logout',
            ];

            if (!$request->routeIs($allowedRoutes)) {
                // If it's an Inertia response, Inertia handles the redirect seamlessly.
                // We'll redirect to profile.edit with a flash message.
                return redirect()->route('profile.edit')->with('error', 'Anda harus mengubah password default Anda sebelum dapat mengakses halaman lain.');
            }
        }

        return $next($request);
    }
}
