<?php

namespace App\Http\Controllers;

use App\Models\Group;
use App\Models\GroupUser;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Response as HttpResponse;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class GroupController extends Controller
{
    public function index(): Response
    {
        $groups = Group::query()
            ->whereHas('users', function ($qry) {
                $qry->where('user_id', auth()->user()->id);
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
                'user_id' => auth()->user()->id,
                'nickname' => $validated['nickname'],
            ]);
        });

        return redirect()->route('groups');
    }

    public function show(Group $group): Response
    {
        // Ensure user is a member of this group
        $group->load(['users', 'orders' => function ($query) {
            $query->orderBy('created_at', 'desc');
        }]);

        if (!$group->users->contains('user_id', auth()->user()->id)) {
            abort(403);
        }

        // Calculate total expenses
        $totalExpenses = $group->orders->sum('total_amount');

        return Inertia::render('groups/show', [
            'group' => [
                'id' => $group->id,
                'name' => $group->name,
                'currency' => $group->currency,
                'public_id' => $group->public_id,
                'created_at' => $group->created_at,
                'updated_at' => $group->updated_at,
                'users' => $group->users->map(function ($groupUser) {
                    return [
                        'id' => $groupUser->user_id,
                        'name' => $groupUser->user->name,
                        'email' => $groupUser->user->email,
                        'nickname' => $groupUser->nickname,
                        'avatar' => $groupUser->user->avatar ?? null,
                        'joined_at' => $groupUser->created_at,
                    ];
                }),
                'orders' => $group->orders->map(function ($order) {
                    return [
                        'id' => $order->id,
                        'title' => $order->title,
                        'total_amount' => $order->total_amount,
                        'status' => $order->status,
                        'created_at' => $order->created_at,
                        'items_count' => $order->items->count(),
                    ];
                }),
                'total_expenses' => $totalExpenses,
            ]
        ]);
    }

    public function showJoin(string $publicId): Response|RedirectResponse
    {
        $group = Group::query()
            ->where('public_id', $publicId)
            ->with('users')
            ->firstOrFail();
        
        // Check if user is already a member
        if ($group->users->contains('user_id', auth()->id())) {
            return redirect()->route('groups.show', $group);
        }

        return Inertia::render('groups/join', [
            'group' => [
                'id' => $group->id,
                'name' => $group->name,
                'public_id' => $group->public_id,
                'users_count' => $group->users->count(),
            ]
        ]);
    }

    public function join(string $publicId, Request $request): RedirectResponse
    {
        $group = Group::where('public_id', $publicId)->firstOrFail();
        
        // Check if user is already a member
        if ($group->users->contains('user_id', auth()->id())) {
            return redirect()->route('groups.show', $group);
        }

        $validated = $request->validate([
            'nickname' => 'required|string|max:255',
        ]);

        GroupUser::create([
            'group_id' => $group->id,
            'user_id' => auth()->id(),
            'nickname' => $validated['nickname'],
        ]);

        return redirect()->route('groups.show', $group)->with('success', 'Successfully joined the group!');
    }
}
