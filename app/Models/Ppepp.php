<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Ppepp extends Model
{
    use HasFactory, HasUuids;

    protected $table = 'ppepps';

    protected $fillable = [
        'code_ppepp',
        'title_ppepp',
    ];

    public function documents()
    {
        return $this->hasMany(ActivityDocument::class, 'ppepp_id');
    }
}
