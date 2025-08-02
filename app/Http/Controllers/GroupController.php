<?php

namespace App\Http\Controllers;

use App\Models\Group;
use App\Models\GroupUser;
use App\Models\OrderItem;
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
            'users',
            'orders' => function ($qry) {
                $qry->orderBy('created_at', 'desc')
                    ->with(['orderitems.item', 'groupUser.user']);
            },
            'items' => function ($qry) {
                $qry->orderBy('naam', 'asc')
                    ->where('one_off', false);
            }
        ]);

        return Inertia::render('groups/show', [
            'group' => [
                'id' => $group->id,
                'name' => $group->name,
                'currency' => $group->currency,
                'public_id' => $group->public_id,
                'created_at' => $group->created_at,
                'updated_at' => $group->updated_at,
                'users' => $group->users->map(static fn($groupUser) => [
                    'id' => $groupUser->user_id,
                    'name' => $groupUser->user->name,
                    'email' => $groupUser->user->email,
                    'nickname' => $groupUser->nickname,
                    'avatar' => $groupUser->user->avatar ?? null,
                    'joined_at' => $groupUser->created_at,
                ]),
                'orders' => $group->orders->take(3)->map(static fn($order) => [
                    'id' => $order->id,
                    'title' => $order->title,
                    'total_amount' => $order->orderItems->sum(fn(OrderItem $item) => $item->item->price),
                    'status' => $order->status,
                    'created_at' => $order->created_at,
                    'items_count' => $order->orderItems->count(),
                    'created_by' => $order->groupUser ? [
                        'nickname' => $order->groupUser->nickname,
                    ] : null,
                ]),
                'items' => $group->items->map(static fn($item) => [
                    'id' => $item->id,
                    'name' => $item->name,
                    'price' => $item->price,
                    'one_off' => $item->one_off,
                    'created_at' => $item->created_at,
                ]),
            ]
        ]);
    }
}
