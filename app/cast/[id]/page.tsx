"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface profileProps {
  params: {
    id: string;
  };
}

interface CastData {
  _id: string;
  customerCode: string;
  monthDate: string;
  date: string;
  name: string;
  phone: string;
  k: number;
  t: number;
  otherProducts: string;
  advance: number;
  amount: number;
  installments: number;
  product: string;
  area: string;
  notes: string;
  collectedInstallmentNumber: number;
  printStatus: string;
  upcomingCollectionAmount: number;
  nextInstallment: number;
  piecePrice: number;
  status: string;
  column2: number;
  delayInMonths: number;
  paidFromNextInstallment: string;
}

export default function CustomerDetails({ params }: profileProps) {
  const [cast, setCast] = useState<CastData>();
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState<CastData | null>(null);

  useEffect(() => {
    getCastDetails();
  }, []);

  async function getCastDetails() {
    try {
      const response = await fetch(`/api/cast/${params.id}`);
      const data = await response.json();
      if (!response.ok) {
        throw new Error("Failed to fetch todos");
      }
      setCast(data);
      setEditedData(data);
    } catch (error) {
      console.error("Failed to fetch todos:", error);
    }
    console.log("casts from cast/page.tsx: ", cast);
  }

  async function handleSave() {
    try {
      const res = await fetch(`/api/cast/${params.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(editedData),
      });

      if (res.ok) {
        if (editedData) {
          setCast(editedData);
          setIsEditing(false);
        }
      }
    } catch (error) {
      console.error("Error updating customer:", error);
    }
  }

  if (!cast) return <div>Loading...</div>;

  return (
    <div className="container flex flex-col items-center space-y-6 py-6">
      <div className="flex flex-col items-center justify-center space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">تفاصيل العميل</h1>
        <p className="text-muted-foreground">عرض وتعديل بيانات العميل</p>
      </div>

      <div className="w-full max-w-2xl">
        <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
          <div className="p-6 space-y-4">
            {isEditing ? (
              <>
                <div className="grid gap-4">
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      value={editedData?.name || ""}
                      onChange={(e) =>
                        editedData &&
                        setEditedData({
                          ...editedData,
                          name: e.target.value,
                        } as CastData)
                      }
                      placeholder="Name"
                    />
                    <Input
                      value={editedData?.phone || ""}
                      onChange={(e) =>
                        setEditedData({
                          ...editedData,
                          phone: e.target.value,
                        } as CastData)
                      }
                      placeholder="Phone"
                    />
                    <Input
                      value={editedData?.area || ""}
                      onChange={(e) =>
                        setEditedData({
                          ...editedData,
                          area: e.target.value,
                        } as CastData)
                      }
                      placeholder="Area"
                    />
                    <Input
                      value={editedData?.product || ""}
                      onChange={(e) =>
                        setEditedData({
                          ...editedData,
                          product: e.target.value,
                        } as CastData)
                      }
                      placeholder="Product"
                    />
                    <Input
                      type="number"
                      value={editedData?.amount || ""}
                      onChange={(e) =>
                        setEditedData({
                          ...editedData,
                          amount: Number(e.target.value),
                        } as CastData)
                      }
                      placeholder="Amount"
                    />
                    <Input
                      type="number"
                      value={editedData?.installments || ""}
                      onChange={(e) =>
                        setEditedData({
                          ...editedData,
                          installments: Number(e.target.value),
                        } as CastData)
                      }
                      placeholder="Installments"
                    />
                  </div>
                  <div className="flex justify-end gap-4">
                    <Button onClick={() => setIsEditing(false)} variant="outline">
                      إلغاء
                    </Button>
                    <Button onClick={handleSave}>حفظ</Button>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="grid gap-2">
                  <p>
                    <strong>الاسم:</strong> {cast.name}
                  </p>
                  <p>
                    <strong>رقم الهاتف:</strong> {cast.phone}
                  </p>
                  <p>
                    <strong>المنطقة:</strong> {cast.area}
                  </p>
                  <p>
                    <strong>المنتج:</strong> {cast.product}
                  </p>
                  <p>
                    <strong>المبلغ:</strong> {cast.amount}
                  </p>
                  <p>
                    <strong>الأقساط:</strong> {cast.installments}
                  </p>
                  <p>
                    <strong>الملاحظات:</strong> {cast.notes}
                  </p>
                </div>
                <Button onClick={() => setIsEditing(true)} className="mt-4">
                  تعديل البيانات
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
