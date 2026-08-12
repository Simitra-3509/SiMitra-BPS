<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'username',
        'sobat_id',
        'email',
        'password',
        'role',
        'pegawai_id',
        'is_locked',
    ];

    protected $appends = ['nama_lengkap', 'status'];

    public function getNamaLengkapAttribute()
    {
        return $this->name ?? $this->username;
    }

    public function getStatusAttribute()
    {
        return $this->is_locked ? 'Nonaktif' : 'Aktif';
    }

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    /**
     * Check if user is Admin.
     */
    public function isAdmin(): bool
    {
        return strtolower($this->role ?? '') === 'admin';
    }

    /**
     * Check if user is Operator.
     */
    public function isOperator(): bool
    {
        return strtolower($this->role ?? '') === 'operator';
    }

    /**
     * Check if user has specific role(s).
     *
     * @param string|array $roles
     */
    public function hasRole(string|array $roles): bool
    {
        $currentRole = strtolower($this->role ?? '');
        if (is_array($roles)) {
            return in_array($currentRole, array_map('strtolower', $roles));
        }

        return $currentRole === strtolower($roles);
    }
}
