<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Recipe extends Model
{
    use HasFactory;

    // Daftar atribut yang dapat diisi secara massal
    protected $fillable = [
        'title',
        'slug',
        'category_id',
        'energy',
        'carbohydrate',
        'protein',
        'ingredients',
        'method',
        'tips',
        'thumbnail',
        'author_id',
    ];

    /**
     * Relasi dengan kategori resep.
     */
    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    /**
     * Relasi dengan komentar resep.
     */
    public function comments()
    {
        return $this->hasMany(Comment::class);
    }

    /**
     * Relasi dengan rating resep.
     */
    public function ratings()
    {
        return $this->hasMany(Rating::class);
    }

    /**
     * Relasi untuk mendapatkan informasi pengguna yang membuat resep.
     */
    public function author()
    {
        return $this->belongsTo(User::class, 'author_id');
    }
}
