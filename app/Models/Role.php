<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Role extends Model
{
    use HasFactory, HasUuids;

    protected $table = 'roles';

    protected $fillable = [
        'code',
        'name',
        'scope_type',
        'description',
    ];

    /**
     * Relasi ke seluruh pengguna yang memiliki peran ini.
     *
     * @return HasMany<User>
     */
    public function users(): HasMany
    {
        return $this->hasMany(User::class, 'role_id');
    }

    /**
     * Relasi ke konfigurasi hak akses kriteria untuk peran ini.
     *
     * @return HasMany<RoleCriteriaAccess>
     */
    public function criteriaAccess(): HasMany
    {
        return $this->hasMany(RoleCriteriaAccess::class, 'role_id');
    }

    /**
     * Memeriksa apakah peran ini terkunci pada level Program Studi.
     *
     * @return bool
     */
    public function isProdiScoped(): bool
    {
        return $this->scope_type === 'prodi';
    }

    /**
     * Memeriksa apakah peran ini berlaku di level institusi (lintas unit).
     *
     * @return bool
     */
    public function isInstitusiScoped(): bool
    {
        return $this->scope_type === 'institusi';
    }
}

