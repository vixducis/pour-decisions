<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Carbon;
use Illuminate\Support\Str;

/**
 * @property int $id
 * @property string $name
 * @property string $currency
 * @property int $user_id
 * @property string $public_id
 * @property Carbon $updated_at
 * @property Carbon $created_at
 */
class Group extends Model
{
    protected $table = 'groups';

    protected $fillable = [
        'name',
    ];

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($group) {
            $group->public_id = Str::random(32);
        });
    }

    /**
     * @return BelongsTo<User,$this>
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    /**
     * @return HasMany<GroupUser,$this>
     */
    public function users(): HasMany
    {
        return $this->hasMany(GroupUser::class, 'group_id');
    }

    /**
     * @return HasMany<Item,$this>
     */
    public function items(): HasMany
    {
        return $this->hasMany(Item::class, 'group_id');
    }

    /**
     * @return HasMany<Order,$this>
     */
    public function orders(): HasMany
    {
        return $this->hasMany(Order::class, 'group_id');
    }
}
