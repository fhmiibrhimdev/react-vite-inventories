<?php

namespace App\Http\Controllers\Api;

use Exception;
use App\Models\Item;
use App\Models\Inventory;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Http\Controllers\Controller;

class StockOpnameController extends Controller
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

            $items = Item::select('id as value', 'item_name as label')
                        ->get();

            $data = Inventory::select('inventories.*', 'items.item_name')
                    ->join('items', 'items.id', 'inventories.item_id')
                    ->where(function ($query) use ($searchTerm)  {
                        $query->where('items.item_name', 'LIKE', $searchTerm);
                        $query->orWhere('inventories.date', 'LIKE', $searchTerm);
                        $query->orWhere('inventories.qty', 'LIKE', $searchTerm);
                        $query->orWhere('inventories.book', 'LIKE', $searchTerm);
                        $query->orWhere('inventories.physical', 'LIKE', $searchTerm);
                        $query->orWhere('inventories.difference', 'LIKE', $searchTerm);
                    })
                    ->where('inventories.opname', 'yes')
                    ->orderBy('inventories.id', 'DESC')
                    // ->get();
                    ->paginate($perPage);

            return response()->json([
                'data'      => $data,
                'items'     => $items,
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

    public function checkValueBook($id)
    {
        $valueBook = Item::select('stock')->where('id', $id)->first()->stock;

        return response()->json([
            'value_book'=> $valueBook,
            'success'   => true,
        ], JsonResponse::HTTP_OK);
    }

    public function store(Request $request)
    {
        $validatedData = $request->validate([
            'date'      => 'required',
            'item_id'   => 'required',
            'qty'       => 'required',
            'physical'  => 'required',
        ]);

        try {
            $physical   = $request->physical;
            $book       = $request->book;

            $difference = $request->difference;

            if ($difference > 0) {
                $status = 'In';
            } else {
                $status = 'Out';
            }

            Inventory::create([
                'date'          => date('Y-m-d H:i', strtotime($request->date)),
                'item_id'       => $request->item_id,
                'qty'           => abs($difference),
                'description'   => $request->description,
                'book'          => $request->book,
                'physical'      => $request->physical,
                'difference'    => $difference,
                'opname'        => 'yes',
                'status'        => $status,
            ]);

            Item::where('id', $request->item_id)
                    ->update(array(
                        'stock' => $physical
                    ));

            return response()->json([
                    'success'   => true,
                    'message'   => 'Data created successfully'
                ], JsonResponse::HTTP_CREATED);
        } catch (Exception $e) {
            return response()->json([
                'data'      => [],
                'success'   => false,
                'message'   => $e->getMessage()
            ], JsonResponse::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    public function destroy($id)
    {
        try {
            $data  = Inventory::select('item_id', 'difference')
                            ->where('id', $id)
                            ->first();

            $item_id    = $data->item_id;
            $difference = $data->difference;
            $stock_items= Item::select('stock')->where('id', $item_id)
                                ->first()
                                ->stock;
            $stock_now  = $stock_items - $difference;
            Item::where('id', $item_id)
                ->update([
                    'stock' => $stock_now
                ]);

            Inventory::findOrFail($id)->delete();
            return response()->json([
                'success'   => true,
                'message'   => 'Data deleted successfully'
            ], JsonResponse::HTTP_OK);
        } catch (Exception $e) {
            return response()->json([
                'data'      => [],
                'success'   => false,
                'message'   => $e->getMessage()
            ], JsonResponse::HTTP_INTERNAL_SERVER_ERROR);
        }
    }
}
