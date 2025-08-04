<?php

namespace App\Http\Controllers;

use App\Models\Group;
use App\Models\GroupUser;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Illuminate\Routing\Controller;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class GroupController extends Controller
{
    use AuthorizesRequests;

    public function __construct()
    {
        $this->authorizeResource(Group::class, 'group');
    }

    public function index(): Response
    {
        $groups = Group::query()
            ->whereHas('users', function ($qry) {
                $qry->where('user_id', auth('web')->user()->id);
            })
            ->withCount('users')
            ->orderBy('created_at', 'desc')
            ->get();

        return Inertia::render('groups/groups', [
            'groups' => $groups
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'nickname' => 'required|string|max:255',
        ]);

        DB::transaction(function () use ($validated) {
            $group = new Group(['name' => $validated['name']]);
            $group->user()->associate(auth('web')->user());
            $group->save();

            GroupUser::create([
                'group_id' => $group->id,
                'user_id' => auth('web')->user()->id,
                'nickname' => $validated['nickname'],
            ]);
        });

        return redirect()->route('home');
    }

    public function show(Group $group): Response
    {
        $group->load([
            'users.user',
            'orders' => function ($qry) {
                $qry->orderBy('created_at', 'desc')
                    ->with(['orderitems.item', 'groupUser.user']);
            },
            'orders.orderItems.item',
            'orders.orderItems.groupUser.user',
            'items' => function ($qry) {
                $qry->orderBy('naam', 'asc')
                    ->where('one_off', false);
            }
        ]);

        $data = [
            'group' => [
                'id' => $group->id,
                'name' => $group->name,
                'public_id' => $group->public_id,
                'currency' => $group->currency,
                'users' => $group->users->map(static fn($groupUser) => [
                    'id' => $groupUser->user_id,
                    'email' => $groupUser->user->email,
                    'nickname' => $groupUser->nickname,
                    'avatar' => $groupUser->user->avatar ?? null,
                ]),
                'orders' => $group->orders->take(3)->map(static fn($order) => [
                    'id' => $order->id,
                    'total_amount' => $order->getPrice($group->currency)->format(),
                    'created_at' => $order->created_at,
                    'items_count' => $order->orderItems->count(),
                    'created_by' => $order->groupUser ? [
                        'nickname' => $order->groupUser->nickname,
                    ] : null,
                ]),
                'items' => $group->items->map(static fn($item) => [
                    'id' => $item->id,
                    'name' => $item->name,
                    'price' => $item->getPrice($group->currency)->format(),
                    'one_off' => $item->one_off,
                    'created_at' => $item->created_at,
                ]),
            ],
        ];


        // Calculate current user's balance
        $currentUser = auth('web')->user();
        $currentGroupUser = $group->users->first(fn($groupUser) => $groupUser->user_id === $currentUser->id);
        if ($currentGroupUser) {
            $paidMoney = $currentGroupUser->getPaidAmount($group->currency);
            $consumedMoney = $currentGroupUser->getConsumedAmount($group->currency);
            $balanceMoney = $paidMoney->subtract($consumedMoney);
            $balanceStatus = $balanceMoney->isZero() ? 'zero' : ($balanceMoney->isPositive() ? 'positive' : 'negative');

            $data['currentUserBalance'] = [
                'paid' => $paidMoney->format(),
                'consumed' => $consumedMoney->format(),
                'balance' => $balanceMoney->format(),
                'balance_status' => $balanceStatus,
            ];
        }

        return Inertia::render('groups/show', $data);
    }
}
