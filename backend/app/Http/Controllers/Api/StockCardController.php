<?php

namespace App\Http\Controllers\Api;

use Exception;
use App\Models\Item;
use App\Models\Inventory;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use App\Http\Controllers\Controller;

class StockCardController extends Controller
{
    public function index(Request $request)
    {
        try {
            $perPage    = $request->get('showing', 15);
            $search     = $request->get('search', '');
            $searchTerm = '%'.$search.'%';

            $items = Item::select('id as value', 'item_name as label')
                        ->get();

            $data = Inventory::select('date', 'item_name', 'inventories.description', 'status', 'qty', DB::raw("SUM(CASE WHEN status = 'Out' THEN -qty ELSE qty END) OVER(ORDER BY date ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) AS balancing"))
                    ->join('items', 'items.id', 'inventories.item_id', )
                    ->where(function ($query) use ($searchTerm)  {
                        $query->where('date', 'LIKE', $searchTerm);
                        $query->orWhere('inventories.description', 'LIKE', $searchTerm);
                        $query->orWhere('status', 'LIKE', $searchTerm);
                        $query->orWhere('qty', 'LIKE', $searchTerm);
                    })
                    ->where('item_id', $request->item_id)
                    ->whereBetween('date', [$request->start_date, $request->end_date])
                    ->orderBy('date', 'ASC')
                    ->paginate($perPage);

            return response()->json([
                'data'      => $data,
                'items'     => $items,
                'success'   => true,
            ], JsonResponse::HTTP_OK);

        } catch (Exception $e) {
            return response()->json([
              'data'    => [],
              'status'  => false,
              'message' => $e->getMessage()
            ]);
        }
    }
}
