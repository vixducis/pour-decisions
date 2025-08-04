<?php

namespace App\Models;

use App\Contracts\HasPriceInterface;
use Cknow\Money\Money;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property int $group_id
 * @property string $name
 * @property string $price
 * @property bool $one_off
 * @property Carbon $created_at
 * @property Carbon $updated_at
 */
class Item extends Model implements HasPriceInterface
{
    protected $table = 'items';

    protected $fillable = [
        'group_id',
        'name',
        'price',
        'one_off',
    ];

    protected function casts()
    {
        return [
            'price' => 'decimal:2',
            'one_off' => 'boolean',
        ];
    }

    /**
     * @return BelongsTo<Group,$this>
     */
    public function group(): BelongsTo
    {
        return $this->belongsTo(Group::class, 'group_id');
    }

    /**
     * @inheritDoc
     */
    public function getPrice(string $currency): Money
    {
        return money($this->price, $currency);
    }
}
