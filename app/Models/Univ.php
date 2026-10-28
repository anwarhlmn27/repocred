<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Univ extends Model
{
    use HasFactory, HasUuids;

    protected $table = 'univs';

    protected $fillable = [
        'code',
        'name',
        'acronym',
        'address',
        'logo',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    // Accessor untuk backward compatibility jika ada kode lama memanggil name_univ
    public function getNameUnivAttribute()
    {
        return $this->attributes['name'] ?? null;
    }

    public function faculties()
    {
        return $this->hasMany(Faculty::class, 'univ_id');
    }
}
