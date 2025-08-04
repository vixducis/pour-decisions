<?php

namespace App\Models;

use App\Contracts\HasPriceInterface;
use Cknow\Money\Money;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property int $id
 * @property int $order_id
 * @property int $item_id
 * @property int $group_user_id
 */
class OrderItem extends Model implements HasPriceInterface
{
    protected $table = 'order_items';
    public $timestamps = false;

    protected $fillable = [
        'order_id',
        'item_id',
        'group_user_id',
    ];

    /**
     * @return BelongsTo<Order,$this>
     */
    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class, 'order_id');
    }

    /**
     * @return BelongsTo<Item,$this>
     */
    public function item(): BelongsTo
    {
        return $this->belongsTo(Item::class, 'item_id');
    }

    /**
     * @return BelongsTo<GroupUser,$this>
     */
    public function groupUser(): BelongsTo
    {
        return $this->belongsTo(GroupUser::class, 'group_user_id');
    }

    /**
     * @inheritDoc
     */
    public function getPrice(string $currency): Money
    {
        return $this->item->getPrice($currency);
    }
}