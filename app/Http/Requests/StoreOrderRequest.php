<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreOrderRequest extends FormRequest
{
    /**
     * @return array<string,mixed>
     */
    public function rules()
    {
        return [
            'group_id' => 'required|exists:groups,id',
            'items' => 'required|array|min:1',
            'items.*.item_id' => 'required|integer',
            'items.*.user_id' => 'required|integer',
        ];
    }

    /**
     * Returns the group ID included in the request.
     */
    public function getGroupId(): int
    {
        return $this->validated('group_id');
    }

    /**
     * @return array{item_id:int,user_id:int}[]
     */
    public function getItems()
    {
        return $this->validated('items');
    }

    /**
     * Returns all the IDs of the items in the request.
     * 
     * @return int[]
     */
    public function getItemIds()
    {
        return array_map(fn ($item) => $item['item_id'], $this->getItems());
    }

    /**
     * Returns all the IDs of the users in the request.
     * 
     * @return int[]
     */
    public function getUserIds()
    {
        return array_map(fn ($item) => $item['user_id'], $this->getItems());
    }
}