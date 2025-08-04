<?php

namespace App\Contracts;

use Cknow\Money\Money;

interface HasPriceInterface
{
    /**
     * Returns the price as a money object.
     */
    public function getPrice(string $currency): Money;
}
