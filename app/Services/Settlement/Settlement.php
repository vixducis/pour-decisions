<?php

namespace App\Services\Settlement;

use App\Models\GroupUser;
use Cknow\Money\Money;

class Settlement
{
    public function __construct(
        private GroupUser $from,
        private GroupUser $to,
        private Money $amount,
    ) {}

    public function getFrom(): GroupUser
    {
        return $this->from;
    }

    public function getTo(): GroupUser
    {
        return $this->to;
    }

    public function getAmount(): Money
    {
        return $this->amount;
    }

    /**
     * @return array{from: array{id: int, nickname: string}, to: array{id: int, nickname: string}, amount: float}
     */
    public function toArray(): array
    {
        return [
            'from' => [
                'id' => $this->from->id,
                'nickname' => $this->from->nickname,
            ],
            'to' => [
                'id' => $this->to->id,
                'nickname' => $this->to->nickname,
            ],
            'amount' => (float) $this->amount->getAmount() / 100,
        ];
    }
}
