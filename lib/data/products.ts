// بيانات المنتجات المشتركة بين لوحة التحكم والمخزون

export async function fetchProductsFromDB() {
  const res = await fetch("/api/products");
  if (!res.ok) throw new Error("فشل في جلب المنتجات");
  return await res.json();
}
