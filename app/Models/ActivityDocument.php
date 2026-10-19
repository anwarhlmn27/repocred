<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ActivityDocument extends Model
{
    use HasFactory, HasUuids;

    protected $table = 'activity_documents';

    protected $fillable = [
        'activity_id',
        'ppepp_id',
        'filename',
        'file_path',
        'file_type',
        'file_size',
        'uploaded_by',
        'updated_by',
    ];

    public function activity()
    {
        return $this->belongsTo(Activity::class, 'activity_id');
    }

    public function ppepp()
    {
        return $this->belongsTo(Ppepp::class, 'ppepp_id');
    }

    public function uploader()
    {
        return $this->belongsTo(User::class, 'uploaded_by');
    }
}
