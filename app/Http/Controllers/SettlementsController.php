<?php

namespace App\Http\Controllers;

use App\Models\Group;
use App\Services\Settlement\Calculation;
use Illuminate\Http\Request;
use Illuminate\Http\Response as HttpResponse;
use Inertia\Inertia;
use Inertia\Response;

class SettlementsController extends Controller
{
    public function index(Group $group, Request $request): Response
    {
        $group->load([
            'users' => fn($qry) => $qry->with([
                'user',
                'orderItems.item',
                'orders.orderItems.item',
            ]),
            'orders.orderItems.item',
            'orders.orderItems.groupUser.user',
        ]);

        if ($request->user()->cannot('view', $group)) {
            abort(HttpResponse::HTTP_FORBIDDEN);
        }

        // Calculate balances using convenience methods
        $userBalances = [];
        foreach ($group->users as $groupUser) {
            $balance = $groupUser->getBalance($group->currency);
            $userBalances[] = [
                'id' => $groupUser->id,
                'nickname' => $groupUser->nickname,
                'email' => $groupUser->user->email,
                'paid' => $groupUser->getPaidAmount($group->currency)->format(),
                'consumed' => $groupUser->getConsumedAmount($group->currency)->format(),
                'balance' => $groupUser->getBalance($group->currency)->absolute()->format(),
                'balance_status' => $balance->isZero() ? 'zero' : ($balance->isPositive() ? 'positive' : 'negative'),
            ];
        }

        $calculator = new Calculation;
        $settlements = $calculator->getSettlements($group->users, $group->currency)
            ->map(fn($settlement) => $settlement->toArray())
            ->values()
            ->all();

        return Inertia::render('groups/settlements', [
            'group' => [
                'id' => $group->id,
                'name' => $group->name,
                'currency' => $group->currency,
            ],
            'userBalances' => $userBalances,
            'settlements' => $settlements,
        ]);
    }
}
