<?php

namespace App\Http\Controllers\Api;

use Exception;
use App\Models\Item;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Http\Controllers\Controller;
use App\Models\Inventory;

class StockOutController extends Controller
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

            $items = Item::select('id', 'item_name')
                        ->get();

            $data = Inventory::select('inventories.*', 'items.item_name')
                    ->join('items', 'items.id', 'inventories.item_id')
                    ->where(function ($query) use ($searchTerm)  {
                        $query->where('items.item_name', 'LIKE', $searchTerm);
                        $query->orWhere('inventories.date', 'LIKE', $searchTerm);
                        $query->orWhere('inventories.qty', 'LIKE', $searchTerm);
                        $query->orWhere('inventories.description', 'LIKE', $searchTerm);
                    })
                    ->where('inventories.status', 'Out')
                    ->where('inventories.opname', 'no')
                    ->orderBy('inventories.id', 'DESC')
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

    private function logicStock($total_stock_now, $new_qty, $last_qty, $item_id, $date, $id, $description)
    {
        $total          = $last_qty - $new_qty;
        $total_stock    = $total_stock_now + $total;
        if ( $total_stock < 0 ) {
            $this->alertStockMinus();
        } else {
            Item::where('id', $item_id)
                ->update(array(
                    'stock' => $total_stock
                ));

            $data = Inventory::findOrFail($id);
            $data->update([
                'date'          => $date,
                'item_id'       => $item_id,
                'qty'           => $new_qty,
                'description'   => $description,
            ]);

            return response()->json([
                'success'   => true,
                'message'   => 'Data updated successfully'
            ], JsonResponse::HTTP_OK);
        }
    }

    private function alertStockMinus()
    {
        abort(JsonResponse::HTTP_INTERNAL_SERVER_ERROR, 'Stock cannot be less than zero');
    }

    public function store(Request $request)
    {
        $validatedData = $request->validate([
            'date'      => 'required',
            'item_id'   => 'required',
            'qty'       => 'required',
        ]);

        try {
            $last_stock_items = Item::where('id', $request->item_id)->first()->stock;
            $reduce_stock = $last_stock_items - $request->qty;

            if ($reduce_stock < 0) {
                $this->alertStockMinus();
            } else {
                Inventory::create([
                    'date'          => $request->date,
                    'item_id'       => $request->item_id,
                    'qty'           => $request->qty,
                    'description'   => $request->description,
                    'status'        => 'Out',
                ]);

                Item::where('id', $request->item_id)
                    ->update(array(
                        'stock' => $reduce_stock
                    ));

                return response()->json([
                    'success'   => true,
                    'message'   => 'Data created successfully'
                ], JsonResponse::HTTP_CREATED);
            }
        } catch (Exception $e) {
            return response()->json([
                'data'      => [],
                'success'   => false,
                'message'   => $e->getMessage()
            ], JsonResponse::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit($id)
    {
        try 
        {
            $data   = Inventory::findOrFail($id);

            return response()->json([
                'data'      => $data,
                'success'   => true,
            ], JsonResponse::HTTP_OK);
        } 
        catch (Exception $e) 
        {
            return response()->json([
                'data'      => [],
                'success'   => false,
                'message'   => $e->getMessage()
            ], JsonResponse::HTTP_INTERNAL_SERVER_ERROR);    
        }
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, $id)
    {
        $validatedData = $request->validate([
            'date'      => 'required',
            'item_id'   => 'required',
            'qty'       => 'required',
        ]);

        try {
            $item_id    = Inventory::where('id', $id)->first()->item_id;
            $total_stock_now = Item::where('id', $item_id)->first()->stock; // 
            $last_qty   = Inventory::where('id', $id)->first()->qty;
            $new_qty    = $request->qty;

            switch (true) {
                case ((int)$new_qty > (int)$last_qty):
                case ((int)$last_qty > (int)$new_qty):
                    $this->logicStock($total_stock_now, $new_qty, $last_qty, $item_id, $request->date, $id, $request->description);
                    break;
                default:
                    break;
            }
        } catch (Exception $e) {
            return response()->json([
                'data'      => [],
                'success'   => false,
                'message'   => $e->getMessage()
            ], JsonResponse::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($id)
    {
        try {
            $last_qty   = Inventory::where('id', $id)->first()->qty;
            $item_id    = Inventory::where('id', $id)->first()->item_id;
            $last_stock = Item::where('id', $item_id)->first()->stock;

            $total_stock = $last_stock + $last_qty;

            Item::where('id', $item_id)
                ->update(array(
                    'stock' => $total_stock
                ));

            $data = Inventory::findOrFail($id);
            $data->delete();

            return response()->json([
                'data'      => $data,
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
