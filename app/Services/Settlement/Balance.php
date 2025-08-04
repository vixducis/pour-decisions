<?php

namespace App\Services\Settlement;

use App\Models\GroupUser;
use Cknow\Money\Money;

class Balance
{
    private Money $balance;

    public function __construct(private GroupUser $user, string $currency)
    {
        $this->balance = $user->getBalance($currency);
    }

    /**
     * Returns the current money balance
     */
    public function getBalance(): Money
    {
        return $this->balance;
    }

    /**
     * Returns the associated group user
     */
    public function getUser(): GroupUser
    {
        return $this->user;
    }

    /**
     * Subtract an amount from the balance
     */
    public function subtractAmount(Money $amount): void
    {
        $this->balance = $this->balance->subtract($amount);
    }

    /**
     * Check if the balance is effectively zero (within 1 cent)
     */
    public function isSettled(): bool
    {
        return $this->balance->absolute()->isZero();
    }
}
