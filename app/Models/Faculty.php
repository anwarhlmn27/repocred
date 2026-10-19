<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Faculty extends Model
{
    use HasFactory, HasUuids;

    protected $table = 'faculties';

    protected $fillable = [
        'univ_id',
        'code',
        'name',
        'acronym',
        'is_active',
        'name_faculty',
        'created_by',
        'updated_by',
    ];

    public function univ()
    {
        return $this->belongsTo(Univ::class, 'univ_id');
    }

    public function prodis()
    {
        return $this->hasMany(Prodi::class, 'faculty_id');
    }
}
