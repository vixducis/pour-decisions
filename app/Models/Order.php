<?php

namespace App\Models;

use App\Contracts\HasPriceInterface;
use Cknow\Money\Money;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property int $group_id
 * @property int $group_user_id
 * @property Carbon $created_at
 * @property Carbon $updated_at
 */
class Order extends Model implements HasPriceInterface
{
    protected $table = 'orders';

    /**
     * @return BelongsTo<Group,$this>
     */
    public function group(): BelongsTo
    {
        return $this->belongsTo(Group::class, 'group_id');
    }

    /**
     * The owner of the order.
     * 
     * @return BelongsTo<GroupUser,$this>
     */
    public function groupUser(): BelongsTo
    {
        return $this->belongsTo(GroupUser::class, 'group_user_id');
    }

    /**
     * @return HasMany<OrderItem,$this>
     */
    public function orderItems(): HasMany
    {
        return $this->hasMany(OrderItem::class, 'order_id');
    }

    /**
     * @inheritDoc
     */
    public function getPrice(string $currency): Money
    {
        return $this->orderItems->isEmpty()
            ? money(0, $currency)
            : Money::sum(...$this->orderItems->map->getPrice($currency)->all());
    }
}
