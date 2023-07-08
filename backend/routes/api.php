<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\ItemController;
use App\Http\Controllers\Api\RackController;
use App\Http\Controllers\PersonalController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\OpeningBalanceItemsController;
use App\Http\Controllers\Api\StockCardController;
use App\Http\Controllers\Api\StockInController;
use App\Http\Controllers\Api\StockOpnameController;
use App\Http\Controllers\Api\StockOutController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| is assigned the "api" middleware group. Enjoy building your API!
|
*/


Route::post('/register', App\Http\Controllers\Api\RegisterController::class)->name('register');
Route::post('/login', App\Http\Controllers\Api\LoginController::class)->name('login');
Route::middleware('auth:api')->get('/user', function (Request $request) {
    $user = $request->user(); $role = $user->hasRole('admin') ? 'admin' : 'user';
    $user->setAttribute('role', $role);
    return $user;
});

Route::group(['middleware' => ['auth:api']], function () {
    Route::get('/user', function (Request $request) {
        $user = $request->user(); $role = $user->hasRole('admin') ? 'admin' : 'user';
        $user->setAttribute('role', $role);
        return $user;
    });
    Route::get('/profile', [PersonalController::class, 'index']);
    Route::put('/profile', [PersonalController::class, 'updateProfile']);
    Route::put('/update-password', [PersonalController::class, 'updatePassword']);
});

Route::group(['middleware' => ['auth:api', 'role:admin']], function () {
    Route::resource('/category', CategoryController::class);
    Route::resource('/rack', RackController::class);
    Route::resource('/item', ItemController::class);
    Route::resource('/opening-balance-items', OpeningBalanceItemsController::class);
    Route::resource('/stock-in', StockInController::class);
    Route::resource('/stock-out', StockOutController::class);
    Route::resource('/stock-opname', StockOpnameController::class);
    Route::get('/stock-opname/{stock_opname}/book', [StockOpnameController::class, 'checkValueBook']);
    Route::resource('/stock-card', StockCardController::class);
});

Route::post('/logout', App\Http\Controllers\Api\LogoutController::class)->name('logout');