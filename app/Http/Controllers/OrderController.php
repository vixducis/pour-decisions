<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreOrderRequest;
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
    /**
     * Shows an overview of all orders in a group.
     */
    public function index(Group $group): Response
    {
        if (auth('web')->user()->cannot('view', $group)) {
            abort(HttpResponse::HTTP_FORBIDDEN);
        }

        $group->load([
            'orders' => function ($qry) {
                $qry->orderBy('created_at', 'desc')
                    ->with(['orderItems.item', 'groupUser']);
            },
        ]);

        return Inertia::render('groups/orders', [
            'group' => [
                'id' => $group->id,
                'name' => $group->name,
            ],
            'orders' => $group->orders->map(static fn($order) => [
                'id' => $order->id,
                'total_amount' => $order->getPrice($group->currency)->format(),
                'created_at' => $order->created_at,
                'items_count' => $order->orderItems->count(),
                'created_by' => $order->groupUser ? [
                    'nickname' => $order->groupUser->nickname,
                ] : null,
                'items' => $order->orderItems->map(fn($orderItem) => [
                    'id' => $orderItem->id,
                    'name' => $orderItem->item->name,
                    'price' => $orderItem->getPrice($group->currency)->format(),
                    'user_nickname' => $orderItem->groupUser ? $orderItem->groupUser->nickname : null,
                ])->all(),
            ])->all(),
        ]);
    }

    /**
     * Shows the form to create a new order.
     */
    public function create(Group $group, Request $request): Response
    {
        if ($request->user()->cannot('update', $group)) {
            abort(HttpResponse::HTTP_FORBIDDEN);
        }

        $group->load([
            'users.user',
            'items' => function ($qry) {
                $qry->orderBy('name')
                    ->where('one_off', false);
            },
        ]);

        $data = [
            'group' => [
                'id' => $group->id,
                'name' => $group->name,
                'currency' => $group->currency,
                'users' => $group->users->map(function ($groupUser) {
                    return [
                        'id' => $groupUser->id,
                        'email' => $groupUser->user->email,
                        'nickname' => $groupUser->nickname,
                        'avatar' => null,
                    ];
                })->all(),
                'items' => $group->items->map(static function ($item) {
                    return [
                        'id' => $item->id,
                        'name' => $item->name,
                        'price' => $item->price,
                        'one_off' => $item->one_off,
                    ];
                })->all(),
            ],
        ];

        $duplicateId = $request->input('duplicate');
        if (is_string($duplicateId)) {
            $duplicateOrder = Order::query()
                ->where('group_id', $group->id)
                ->with(['orderItems.item', 'orderItems.groupUser.user'])
                ->find($duplicateId);

            if ($duplicateOrder !== null) {
                $data['duplicateOrder'] = [
                    'id' => $duplicateOrder->id,
                    'items' => $duplicateOrder
                        ->orderItems
                        ->map(fn($orderItem) => [
                            'itemId' => $orderItem->item->id,
                            'userId' => $orderItem->group_user_id,
                            'itemName' => $orderItem->item->name,
                            'itemPrice' => $orderItem->item->price,
                        ])
                        ->all()
                ];
            }
        }

        return Inertia::render('orders/create', $data);
    }

    /**
     * Handles the form callback of creating a new order.
     */
    public function store(StoreOrderRequest $request): RedirectResponse
    {
        $group = Group::query()
            ->with(['users', 'items'])
            ->findOrFail($request->getGroupId());

        $currentGroupUser = $group->users->first(
            fn(GroupUser $user) => $user->user_id === auth('web')->user()->id
        );

        if ($currentGroupUser === null) {
            abort(HttpResponse::HTTP_FORBIDDEN);
        }

        // Verify all items belong to this group
        $itemIds = collect($request->getItemIds())->unique();
        if (!$itemIds->every(fn($id) => $group->items->contains(fn(Item $item) => $item->id === $id))) {
            abort(HttpResponse::HTTP_UNPROCESSABLE_ENTITY, 'One or more items do not belong to this group');
        }

        // Verify all users are members of this group
        $userIds = collect($request->getUserIds())->unique();
        if (!$userIds->every(fn($id) => $group->users->contains(fn(GroupUser $user) => $user->id === $id))) {
            abort(HttpResponse::HTTP_UNPROCESSABLE_ENTITY, 'One or more users are not members of this group');
        }

        DB::transaction(function () use ($request, $group, $currentGroupUser) {
            // Create the order
            $order = new Order;
            $order->group()->associate($group);
            $order->groupUser()->associate($currentGroupUser);
            $order->save();

            // Create order items
            foreach ($request->getItems() as $orderItem) {
                OrderItem::create([
                    'order_id' => $order->id,
                    'item_id' => $orderItem['item_id'],
                    'group_user_id' => $orderItem['user_id'],
                ]);
            }
        });

        return redirect()->route('groups.show', $group)->with('success', 'Order created successfully!');
    }

    /**
     * Delete an order.
     */
    public function destroy(Order $order): RedirectResponse
    {
        $group = $order->group;
        if (auth('web')->user()->cannot('update', $group)) {
            abort(HttpResponse::HTTP_FORBIDDEN);
        }

        $order->delete();
        return redirect()->route('groups.orders', $group)->with('success', 'Order deleted successfully!');
    }
}
