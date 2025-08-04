<?php

namespace App\Services\Settlement;

use App\Models\GroupUser;
use Illuminate\Support\Collection;

class Calculation
{
    /**
     * @param Collection<array-key,GroupUser> $groupUsers
     * @return Collection<array-key,Settlement>
     */
    public function getSettlements(Collection $groupUsers, string $currency)
    {
        $settlements = collect();
        
        $balances = $groupUsers
            ->map(fn (GroupUser $user) => new Balance($user, $currency))
            ->sort(fn (Balance $a, Balance $b) => $a->getBalance()->getAmount() <=> $b->getBalance()->getAmount());

        $debtors = $balances->filter(fn (Balance $balance) => $balance->getBalance()->isNegative())->values();
        $creditors = $balances->filter(function (Balance $balance) {
            $amount = $balance->getBalance();
            return $amount->isPositive() && false === $amount->isZero();
        })->values();

        $debtorIndex = 0;
        $creditorIndex = 0;

        while ($debtorIndex < $debtors->count() && $creditorIndex < $creditors->count()) {
            $debtor = $debtors[$debtorIndex];
            $creditor = $creditors[$creditorIndex];
            
            $debtorAmount = $debtor->getBalance()->absolute();
            $creditorAmount = $creditor->getBalance();

            // Determine the settlement amount (minimum of what debtor owes and creditor is owed)
            $settlementAmount = $debtorAmount->lessThan($creditorAmount) ? $debtorAmount : $creditorAmount;

            if (false === $settlementAmount->isZero()) {
                $settlements->push(new Settlement(
                    $debtor->getUser(),
                    $creditor->getUser(),
                    $settlementAmount
                ));

                // Update remaining amounts directly in the Balance objects
                $debtor->subtractAmount($settlementAmount->multiply(-1)); // Add back (reduce debt)
                $creditor->subtractAmount($settlementAmount); // Subtract (reduce credit)
            }

            // Move to next debtor or creditor if current one is settled
            if ($debtor->isSettled()) {
                $debtorIndex++;
            }
            if ($creditor->isSettled()) {
                $creditorIndex++;
            }
        }

        return $settlements;
    }
}