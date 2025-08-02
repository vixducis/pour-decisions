<?php

use App\Http\Controllers\GroupController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/', [GroupController::class, 'index'])->name('home');
    Route::post('groups', [GroupController::class, 'store'])->name('groups.store');
    Route::get('groups/{group}', [GroupController::class, 'show'])->name('groups.show');
    Route::get('join/{public_id}', [GroupController::class, 'showJoin'])->name('groups.join');
    Route::post('join/{public_id}', [GroupController::class, 'join'])->name('groups.join');
});

require __DIR__ . '/settings.php';
require __DIR__ . '/auth.php';
