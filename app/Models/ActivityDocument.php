<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;

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

    protected $appends = [
        'formatted_size',
        'url',
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

    public function updater()
    {
        return $this->belongsTo(User::class, 'updated_by');
    }

    /**
     * Format ukuran file ke format yang mudah dibaca (KB / MB).
     */
    public function getFormattedSizeAttribute(): string
    {
        $bytes = (int) $this->file_size;
        if ($bytes >= 1048576) {
            return number_format($bytes / 1048576, 1) . ' MB';
        } elseif ($bytes >= 1024) {
            return number_format($bytes / 1024, 0) . ' KB';
        }
        return $bytes . ' B';
    }

    /**
     * URL publik untuk akses/download file via storage link.
     */
    public function getUrlAttribute(): string
    {
        if (empty($this->file_path)) {
            return '';
        }
        return asset('storage/' . ltrim($this->file_path, '/'));
    }
}
