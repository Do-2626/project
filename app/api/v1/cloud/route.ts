import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongoose";

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
  const authHeader = request.headers.get("Authorization");
  
  // If API key is set in environment variables, require authentication
  const API_KEY = process.env.API_KEY;
  if (API_KEY) {
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "مطلوب مصادقة" },
        { status: 401, headers: corsHeaders }
      );
    }
    
    const token = authHeader.substring(7); // Remove "Bearer " prefix
    if (token !== API_KEY) {
      return NextResponse.json(
        { error: "رمز المصادقة غير صحيح" },
        { status: 401, headers: corsHeaders }
      );
    }
  }
  
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
    const dataCollection = db.collection("cloud_data");
    
    // Prepare bulk write operations for all keys
    const operations = [];
    
    for (const [key, value] of Object.entries(dataToUpdate)) {
      operations.push({
        updateOne: {
          filter: { _id: key },
          update: { $set: { value: value } },
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