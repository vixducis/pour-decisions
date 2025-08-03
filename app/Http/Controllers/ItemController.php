<?php

namespace App\Http\Controllers;

use App\Models\Group;
use App\Models\Item;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Response;

class ItemController extends Controller
{
    /**
     * Create a new item.
     */
    public function store(Group $group, Request $request): RedirectResponse|JsonResponse
    {
        if ($request->user()->cannot('update', $group)) {
            abort(Response::HTTP_FORBIDDEN);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'price' => 'required|numeric|min:0',
            'one_off' => 'sometimes|boolean',
        ]);

        $item = Item::create([
            'group_id' => $group->id,
            'name' => $validated['name'],
            'price' => $validated['price'],
            'one_off' => $validated['one_off'] ?? false,
        ]);

        // If this is an AJAX request (from order creation), return JSON
        if ($request->expectsJson()) {
            return response()->json([
                'id' => $item->id,
                'name' => $item->name,
                'price' => $item->price,
                'one_off' => $item->one_off,
            ]);
        }

        return redirect()->route('groups.show', $group)->with('success', 'Item added successfully!');
    }

    /**
     * Remove an existing item.
     */
    public function destroy(Group $group, Item $item, Request $request): RedirectResponse
    {
        if ($request->user()->cannot('update', $group)) {
            abort(Response::HTTP_FORBIDDEN);
        }

        if ($item->group_id !== $group->id) {
            abort(Response::HTTP_NOT_FOUND);
        }

        $item->delete();

        return redirect()
            ->route('groups.show', $group)
            ->with('success', 'Item deleted successfully!');
    }
}
