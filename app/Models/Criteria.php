<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Criteria extends Model
{
    use HasFactory, HasUuids;

    protected $table = 'criterias';

    protected $fillable = [
        'agency_id',
        'code',
        'name',
        'sequence',
        'code_criteria',
        'title_criteria',
        'type',
    ];

    public function agency()
    {
        return $this->belongsTo(Agency::class, 'agency_id');
    }

    public function activities()
    {
        return $this->hasMany(Activity::class, 'criteria_id');
    }
}
