<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Activity extends Model
{
    use HasFactory, HasUuids;

    protected $table = 'activities';

    protected $fillable = [
        'criteria_id',
        'prodi_id',
        'title_activity',
        'description',
        'academicyear_id',
        'academic_year',
        'created_by',
        'updated_by',
        'status',
    ];

    public function academicYear()
    {
        return $this->belongsTo(AcademicYear::class, 'academicyear_id');
    }

    public function criteria()
    {
        return $this->belongsTo(Criteria::class, 'criteria_id');
    }

    public function prodi()
    {
        return $this->belongsTo(Prodi::class, 'prodi_id');
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function updater()
    {
        return $this->belongsTo(User::class, 'updated_by');
    }

    public function documents()
    {
        return $this->hasMany(ActivityDocument::class, 'activity_id');
    }
}
