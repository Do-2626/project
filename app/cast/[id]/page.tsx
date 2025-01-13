"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { CastData } from "@/lib/types";

export default function CastDetails() {
  const params = useParams();

  const [cast, setCast] = useState<CastData | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<CastData | null>(null);

  useEffect(() => {
    const fetchCast = async () => {
      try {
        const response = await fetch(`/api/cast/${params.id}`);
        const data = await response.json();
        setCast(data);
        setFormData(data);
      } catch (error) {
        console.error("Error fetching cast:", error);
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

      window.location.href = "/cast";
    } catch (error) {
      console.error("Error deleting cast:", error);
    }
  };

  if (!cast) return <div>Loading...</div>;

  return (
    <div className="container flex flex-col items-center space-y-6 py-6">
      <div className="flex flex-col items-center justify-center space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">تفاصيل العميل</h1>
        <p className="text-muted-foreground">عرض وتعديل بيانات العميل</p>
      </div>
      <div className="w-full max-w-md space-y-4">
        {/* الاسم */}
        <div className="space-y-2">
          <Label htmlFor="name">الاسم</Label>
          <Input
            id="name"
            name="name"
            value={formData?.name ?? ""}
            onChange={handleInputChange}
            disabled={!isEditing}
          />
        </div>

        {/* رقم الهاتف */}
        <div className="space-y-2">
          <Label htmlFor="phone">رقم الهاتف</Label>
          <Input
            id="phone"
            name="phone"
            value={formData?.phone ?? ""}
            onChange={handleInputChange}
            disabled={!isEditing}
          />
        </div>

        {/* العنوان */}
        <div className="space-y-2">
          <Label htmlFor="address">العنوان</Label>
          <Input
            id="address"
            name="address"
            value={formData?.area ?? ""}
            onChange={handleInputChange}
            disabled={!isEditing}
          />
        </div>

        {/* عدد k */}
        <div className="space-y-2">
          <Label htmlFor="k">عدد الكراسى</Label>
          <Input
            id="k"
            name="k"
            value={formData?.k ?? ""}
            onChange={handleInputChange}
            disabled={!isEditing}
          />
        </div>

        {/* عدد t */}
        <div className="space-y-2">
          <Label htmlFor="t">عدد الترابيزات</Label>
          <Input
            id="t"
            name="t"
            value={formData?.t ?? ""}
            onChange={handleInputChange}
            disabled={!isEditing}
          />
        </div>

        {/* المقدم */}
        {/* advance */}
        <div className="space-y-2">
          <Label htmlFor="advance">المقدم</Label>
          <Input
            id="advance"
            name="advance"
            value={formData?.advance ?? ""}
            onChange={handleInputChange}
            disabled={!isEditing}
          />
        </div>

        {/* البلغ */}
        <div className="space-y-2">
          <Label htmlFor="amount">المبلغ</Label>
          <Input
            id="amount"
            name="amount"
            value={formData?.amount ?? ""}
            onChange={handleInputChange}
            disabled={!isEditing}
          />
        </div>

        {/* عددالاقساط */}
        {/* installmentCount */}
        <div className="space-y-2">
          <Label htmlFor="installmentCount">عدد الاقساط</Label>
          <Input
            id="installmentCount"
            name="installmentCount"
            value={formData?.installmentCount ?? ""}
            onChange={handleInputChange}
            disabled={!isEditing}
          />
        </div>

        <div className="flex justify-end gap-2">
          {isEditing ? (
            <>
              <Button onClick={() => setIsEditing(false)} variant="outline">
                إلغاء
              </Button>
              <Button onClick={handleSave}>حفظ</Button>
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
