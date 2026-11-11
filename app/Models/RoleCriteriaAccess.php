<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class RoleCriteriaAccess extends Model
{
    use HasFactory, HasUuids;

    protected $table = 'role_criteria_access';

    protected $fillable = [
        'role_id',
        'agency_level',
        'criteria_number',
        'is_primary',
        'can_upload',
        'can_verify',
    ];

    protected $casts = [
        'criteria_number' => 'integer',
        'is_primary' => 'boolean',
        'can_upload' => 'boolean',
        'can_verify' => 'boolean',
    ];

    /**
     * Relasi ke data Role pemilik hak akses kriteria.
     *
     * @return BelongsTo<Role, RoleCriteriaAccess>
     */
    public function role(): BelongsTo
    {
        return $this->belongsTo(Role::class, 'role_id');
    }
}

