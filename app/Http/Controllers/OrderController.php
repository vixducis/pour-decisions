<?php

namespace App\Http\Controllers;

use App\Models\Group;
use App\Models\GroupUser;
use App\Models\Item;
use App\Models\Order;
use App\Models\OrderItem;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Response as HttpResponse;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class OrderController extends Controller
{
    public function create(Group $group, Request $request): Response
    {
        if ($request->user()->cannot('update', $group)) {
            abort(HttpResponse::HTTP_FORBIDDEN);
        }

        $group->load([
            'users.user',
            'items' => fn ($qry) => $qry->orderBy('name'),
        ]);

        return Inertia::render('orders/create', [
            'group' => [
                'id' => $group->id,
                'name' => $group->name,
                'currency' => $group->currency,
                'users' => $group->users->map(function ($groupUser) {
                    return [
                        'id' => $groupUser->id,
                        'email' => $groupUser->user->email,
                        'nickname' => $groupUser->nickname,
                        'avatar' => $groupUser->user->avatar ?? null,
                    ];
                }),
                'items' => $group->items->map(function ($item) {
                    return [
                        'id' => $item->id,
                        'name' => $item->name,
                        'price' => $item->price,
                        'one_off' => $item->one_off,
                    ];
                }),
            ]
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'group_id' => 'required|exists:groups,id',
            'items' => 'required|array|min:1',
            'items.*.item_id' => 'required|exists:items,id',
            'items.*.user_id' => 'required|exists:users,id',
        ]);

        $group = Group::query()
            ->with(['users', 'items'])
            ->findOrFail($validated['group_id']);

        $currentGroupUser = $group->users->first(
            fn (GroupUser $user) => $user->user_id === $request->user()->id
        );
        
        if ($currentGroupUser === null) {
            abort(HttpResponse::HTTP_FORBIDDEN);
        }

        // Verify all items belong to this group
        $itemIds = collect($validated['items'])->pluck('item_id')->unique();        
        if (!$itemIds->every(fn($id) => $group->items->contains(fn (Item $item) => $item->id === $id))) {
            abort(HttpResponse::HTTP_UNPROCESSABLE_ENTITY, 'One or more items do not belong to this group');
        }

        // Verify all users are members of this group
        $userIds = collect($validated['items'])->pluck('user_id')->unique();        
        if (!$userIds->every(fn($id) => $group->users->contains(fn (GroupUser $user) => $user->id === $id))) {
            abort(HttpResponse::HTTP_UNPROCESSABLE_ENTITY, 'One or more users are not members of this group');
        }

        DB::transaction(function () use ($validated, $group, $currentGroupUser) {
            // Create the order
            $order = new Order;
            $order->group()->associate($group);
            $order->groupUser()->associate($currentGroupUser);
            $order->save();

            // Create order items
            foreach ($validated['items'] as $orderItem) {
                OrderItem::create([
                    'order_id' => $order->id,
                    'item_id' => $orderItem['item_id'],
                    'group_user_id' => $orderItem['user_id'],
                ]);
            }
        });

        return redirect()->route('groups.show', $group)->with('success', 'Order created successfully!');
    }
}