<?php

namespace App\Http\Controllers;

use App\Models\Group;
use App\Models\GroupUser;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class GroupJoinController extends Controller
{
    public function show(string $publicId): Response|RedirectResponse
    {
        $group = Group::query()
            ->where('public_id', $publicId)
            ->with('users')
            ->firstOrFail();

        if ($group->users->contains('user_id', auth('web')->id())) {
            return redirect()->route('groups.show', $group);
        }

        return Inertia::render('groups/join', [
            'group' => [
                'id' => $group->id,
                'name' => $group->name,
                'public_id' => $group->public_id,
            ]
        ]);
    }

    public function store(string $publicId, Request $request): RedirectResponse
    {
        $group = Group::query()
            ->where('public_id', $publicId)
            ->with('users')
            ->firstOrFail();

        if ($group->users->contains('user_id', auth('web')->id())) {
            return redirect()->route('groups.show', $group);
        }

        $validated = $request->validate([
            'nickname' => 'required|string|max:255',
        ]);

        $groupUser = new GroupUser(['nickname' => $validated['nickname']]);
        $groupUser->user()->associate(auth('web')->user());
        $groupUser->group()->associate($group);
        $groupUser->save();

        return redirect()
            ->route('groups.show', $group)
            ->with('success', 'Successfully joined the group!');
    }
}