"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { CastData } from "@/lib/types";
import { useParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

export default function CastDetails() {
  const params = useParams();
  const router = useRouter();
  const [cast, setCast] = useState<CastData | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<CastData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCast = async () => {
      try {
        const response = await fetch(`/api/cast/${params.id}`);
        if (!response.ok) {
          throw new Error("Failed to fetch data");
        }
        const data = await response.json();
        setCast(data);
        setFormData(data);
      } catch (error) {
        setError("Error fetching cast data");
        console.error("Error fetching cast:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCast();
  }, [params.id]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        [name]: value,
      } as CastData;
    });
  };

  const handleSave = async () => {
    try {
      const response = await fetch(`/api/cast/${params.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("Failed to update");
      }

      setCast(formData);
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating cast:", error);
    }
  };

  const handleDelete = async () => {
    if (!confirm("هل أنت متأكد من حذف هذا العميل؟")) {
      return;
    }

    try {
      const response = await fetch(`/api/cast/${params.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete");
      }

      router.push("/cast");
    } catch (error) {
      console.error("Error deleting cast:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <button
        onClick={() => router.back()}
        className="mb-6 flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L4.414 9H17a1 1 0 110 2H4.414l5.293 5.293a1 1 0 010 1.414z" clipRule="evenodd" />
        </svg>
        رجوع
      </button>

      <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-md p-6">
        <div className="flex flex-col items-center justify-center space-y-2 mb-8">
          <h1 className="text-3xl font-bold tracking-tight">تفاصيل العميل</h1>
          <p className="text-muted-foreground">عرض وتعديل بيانات العميل</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="name">الاسم</Label>
            <Input
              id="name"
              name="name"
              value={formData?.name ?? ""}
              onChange={handleInputChange}
              disabled={!isEditing}
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">رقم الهاتف</Label>
            <Input
              id="phone"
              name="phone"
              value={formData?.phone ?? ""}
              onChange={handleInputChange}
              disabled={!isEditing}
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">العنوان</Label>
            <Input
              id="address"
              name="area"
              value={formData?.area ?? ""}
              onChange={handleInputChange}
              disabled={!isEditing}
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="k">عدد الكراسى</Label>
            <Input
              id="k"
              name="k"
              value={formData?.k ?? ""}
              onChange={handleInputChange}
              disabled={!isEditing}
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="t">عدد الترابيزات</Label>
            <Input
              id="t"
              name="t"
              value={formData?.t ?? ""}
              onChange={handleInputChange}
              disabled={!isEditing}
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="advance">المقدم</Label>
            <Input
              id="advance"
              name="advance"
              value={formData?.advance ?? ""}
              onChange={handleInputChange}
              disabled={!isEditing}
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">المبلغ</Label>
            <Input
              id="amount"
              name="amount"
              value={formData?.amount ?? ""}
              onChange={handleInputChange}
              disabled={!isEditing}
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="installmentCount">عدد الاقساط</Label>
            <Input
              id="installmentCount"
              name="installmentCount"
              value={formData?.installmentCount ?? ""}
              onChange={handleInputChange}
              disabled={!isEditing}
              className="w-full"
            />
          </div>
        </div>

        <div className="flex justify-end gap-4 mt-8">
          {isEditing ? (
            <>
              <Button onClick={() => setIsEditing(false)} variant="outline">
                إلغاء
              </Button>
              <Button onClick={handleSave} className="bg-green-500 hover:bg-green-600">
                حفظ
              </Button>
            </>
          ) : (
            <>
              <Button onClick={() => setIsEditing(true)} variant="outline">
                تعديل
              </Button>
              <Button onClick={handleDelete} variant="destructive">
                حذف
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}