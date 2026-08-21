<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class UserController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return Inertia::render('Users/Index');
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('Users/Create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'username' => 'required|string|max:255|unique:users,username',
            'password' => 'nullable|string|min:6',
            'nama_lengkap' => 'required|string|max:255',
            'sobat_id' => 'nullable|string|max:50',
            'role' => 'nullable|string',
        ]);
        
        $sobatId = !empty($validated['sobat_id']) ? trim($validated['sobat_id']) : null;
        $plainPassword = !empty($validated['password']) 
            ? $validated['password'] 
            : ($sobatId ?? $validated['username']);

        $roleLower = strtolower($validated['role'] ?? 'operator');
        $role = match ($roleLower) {
            'admin', 'administrator' => 'Admin',
            'viewer' => 'Viewer',
            'mitra' => 'Mitra',
            default => 'Operator',
        };

        User::create([
            'name' => $validated['nama_lengkap'],
            'username' => $validated['username'],
            'sobat_id' => $sobatId,
            'password' => Hash::make($plainPassword),
            'role' => $role,
        ]);
        
        return redirect()->route('users.index')->with('message', 'User berhasil ditambahkan.');
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit()
    {
        return Inertia::render('Users/Edit');
    }

    /**
     * Tampilkan data terhapus (Recycle Bin).
     */
    public function recycleBin(Request $request)
    {
        $query = User::onlyTrashed();

        if ($request->filled('search')) {
            $query->where(function ($q) use ($request) {
                $q->where('name', 'like', '%' . $request->search . '%')
                  ->orWhere('username', 'like', '%' . $request->search . '%');
            });
        }

        $trashedUsers = $query->latest('deleted_at')->paginate(15)->withQueryString();

        return Inertia::render('Users/RecycleBin', [
            'trashedUsers' => $trashedUsers,
            'filters' => $request->only(['search']),
        ]);
    }
    
    /**
     * Restore data user.
     */
    public function restore($id)
    {
        $user = User::onlyTrashed()->findOrFail($id);
        $name = $user->name;
        $user->restore();

        return redirect()->back()->with('success', "User '{$name}' berhasil dipulihkan dari Recycle Bin.");
    }

    /**
     * Force delete data user.
     */
    public function forceDelete($id)
    {
        $user = User::onlyTrashed()->findOrFail($id);
        $name = $user->name;
        $user->forceDelete();

        return redirect()->back()->with('success', "User '{$name}' telah dihapus secara permanen.");
    }
    
    /**
     * Restore multiple resources from recycle bin.
     */
    public function bulkRestore(Request $request)
    {
        $request->validate([
            'ids'   => 'required|array|min:1',
            'ids.*' => 'integer|exists:users,id'
        ]);

        User::onlyTrashed()->whereIn('id', $request->ids)->restore();

        return redirect()->back()->with('success', count($request->ids) . ' user berhasil dipulihkan.');
    }

    /**
     * Force delete multiple resources from recycle bin.
     */
    public function bulkForceDelete(Request $request)
    {
        $request->validate([
            'ids'   => 'required|array|min:1',
            'ids.*' => 'integer|exists:users,id'
        ]);

        User::onlyTrashed()->whereIn('id', $request->ids)->forceDelete();

        return redirect()->back()->with('success', count($request->ids) . ' user telah dihapus secara permanen.');
    }
}
