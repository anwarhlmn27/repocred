<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AccreditationSession extends Model
{
    use HasFactory, HasUuids;

    protected $table = 'accreditation_sessions';

    protected $fillable = [
        'prodi_id',
        'agency_id',
        'name',
        'year_start',
        'year_end',
        'status',
        'ts_count',
        'ts_year',
        'sk_number',
        'achieved_rating',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'ts_count' => 'integer',
        'year_start' => 'integer',
        'year_end' => 'integer',
        'ts_year' => 'integer',
    ];

    public function prodi()
    {
        return $this->belongsTo(Prodi::class, 'prodi_id');
    }

    public function agency()
    {
        return $this->belongsTo(Agency::class, 'agency_id');
    }

    public function activities()
    {
        return $this->hasMany(Activity::class, 'session_id');
    }
}
