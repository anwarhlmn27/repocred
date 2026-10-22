<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AcademicYear extends Model
{
    use HasFactory, HasUuids;

    protected $table = 'academicyears';

    protected $fillable = [
        'year',
    ];

    public function activities()
    {
        return $this->hasMany(Activity::class, 'academicyear_id');
    }
}
