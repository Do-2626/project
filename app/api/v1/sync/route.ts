import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongoose";

// Authentication is now handled through Bearer token in Authorization header
function checkAuth(request: NextRequest) {
  const authHeader = request.headers.get("Authorization");
  
  // If API key is set in environment variables, require authentication
  const API_KEY = process.env.API_KEY;
  if (API_KEY) {
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "مطلوب مصادقة" },
        { status: 401 }
      );
    }
    
    const token = authHeader.substring(7); // Remove "Bearer " prefix
    if (token !== API_KEY) {
      return NextResponse.json(
        { error: "رمز المصادقة غير صحيح" },
        { status: 401 }
      );
    }
  }
  
  return null;
}

function handleCORS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}

export async function GET(request: NextRequest) {
  const authError = checkAuth(request);
  if (authError) return authError;

  const mongoose = await dbConnect();
  const db = mongoose.connection.db;

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const dataCollection = db.collection("data");

    if (id) {
      const document = await dataCollection.findOne({ _id: id });
      if (document) {
        return NextResponse.json(document.value);
      } else {
        return NextResponse.json(
          { error: "الوثيقة غير موجودة" },
          { status: 404 }
        );
      }
    } else {
      const allData = await dataCollection.find().toArray();
      const responseData = allData.reduce((acc: { [x: string]: any; }, doc: { _id: string | number; value: any; }) => {
        if (doc._id) {
          acc[doc._id] = doc.value;
        }
        return acc;
      }, {});
      return NextResponse.json(responseData);
    }
  } catch (error) {
    console.error("GET Error:", error);
    return NextResponse.json(
      { error: "فشل في جلب البيانات" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const authError = checkAuth(request);
  if (authError) return authError;

  const mongoose = await dbConnect();
  const db = mongoose.connection.db;

  try {
    const payload = await request.json();
    const dataCollection = db.collection("data");

    if (payload.action === "test-connection" || payload.action === "insert-test-data") {
      if (payload.action === "insert-test-data") {
        await dataCollection.updateOne(
          { _id: "test_connection_entry" },
          {
            $set: {
              value: {
                message: "تم الاتصال والكتابة بنجاح! هذا سجل تجريبي.",
                timestamp: new Date(),
                user: "System Test"
              }
            }
          },
          { upsert: true }
        );
      }
      const collections = await db.listCollections().toArray();
      const collectionNames = collections.map((col: { name: any; }) => col.name);
      const targetCollectionName = collectionNames.includes("data")
        ? "data"
        : (collectionNames.length > 0 ? collectionNames[0] : null);
      let sampleData = {};
      if (targetCollectionName) {
        const sampleCollection = db.collection(targetCollectionName);
        const sampleDocuments = await sampleCollection.find().limit(5).toArray();
        sampleData = sampleDocuments.reduce((acc: { [x: string]: any; }, doc: { _id: string | number; value: any; }) => {
          if (doc._id) acc[doc._id] = doc.value;
          return acc;
        }, {});
      }
      return NextResponse.json({
        status: "success",
        message: payload.action === "insert-test-data" ? "تم إدخال البيانات بنجاح!" : "تم الاتصال بنجاح!",
        collections: collectionNames,
        sampleData: sampleData,
        sampledCollection: targetCollectionName
      });
    }
    const dataToSync = payload;
    const operations = [];
    for (const key in dataToSync) {
      operations.push({
        updateOne: {
          filter: { _id: key },
          update: { $set: { value: dataToSync[key] } },
          upsert: true,
        },
      });
    }
    if (operations.length > 0) {
      await dataCollection.bulkWrite(operations);
    }
    return NextResponse.json({ message: "تمت المزامنة بنجاح" });
  } catch (error) {
    console.error("POST Error:", error);
    return NextResponse.json(
      { error: "فشل في معالجة الطلب" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  const authError = checkAuth(request);
  if (authError) return authError;

  const mongoose = await dbConnect();
  const db = mongoose.connection.db;

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json(
        { error: "معرّف الوثيقة مطلوب" },
        { status: 400 }
      );
    }
    const updateData = await request.json();
    const dataCollection = db.collection("data");
    const result = await dataCollection.findOneAndUpdate(
      { _id: id },
      { $set: { value: updateData } },
      {
        returnDocument: 'after',
        upsert: true
      }
    );
    if (!result) {
      return NextResponse.json(
        { error: "فشل في تحديث الوثيقة" },
        { status: 500 }
      );
    }
    return NextResponse.json({
      message: "تم التحديث بنجاح",
      data: result.value
    });
  } catch (error) {
    console.error("PUT Error:", error);
    return NextResponse.json(
      { error: "فشل في تحديث الوثيقة" },
      { status: 500 }
    );
  }
}

export async function OPTIONS(request: NextRequest) {
  return handleCORS();
}
