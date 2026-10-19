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
        'name_univ',
        'created_by',
        'updated_by',
    ];

    public function faculties()
    {
        return $this->hasMany(Faculty::class, 'univ_id');
    }
}
