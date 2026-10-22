<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Prodi extends Model
{
    use HasFactory, HasUuids;

    protected $table = 'prodis';

    protected $fillable = [
        'faculty_id',
        'agency_id',
        'code',
        'name',
        'acronym',
        'is_active',
        'name_prodi',
        'degree',
        'created_by',
        'updated_by',
    ];

    public function faculty()
    {
        return $this->belongsTo(Faculty::class, 'faculty_id');
    }

    public function agency()
    {
        return $this->belongsTo(Agency::class, 'agency_id');
    }

    public function sessions()
    {
        return $this->hasMany(AccreditationSession::class, 'prodi_id');
    }

    public function activities()
    {
        return $this->hasMany(Activity::class, 'prodi_id');
    }
}
