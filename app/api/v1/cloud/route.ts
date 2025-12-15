import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongoose";

// Data validation functions
const validators = {
  // Validate product structure
  validateProduct: (product: any): boolean => {
    return (
      product &&
      typeof product === 'object' &&
      (product.id !== undefined || product.name !== undefined) &&
      (product.price === undefined || typeof product.price === 'number') &&
      (product.initialStock === undefined || typeof product.initialStock === 'number')
    );
  },
  
  // Validate branch structure  
  validateBranch: (branch: any): boolean => {
    return (
      branch &&
      typeof branch === 'object' &&
      typeof branch.name === 'string' &&
      branch.name.trim().length > 0
    );
  },
  
  // Validate sale transaction
  validateSale: (sale: any): boolean => {
    return (
      sale &&
      typeof sale === 'object' &&
      Array.isArray(sale.items) &&
      sale.items.every((item: any) => 
        item && 
        typeof item === 'object' &&
        (item.productId !== undefined || item.productName !== undefined) &&
        typeof item.quantity === 'number' &&
        item.quantity > 0
      ) &&
      (sale.total === undefined || typeof sale.total === 'number') &&
      (sale.branch === undefined || typeof sale.branch === 'string')
    );
  },
  
  // Validate array of specific type
   validateArray: (array: any[], validator: (item: any) => boolean): boolean => {
     return Array.isArray(array) && array.every(validator);
   },
   
   // Validate sync delta structure
   validateDelta: (delta: any): boolean => {
     return (
       delta &&
       typeof delta === 'object' &&
       typeof delta.timestamp === 'number' &&
       (delta.operations === undefined || Array.isArray(delta.operations))
     );
   }
 };

// CORS headers configuration
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

// Handle CORS preflight requests
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: corsHeaders,
  });
}

// Authentication middleware
function checkAuth(request: NextRequest) {
  // const authHeader = request.headers.get("Authorization");
  
  // // If API key is set in environment variables, require authentication
  // const API_KEY = process.env.API_KEY;
  // if (API_KEY) {
  //   if (!authHeader || !authHeader.startsWith("Bearer ")) {
  //     return NextResponse.json(
  //       { error: "مطلوب مصادقة" },
  //       { status: 401, headers: corsHeaders }
  //     );
  //   }
    
  //   const token = authHeader.substring(7); // Remove "Bearer " prefix
  //   if (token !== API_KEY) {
  //     return NextResponse.json(
  //       { error: "رمز المصادقة غير صحيح" },
  //       { status: 401, headers: corsHeaders }
  //     );
  //   }
  // }
  
  return null;
}

// GET - Retrieve all data
export async function GET(request: NextRequest) {
  const authError = checkAuth(request);
  if (authError) return authError;

  const mongoose = await dbConnect();
  const db = mongoose.connection.db;

  try {
    const dataCollection = db.collection("cloud_data");
    
    // Get all documents from the collection
    const allData = await dataCollection.find().toArray();
    
    // Transform data into the expected format
    const responseData = allData.reduce((acc: { [key: string]: any }, doc: { _id: string | number; value: any; }) => {
      if (doc._id) {
        acc[doc._id] = doc.value;
      }
      return acc;
    }, {});
    
    return NextResponse.json(responseData, {
      status: 200,
      headers: corsHeaders,
    });
    
  } catch (error) {
    console.error("GET Error:", error);
    return NextResponse.json(
      { error: "فشل في جلب البيانات" },
      { status: 500, headers: corsHeaders }
    );
  }
}

// POST - Update/Sync data
export async function POST(request: NextRequest) {
  const authError = checkAuth(request);
  if (authError) return authError;

  const mongoose = await dbConnect();
  const db = mongoose.connection.db;

  try {
    const dataToUpdate = await request.json();
    
    // Validate incoming data structure
    if (!dataToUpdate || typeof dataToUpdate !== 'object') {
      return NextResponse.json(
        { error: "بيانات غير صحيحة" },
        { status: 400, headers: corsHeaders }
      );
    }
    
    // Validate specific data types if provided (ignore fields starting with _)
    for (const [key, value] of Object.entries(dataToUpdate)) {
      if (key.startsWith('_')) continue; // Skip internal fields
      
      if (key === 'products' && !validators.validateArray(value as any[], validators.validateProduct)) {
        return NextResponse.json(
          { error: "هيكل المنتجات غير صحيح" },
          { status: 400, headers: corsHeaders }
        );
      }
      
      if (key === 'branches' && !validators.validateArray(value as any[], validators.validateBranch)) {
        return NextResponse.json(
          { error: "هيكل الفروع غير صحيح" },
          { status: 400, headers: corsHeaders }
        );
      }
      
      if (key === 'sales_main' && !validators.validateArray(value as any[], validators.validateSale)) {
        return NextResponse.json(
          { error: "هيكل المبيعات غير صحيح" },
          { status: 400, headers: corsHeaders }
        );
      }
    }
    
    const dataCollection = db.collection("cloud_data");
    
    // Check if this is a delta sync (contains _lastSync field)
    const isDeltaSync = dataToUpdate._lastSync !== undefined;
    const syncTimestamp = Date.now();
    
    // Prepare bulk write operations for all keys
    const operations = [];
    
    for (const [key, value] of Object.entries(dataToUpdate)) {
      // Skip internal fields used for delta sync
      if (key.startsWith('_')) continue;
      
      // For arrays (products, branches, sales_main), use $addToSet to merge instead of replace
      if (Array.isArray(value)) {
        operations.push({
          updateOne: {
            filter: { _id: key },
            update: { 
              $addToSet: { 
                value: { $each: value }
              }
            },
            upsert: true,
          },
        });
      } else {
        // For non-array data, use $set as before
        operations.push({
          updateOne: {
            filter: { _id: key },
            update: { $set: { value: value } },
            upsert: true,
          },
        });
      }
    }
    
    // Add sync metadata for delta sync
    if (isDeltaSync) {
      operations.push({
        updateOne: {
          filter: { _id: "_syncMetadata" },
          update: { 
            $set: { 
              value: {
                lastSync: syncTimestamp,
                lastDeltaSync: dataToUpdate._lastSync
              }
            }
          },
          upsert: true,
        },
      });
    }
    
    // Execute all operations
    if (operations.length > 0) {
      await dataCollection.bulkWrite(operations);
    }
    
    return NextResponse.json(
      { 
        success: true, 
        message: "تمت مزامنة البيانات بنجاح" 
      },
      { 
        status: 200, 
        headers: corsHeaders 
      }
    );
    
  } catch (error) {
    console.error("POST Error:", error);
    return NextResponse.json(
      { error: "فشل في معالجة البيانات" },
      { status: 500, headers: corsHeaders }
    );
  }
}