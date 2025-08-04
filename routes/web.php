<?php

use App\Http\Controllers\GroupController;
use App\Http\Controllers\GroupJoinController;
use App\Http\Controllers\ItemController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\SettlementsController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/', [GroupController::class, 'index'])->name('home');
    Route::post('groups', [GroupController::class, 'store'])->name('groups.store');
    Route::get('groups/{group}', [GroupController::class, 'show'])->name('groups.show');
    Route::get('groups/{group}/orders', [OrderController::class, 'index'])->name('groups.orders');
    Route::get('groups/{group}/settlements', [SettlementsController::class, 'index'])->name('groups.settlements');
    Route::post('groups/{group}/items', [ItemController::class, 'store'])->name('groups.items.store');
    Route::delete('groups/{group}/items/{item}', [ItemController::class, 'destroy'])->name('groups.items.destroy');
    Route::get('groups/{group}/orders/create', [OrderController::class, 'create'])->name('orders.create');
    Route::post('orders', [OrderController::class, 'store'])->name('orders.store');
    Route::delete('orders/{order}', [OrderController::class, 'destroy'])->name('orders.destroy');
    Route::get('join/{public_id}', [GroupJoinController::class, 'show'])->name('groups.join');
    Route::post('join/{public_id}', [GroupJoinController::class, 'store'])->name('groups.join');
});

Route::get('test', function () {
    return money(9, 'EUR')->isNegative() ? "neg" : "not neg";
});

require __DIR__ . '/settings.php';
require __DIR__ . '/auth.php';
