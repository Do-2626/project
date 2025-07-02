"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Users, Search, Plus } from "lucide-react";
import { mockDelegates } from "@/lib/data/delegates";

interface Delegate {
  id?: string;
  name: string;
  phone: string;
  capacity: number;
  created_at: string;
}

const Delegates = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [delegates, setDelegates] = useState<Delegate[]>(mockDelegates);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newDelegate, setNewDelegate] = useState({ name: "", phone: "", capacity: "" });

  const filteredDelegates = delegates.filter((d) => d.name.includes(searchTerm) || d.phone.includes(searchTerm));

  const handleAddDelegate = () => {
    if (!newDelegate.name || !newDelegate.phone || !newDelegate.capacity) return;
    setDelegates([
      { id: (delegates.length + 1).toString(), ...newDelegate, capacity: Number(newDelegate.capacity), created_at: new Date().toISOString() },
      ...delegates,
    ]);
    setIsAddOpen(false);
    setNewDelegate({ name: "", phone: "", capacity: "" });
  };

  return (
    <div className="p-4">
      <div className="flex flex-col md:flex-row justify-between mb-6 gap-4">
        <div className="relative w-full md:w-64">
          <Search className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <Input
            placeholder="بحث عن مندوب..."
            className="pr-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button size="sm" className="flex items-center gap-1" onClick={() => setIsAddOpen(true)}>
          <Plus size={16} />
          إضافة مندوب
        </Button>
      </div>
      <Card className="paper-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users size={18} />
            قائمة المناديب
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 text-right">الاسم</th>
                  <th className="px-4 py-3 text-right">رقم الهاتف</th>
                  <th className="px-4 py-3 text-right">الحمولة</th>
                  <th className="px-4 py-3 text-right">تاريخ الإضافة</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredDelegates.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-6 text-center text-gray-500">
                      لا يوجد مناديب مطابقة
                    </td>
                  </tr>
                ) : (
                  filteredDelegates.map((d) => (
                    <tr key={d.id} className="hover:bg-muted/50">
                      <td className="px-4 py-3">{d.name}</td>
                      <td className="px-4 py-3">{d.phone}</td>
                      <td className="px-4 py-3">{d.capacity}</td>
                      <td className="px-4 py-3">{new Date(d.created_at).toLocaleDateString('ar-EG')}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
      {/* Dialog لإضافة مندوب */}
      {isAddOpen && (
        <div className="fixed z-50 inset-0 flex items-center justify-center bg-black/30">
          <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-lg">
            <div className="mb-4 font-bold">إضافة مندوب جديد</div>
            <div className="space-y-3">
              <Input placeholder="اسم المندوب" value={newDelegate.name} onChange={e => setNewDelegate({ ...newDelegate, name: e.target.value })} />
              <Input placeholder="رقم الهاتف" value={newDelegate.phone} onChange={e => setNewDelegate({ ...newDelegate, phone: e.target.value })} />
              <Input placeholder="الحمولة" type="number" value={newDelegate.capacity} onChange={e => setNewDelegate({ ...newDelegate, capacity: e.target.value })} />
            </div>
            <div className="flex gap-2 mt-6">
              <Button onClick={handleAddDelegate}>إضافة</Button>
              <Button variant="outline" onClick={() => setIsAddOpen(false)}>إلغاء</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Delegates;
