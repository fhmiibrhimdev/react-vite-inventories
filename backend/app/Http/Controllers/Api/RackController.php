<?php

namespace App\Http\Controllers\Api;

use Exception;
use App\Models\Rack;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Http\Controllers\Controller;

class RackController extends Controller
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

            $data = Rack::select('racks.*')
                    ->where(function ($query) use ($searchTerm) {
                        $query->where('rack_code', 'LIKE', $searchTerm);
                        $query->orWhere('rack_name', 'LIKE', $searchTerm);
                    })->orderBy('racks.id')->paginate($perPage);

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
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validatedData = $request->validate([
            'rack_code'         => 'required',
            'rack_name'         => 'required',
        ]);

        try 
        {
            $data   = Rack::create([
                'rack_code'         => $request->rack_code,
                'rack_name'         => $request->rack_name,
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
            $data   = Rack::findOrFail($id);

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
            $data   = Rack::findOrFail($id);

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
            $data   = Rack::findOrFail($id)->update([
                'rack_code'         => $request->rack_code,
                'rack_name'         => $request->rack_name,
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
            $data   = Rack::findOrFail($id)->delete();

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
