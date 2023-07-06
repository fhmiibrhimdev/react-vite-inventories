<?php

namespace App\Http\Controllers\Api;

use Exception;
use App\Models\Inventory;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Http\Controllers\Controller;

class OpeningBalanceItems extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        try {
            $perPage    = $request->get('showing', 15);
            $search     = $request->get('search', '');
            $searchTerm = '%'.$search.'%';

            $data = Inventory::select('inventories.*', 'items.item_name', )
                    ->join('items', 'items.id', 'inventories.item_id', )
                    ->where(function ($query) use ($searchTerm)  {
                        $query->where('items.item_name', 'LIKE', $searchTerm);
                        $query->where('inventories.date', 'LIKE', $searchTerm);
                        $query->where('inventories.qty', 'LIKE', $searchTerm);
                        $query->where('inventories.description', 'LIKE', $searchTerm);
                    })
                    ->where('inventories.status', 'Balance')
                    ->orderBy('inventories.id', 'DESC')
                    ->paginate($perPage);

            return response()->json([
                'data'      => $data,
                'success'   => true,
            ], JsonResponse::HTTP_OK);
        } catch (Exception $e) {
            return response()->json([
                'data'      => [],
                'success'   => false,
                'message'   => $e->getMessage()
            ], JsonResponse::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        

        try {
            
        } catch (Exception $e) {
            
        }
    }
}
