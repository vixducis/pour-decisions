<?php

namespace App\Models;

use Cknow\Money\Money;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property int $group_id
 * @property int $user_id
 * @property string $nickname
 * @property Carbon $created_at
 * @property Carbon $updated_at
 */
class GroupUser extends Model
{
    protected $table = 'group_users';

    protected $fillable = [
        'group_id',
        'user_id',
        'nickname',
    ];

    protected ?Money $paid = null;
    protected ?Money $consumed = null;
    protected ?Money $balance = null;

    /**
     * @return BelongsTo<Group,$this>
     */
    public function group(): BelongsTo
    {
        return $this->belongsTo(Group::class, 'group_id');
    }

    /**
     * @return BelongsTo<User,$this>
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    /**
     * The order items the user has consumed.
     * 
     * @return HasMany<OrderItem,$this>
     */
    public function orderItems(): HasMany
    {
        return $this->hasMany(OrderItem::class, 'group_user_id');
    }

    /**
     * The orders the user has paid for.
     * 
     * @return HasMany<Order,$this>
     */
    public function orders(): HasMany
    {
        return $this->hasMany(Order::class, 'group_user_id');
    }

    /**
     * Returns the total amount the user has spent in the group.
     */
    public function getPaidAmount(string $currency): Money
    {
        if ($this->paid === null) {
            $this->paid = $this->orders->isEmpty()
                ? money(0, $currency)
                : Money::sum(...$this->orders->map->getPrice($currency)->all());
        }

        return $this->paid;
    }

    /**
     * Returns the total amount the user has comsumed in the group.
     */
    public function getConsumedAmount(string $currency): Money
    {
        if ($this->consumed === null) {
            $this->consumed = $this->orderItems->isEmpty()
                ? money(0, $currency)
                : Money::sum(...$this->orderItems->map->getPrice($currency)->all());
        }

        return $this->consumed;
    }

    /**
     * Returns the balance of the user (paid - consumed).
     */
    public function getBalance(string $currency): Money
    {
        if ($this->balance === null) {
            $this->balance = $this->getPaidAmount($currency)
                ->subtract($this->getConsumedAmount($currency));
        }

        return $this->balance;
    }
}
