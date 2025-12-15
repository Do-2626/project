# توثيق API Cloud Store

## نظرة عامة
هذا الملف `app/api/v1/cloud/route.ts` يمثل نقطة النهاية الرئيسية لتخزين البيانات السحابية في النظام. يدعم عمليات `GET` و`POST` و`OPTIONS` لمزامنة البيانات بين الخادم والعملاء.

## البنية الهيكلية
```
app/
├── api/
│   └── v1/
│       └── cloud/
│           └── route.ts          # نقطة النهاية الرئيسية للبيانات السحابية
```

## التبعيات
```typescript
import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongoose";
```

## رؤوس CORS
```typescript
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};
```

## الدوال الرئيسية

### 1. معالجة طلبات CORS المسبقة (`OPTIONS`)
```typescript
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: corsHeaders,
  });
}
```

**الوظيفة**: معالجة طلبات CORS المسبقة من المتصفحات.
**المدخلات**: `NextRequest` - طلب HTTP
**المخرجات**: `NextResponse` - استجابة برموز CORS

### 2. وسيط المصادقة (`checkAuth`)
```typescript
function checkAuth(request: NextRequest) {
  // API key authentication is currently disabled
  return null;
}
```

**الوظيفة**: التحقق من صحة طلبات المصادقة (معلقة حالياً)
**المدخلات**: `NextRequest` - طلب HTTP
**المخرجات**: `null` إذا كان الطلب صالح، أو `NextResponse` تحتوي على خطأ

### 3. استرجاع جميع البيانات (`GET`)
```typescript
export async function GET(request: NextRequest) {
  const authError = checkAuth(request);
  if (authError) return authError;

  const mongoose = await dbConnect();
  const db = mongoose.connection.db;

  try {
    const dataCollection = db.collection("cloud_data");
    
    // جلب جميع المستندات من المجموعة
    const allData = await dataCollection.find().toArray();
    
    // تحويل البيانات إلى التنسيق المتوقع
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
```

**الوظيفة**: استرجاع جميع البيانات المخزنة في المجموعة `cloud_data`
**المدخلات**: `NextRequest` - طلب HTTP
**المخرجات**: `NextResponse` تحتوي على:
- `200` مع البيانات إذا نجحت العملية
- `500` مع رسالة خطأ إذا فشلت

**تنسيق الاستجابة الناجحة**:
```json
{
  "products": [...],
  "branches": [...],
  "sales_main": [...],
  "sales_BRANCH_ID": [...]
}
```

### 4. مزامنة البيانات (`POST`)
```typescript
export async function POST(request: NextRequest) {
  const authError = checkAuth(request);
  if (authError) return authError;

  const mongoose = await dbConnect();
  const db = mongoose.connection.db;

  try {
    const dataToUpdate = await request.json();
    const dataCollection = db.collection("cloud_data");
    
    // إعداد عمليات الكتابة المجمعة لجميع المفاتيح
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
    
    // تنفيذ جميع العمليات
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
```

**الوظيفة**: مزامنة البيانات مع الخادم باستخدام عمليات `upsert` مجمعة
**المدخلات**: `NextRequest` تحتوي على JSON body
**المخرجات**: `NextResponse` تحتوي على:
- `200` مع رسالة نجاح إذا تمت المزامنة
- `500` مع رسالة خطأ إذا فشلت

**تنسيق الطلب**:
```json
{
  "products": [...],
  "branches": [...],
  "sales_main": [...],
  "sales_BRANCH_ID": [...]
}
```

## هيكل قاعدة البيانات

### مجموعة `cloud_data`
```typescript
interface CloudDataDocument {
  _id: string;        // مفتاح البيانات (مثل "products", "branches", إلخ)
  value: any;         // قيمة البيانات (مصفوفة أو كائن)
}
```

**أمثلة على المفاتيح المتوقعة**:
- `products` - قائمة المنتجات
- `branches` - قائمة الفروع
- `sales_main` - المبيعات الرئيسية
- `sales_[BRANCH_ID]` - مبيعات فرع معين

## رموز الحالة HTTP

- `200` - نجاح العملية
- `401` - خطأ في المصادقة (غير مفعل حالياً)
- `500` - خطأ داخلي في الخادم

## رسائل الخطأ

- العربية:
  - "مطلوب مصادقة" - عند فقدان token المصادقة
  - "رمز المصادقة غير صحيح" - عند وجود token غير صحيح
  - "فشل في جلب البيانات" - عند فشل استرجاع البيانات
  - "فشل في معالجة البيانات" - عند فشل معالجة البيانات

- الإنجليزية (في السجلات):
  - "GET Error" - أخطاء استرجاع البيانات
  - "POST Error" - أخطاء معالجة البيانات

## أمثلة الاستخدام

### 1. استرجاع جميع البيانات
```bash
curl -X GET https://example.com/api/v1/cloud
```

### 2. مزامنة البيانات
```bash
curl -X POST https://example.com/api/v1/cloud \
  -H "Content-Type: application/json" \
  -d '{
    "products": [
      { "id": 1, "name": "منتج 1", "price": 100 },
      { "id": 2, "name": "منتج 2", "price": 200 }
    ],
    "branches": [
      { "id": "branch1", "name": "الفرع الرئيسي" }
    ]
  }'
```

### 3. طلب CORS المسبق
```bash
curl -X OPTIONS https://example.com/api/v1/cloud \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type" \
  -H "Origin: https://example.com"
```

## الميزات

1. **دعم CORS الكامل** - يمكن الوصول للAPI من أي نطاق
2. **مصادقة مرنة** - دعم Bearer token (معلقة حالياً)
3. **عمليات مجمعة** - استخدام `bulkWrite` لأداء عالي
4. **معالجة الأخطاء** - رسائل خطأ واضحة بالعربية والإنجليزية
5. **تخزين مرن** - دعم أي نوع من البيانات عبر المفاتيح الديناميكية

## التخصيص

لتمكين المصادقة، أضف متغير البيئة `API_KEY` وقم بإلغاء تعليق كود المصادقة في دالة `checkAuth`.

```typescript
// في دالة checkAuth، أزل التعليق عن هذا الكود:
const authHeader = request.headers.get("Authorization");
const API_KEY = process.env.API_KEY;
if (API_KEY) {
  // كود التحقق من المصادقة
}
```