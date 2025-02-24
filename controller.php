<?php

namespace App\Http\Controllers\API\V1;

use App\Http\Controllers\Controller;
use App\Models\Recipe;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

class RecipeController extends Controller
{
    /**
     * Menampilkan semua resep yang tersimpan, diurutkan berdasarkan created_at secara descending.
     * Endpoint: GET /api/v1/recipes
     */
    public function index()
    {
        $recipes = Recipe::with('category')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json(['recipes' => $recipes], 200);
    }

    /**
     * Menyimpan resep baru.
     * Endpoint: POST /api/v1/recipes
     * Hanya dapat diakses oleh pengguna yang telah login.
     */
    public function store(Request $request)
    {
        // Validasi input request
        $validator = Validator::make($request->all(), [
            'title'         => 'required|string|max:255',
            'category_id'   => 'required|exists:categories,id',
            'energy'        => 'required|numeric',
            'carbohydrate'  => 'required|numeric',
            'protein'       => 'required|numeric',
            'ingredients'   => 'required|string',
            'method'        => 'required|string',
            'tips'          => 'required|string',
            'thumbnail'     => 'nullable|image|mimes:jpeg,jpg,png|max:2048'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Invalid field',
                'errors'  => $validator->errors()
            ], 422);
        }

        // Persiapkan data untuk disimpan
        $data = $request->only([
            'title', 'category_id', 'energy', 'carbohydrate', 
            'protein', 'ingredients', 'method', 'tips'
        ]);
        $data['slug'] = Str::slug($request->title);

        // Proses upload thumbnail jika ada
        if ($request->hasFile('thumbnail')) {
            $file = $request->file('thumbnail');
            $filename = time() . '_' . $file->getClientOriginalName();
            $path = $file->storeAs('thumbnails', $filename, 'public');
            $data['thumbnail'] = asset('storage/' . $path);
        }

        // Asosiasikan resep dengan pengguna yang sedang login
        $data['author_id'] = Auth::id();

        // Buat data resep
        $recipe = Recipe::create($data);

        return response()->json([
            'message' => 'Recipe created successful',
            'recipe'  => $recipe
        ], 200);
    }

    /**
     * Menampilkan detail resep berdasarkan slug.
     * Endpoint: GET /api/v1/recipes/{slug}
     */
    public function show($slug)
    {
        $recipe = Recipe::with(['category', 'comments', 'ratings'])
            ->where('slug', $slug)
            ->first();

        if (!$recipe) {
            return response()->json(['message' => 'Recipe not found'], 404);
        }

        // Hitung rata-rata rating (opsional)
        $ratingsAvg = $recipe->ratings()->avg('rating');
        $recipe->ratings_avg = round($ratingsAvg, 1);

        return response()->json($recipe, 200);
    }

    /**
     * Menghapus resep berdasarkan slug.
     * Endpoint: DELETE /api/v1/recipes/{slug}
     * Hanya dapat diakses oleh pemilik resep atau pengguna dengan peran Administrator.
     */
    public function destroy($slug)
    {
        $recipe = Recipe::where('slug', $slug)->first();

        if (!$recipe) {
            return response()->json(['message' => 'Recipe not found'], 404);
        }

        $user = Auth::user();
        // Jika pengguna bukan Administrator dan bukan pemilik resep
        if ($user->role !== 'Administrator' && $recipe->author_id !== $user->id) {
            return response()->json(['message' => 'Forbidden access'], 403);
        }

        $recipe->delete();

        return response()->json(['message' => 'Recipe deleted successful'], 200);
    }
}
