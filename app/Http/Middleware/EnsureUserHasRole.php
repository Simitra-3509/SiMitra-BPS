<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureUserHasRole
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     * @param  string  ...$roles
     */
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        $user = $request->user();
        if (! $user) {
            return redirect()->route('login');
        }

        $userRole = strtolower($user->role ?? '');
        if ($userRole === 'administrator') {
            $userRole = 'admin';
        }

        $allowedRoles = array_map(function ($r) {
            $r = strtolower($r);
            return $r === 'administrator' ? 'admin' : $r;
        }, $roles);

        if (! empty($roles) && ! in_array($userRole, $allowedRoles)) {
            abort(Response::HTTP_FORBIDDEN, 'Anda tidak memiliki hak akses untuk membuka halaman ini.');
        }

        return $next($request);
    }
}
