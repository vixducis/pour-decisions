<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('groups', function (Blueprint $tbl) {
            $tbl->id();
            $tbl->string('name');
            $tbl->string('currency')->default('EUR');
            $tbl->foreignId('user_id')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete()
                ->cascadeOnUpdate();
            $tbl->string('public_id');
            $tbl->timestamps();
        });

        Schema::create('group_users', function (Blueprint $tbl) {
            $tbl->id();
            $tbl->foreignId('group_id')
                ->constrained('groups')
                ->cascadeOnDelete()
                ->cascadeOnUpdate();
            $tbl->foreignId('user_id')
                ->constrained('users')
                ->cascadeOnDelete()
                ->cascadeOnUpdate();
            $tbl->string('nickname');
            $tbl->timestamps();
        });

        Schema::create('items', function (Blueprint $tbl) {
            $tbl->id();
            $tbl->foreignId('group_id')
                ->constrained('groups')
                ->cascadeOnDelete()
                ->cascadeOnUpdate();
            $tbl->string('name');
            $tbl->decimal('price');
            $tbl->boolean('one_off')->default(0);
            $tbl->timestamps();
        });

        Schema::create('orders', function (Blueprint $tbl) {
            $tbl->id();
            $tbl->foreignId('group_id')
                ->constrained('groups')
                ->cascadeOnDelete()
                ->cascadeOnUpdate();
            $tbl->foreignId('group_user_id')
                ->constrained('group_users')
                ->restrictOnDelete()
                ->cascadeOnDelete();
            $tbl->timestamps();
        });

        Schema::create('order_items', function (Blueprint $tbl) {
            $tbl->id();
            $tbl->foreignId('order_id')
                ->constrained('orders')
                ->cascadeOnDelete()
                ->cascadeOnUpdate();
            $tbl->foreignId('item_id')
                ->constrained('items')
                ->restrictOnDelete()
                ->cascadeOnUpdate();
            $tbl->foreignId('group_user_id')
                ->constrained('group_users')
                ->cascadeOnDelete()
                ->cascadeOnUpdate();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::drop('order_items');
        Schema::drop('orders');
        Schema::drop('items');
        Schema::drop('group_users');
        Schema::drop('groups');
    }
};
