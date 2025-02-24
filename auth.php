use App\Http\Controllers\API\V1\RecipeController;
use Illuminate\Support\Facades\Route;

Route::get('v1/recipes', [RecipeController::class, 'index']);
Route::get('v1/recipes/{slug}', [RecipeController::class, 'show']);

// Group route yang memerlukan autentikasi
Route::middleware('auth:sanctum')->group(function () {
    Route::post('v1/recipes', [RecipeController::class, 'store']);
    Route::delete('v1/recipes/{slug}', [RecipeController::class, 'destroy']);
});
