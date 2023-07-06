<?php

namespace App\Http\Controllers\Api;

use Exception;
use App\Models\Item;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Rack;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;

class ItemController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        try 
        {
            $perPage    = $request->get('showing', 15);
            $search     = $request->get('search', '');
            $searchTerm = '%'.$search.'%';

            $categories = Category::get();
            $racks   = Rack::get();

            $data = Item::select('items.*', 'categories.category_name', 'racks.rack_code', 'racks.rack_name')
                    ->join('categories', 'categories.id', 'items.category_id')
                    ->join('racks', 'racks.id', 'items.rack_id')
                    ->where(function ($query) use ($searchTerm) {
                        $query->where('image', 'LIKE', $searchTerm);
                        $query->orWhere('item_code', 'LIKE', $searchTerm);
                        $query->orWhere('item_name', 'LIKE', $searchTerm);
                        $query->orWhere('category_name', 'LIKE', $searchTerm);
                        $query->orWhere('rack_code', 'LIKE', $searchTerm);
                        $query->orWhere('description', 'LIKE', $searchTerm);
                    })->orderBy('items.id')->paginate($perPage);

            return response()->json([
                'data'      => $data,
                'categories'=> $categories,
                'racks'     => $racks,
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
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validatedData = Validator::make($request->all(), [
            'image'             => 'required|image|mimes:jpg,jpeg,png|max:2048',
            'item_code'         => 'required',
            'item_name'         => 'required',
            'category_id'       => 'required',
            'rack_id'           => 'required',
            'description'       => 'required',
        ]);

        try 
        {
            if ($validatedData->fails()){
                return response()->json(['success' => false, 'message' => $validatedData->errors()], JsonResponse::HTTP_INTERNAL_SERVER_ERROR);
            }

            if ($request->hasFile('image')) {
                $image = $request->file('image');
                $filename = time() . '_' . $image->getClientOriginalName();
                $image->storeAs('public/images', $filename);
            }

            $data   = Item::create([
                'image'             => $filename,
                'item_code'         => $request->item_code,
                'item_name'         => $request->item_name,
                'category_id'       => $request->category_id,
                'rack_id'           => $request->rack_id,
                'description'       => $request->description,
                'stock'             => '0',
            ]);

            return response()->json([
                'data'      => $data,
                'success'   => true,
                'message'   => 'Data created successfully'
            ], JsonResponse::HTTP_CREATED);
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
     * Display the specified resource.
     */
    public function show($id)
    {
        try 
        {
            $data   = Item::findOrFail($id);

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
     * Show the form for editing the specified resource.
     */
    public function edit($id)
    {
        try 
        {
            $data   = Item::findOrFail($id);

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
        try 
        {
            $data   = Item::findOrFail($id);
            $filename = $data->image;

            if ($request->hasFile('image')) {
                $validatedData = Validator::make($request->all(), [
                    'image'             => 'required|image|mimes:jpg,jpeg,png|max:2048',
                    'item_code'         => 'required',
                    'item_name'         => 'required',
                    'category_id'       => 'required',
                    'rack_id'           => 'required',
                    'description'       => 'required',
                ]);
                
                if ($validatedData->fails()){
                    return response()->json(['success' => false, 'message' => $validatedData->errors()], JsonResponse::HTTP_INTERNAL_SERVER_ERROR);
                }

                Storage::delete('public/images/' . $filename);
        
                $image = $request->file('image');
                $filename = time() . '_' . $image->getClientOriginalName();
                $image->storeAs('public/images', $filename);
            }

            $data->update([
                'image'             => $filename,
                'item_code'         => $request->input('item_code'),
                'item_name'         => $request->input('item_name'),
                'category_id'       => $request->input('category_id'),
                'rack_id'           => $request->input('rack_id'),
                'description'       => $request->input('description'),
            ]);

            return response()->json([
                'data'      => $data,
                'success'   => true,
                'message'   => 'Data updated successfully'
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
     * Remove the specified resource from storage.
     */
    public function destroy($id)
    {
        try 
        {
            $data   = Item::findOrFail($id);

            if ($data->image) {
                Storage::delete('public/images/' . $data->image);
            }

            $data->delete();

            return response()->json([
                'data'      => $data,
                'success'   => true,
                'message'   => 'Data deleted successfully'
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

}
