<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Agency extends Model
{
    use HasFactory, HasUuids;

    protected $table = 'agencies';

    protected $fillable = [
        'code',
        'name',
        'name_agency',
        'type',
        'level',
    ];

    public function criterias()
    {
        return $this->hasMany(Criteria::class, 'agency_id');
    }

    public function prodis()
    {
        return $this->hasMany(Prodi::class, 'agency_id');
    }

    public function sessions()
    {
        return $this->hasMany(AccreditationSession::class, 'agency_id');
    }
}
