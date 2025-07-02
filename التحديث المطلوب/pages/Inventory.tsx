import React, { useState } from 'react';
import { MainLayout } from '@/components/Layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Package, Search, Plus, FileDown, FileUp } from 'lucide-react';
import { AddProductDialog } from '@/components/Inventory/AddProductDialog';
import { ProductCard } from '@/components/Inventory/ProductCard';
import EditProductDialog from '@/components/Inventory/EditProductDialog';

const mockProducts = [
	{
		id: '1',
		name: 'حليب كامل الدسم',
		description: 'حليب طازج',
		price: 10,
		current_stock: 150,
		updated_at: '2025-07-01',
		created_at: '2025-07-01',
	},
	{
		id: '2',
		name: 'زبادي',
		description: 'زبادي طبيعي',
		price: 7,
		current_stock: 100,
		updated_at: '2025-07-02',
		created_at: '2025-07-02',
	},
	{
		id: '3',
		name: 'جبن أبيض',
		description: 'جبن طازج',
		price: 15,
		current_stock: 30,
		updated_at: '2025-07-02',
		created_at: '2025-07-02',
	},
];

const Inventory = () => {
	const [isAddProductOpen, setIsAddProductOpen] = useState(false);
	const [selectedProduct, setSelectedProduct] = useState(null);
	const [searchTerm, setSearchTerm] = useState('');
	const [isEditProductOpen, setIsEditProductOpen] = useState(false);
	const [editingProduct, setEditingProduct] = useState(null);
	const [products, setProducts] = useState(mockProducts);

	const filteredProducts = products.filter((product) =>
		product.name.includes(searchTerm)
	);

	const handleSearchChange = (e) => {
		setSearchTerm(e.target.value);
	};

	const handleViewProduct = (product) => {
		setSelectedProduct(product);
	};

	const closeProductCard = () => {
		setSelectedProduct(null);
	};

	const handleRestockProduct = (id, newStock) => {
		setProducts((products) =>
			products.map((p) =>
				p.id === id ? { ...p, current_stock: newStock } : p
			)
		);
	};

	const handleEditProduct = (product) => {
		setEditingProduct(product);
		setIsEditProductOpen(true);
	};

	const closeAddProductDialog = () => {
		setIsAddProductOpen(false);
	};

	const handleAddProduct = (data) => {
		setProducts((products) => [
			...products,
			{
				...data,
				id: (products.length + 1).toString(),
				updated_at: new Date().toISOString(),
				created_at: new Date().toISOString(),
			},
		]);
		setIsAddProductOpen(false);
	};

	return (
		<MainLayout title="إدارة المخزون">
			<div className="flex flex-col md:flex-row justify-between mb-6 gap-4">
				<div className="relative w-full md:w-64">
					<Search
						className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400"
						size={18}
					/>
					<Input
						placeholder="البحث عن المنتجات..."
						className="pr-8"
						value={searchTerm}
						onChange={handleSearchChange}
					/>
				</div>
				<div className="flex gap-2">
					<Button
						variant="outline"
						size="sm"
						className="flex items-center gap-1"
					>
						<FileDown size={16} />
						تصدير
					</Button>
					<Button
						variant="outline"
						size="sm"
						className="flex items-center gap-1"
					>
						<FileUp size={16} />
						استيراد
					</Button>
					<Button
						size="sm"
						className="flex items-center gap-1"
						onClick={() => setIsAddProductOpen(true)}
					>
						<Plus size={16} />
						منتج جديد
					</Button>
				</div>
			</div>
			<Card className="paper-card">
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Package size={18} />
						بطاقات مخزون المنتجات
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="overflow-x-auto">
						<table className="w-full text-sm">
							<thead className="bg-muted text-muted-foreground">
								<tr>
									<th className="px-4 py-3 text-right">اسم المنتج</th>
									<th className="px-4 py-3 text-right">الوصف</th>
									<th className="px-4 py-3 text-right">السعر</th>
									<th className="px-4 py-3 text-right">المخزون الحالي</th>
									<th className="px-4 py-3 text-right">آخر تحديث</th>
									<th className="px-4 py-3 text-right">الإجراءات</th>
								</tr>
							</thead>
							<tbody className="divide-y divide-gray-200">
								{filteredProducts.length === 0 ? (
									<tr>
										<td
											colSpan={6}
											className="px-4 py-6 text-center text-gray-500"
										>
											لا توجد منتجات مطابقة للبحث
										</td>
									</tr>
								) : (
									filteredProducts.map((product) => (
										<tr key={product.id} className="hover:bg-muted/50">
											<td className="px-4 py-3">{product.name}</td>
											<td className="px-4 py-3">
												{product.description || '-'}
											</td>
											<td className="px-4 py-3">{product.price} جم</td>
											<td className="px-4 py-3">
												{product.current_stock} وحدة
											</td>
											<td className="px-4 py-3">
												{new Date(product.updated_at).toLocaleDateString(
													'ar-EG'
												)}
											</td>
											<td className="px-4 py-3">
												<div className="flex space-x-2">
													<Button
														className="m-2"
														variant="outline"
														size="sm"
														onClick={() => handleViewProduct(product)}
													>
														عرض البطاقة
													</Button>
													<Button
														className="m-2"
														variant="outline"
														size="sm"
														onClick={() =>
															handleRestockProduct(
																product.id,
																product.current_stock + 1
															)
														}
													>
														إعادة التخزين
													</Button>
													<Button
														className="m-2"
														variant="outline"
														size="sm"
														onClick={() => handleEditProduct(product)}
													>
														تعديل
													</Button>
												</div>
											</td>
										</tr>
									))
								)}
							</tbody>
						</table>
					</div>
				</CardContent>
			</Card>
			<div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
				<Card className="paper-card">
					<CardHeader>
						<CardTitle>حركات المخزون الأخيرة</CardTitle>
					</CardHeader>
					<CardContent>
						{products.length > 0 ? (
							<div className="space-y-4">
								{products.slice(0, 3).map((product) => (
									<div
										key={product.id}
										className="border-b pb-2 flex justify-between"
									>
										<div>
											<p className="font-medium">{product.name}</p>
											<p className="text-sm text-muted-foreground">
												{product.current_stock > 50 ? 'وارد: ' : 'صادر: '}
												{product.current_stock > 50
													? product.current_stock - 30
													: 20}{' '}
												وحدة
											</p>
										</div>
										<div className="text-right">
											<p className="text-sm text-muted-foreground">
												{new Date(product.updated_at).toLocaleDateString(
													'ar-EG'
												)}
											</p>
											<p className="text-xs">
												الرصيد الجديد: {product.current_stock} وحدة
											</p>
										</div>
									</div>
								))}
							</div>
						) : (
							<div className="text-center p-4 text-muted-foreground">
								لا توجد حركات مخزون حديثة
							</div>
						)}
					</CardContent>
				</Card>
				<Card className="paper-card">
					<CardHeader>
						<CardTitle>تنبيهات المخزون المنخفض</CardTitle>
					</CardHeader>
					<CardContent>
						{products.filter((p) => p.current_stock < 30).length > 0 ? (
							<div className="space-y-4">
								{products
									.filter((p) => p.current_stock < 30)
									.map((product) => (
										<div
											key={product.id}
											className="flex items-center p-2 bg-red-50 border border-red-200 rounded"
										>
											<div className="flex-1">
												<p className="font-medium">{product.name}</p>
												<p className="text-sm text-red-700">
													متبقي {product.current_stock} وحدات فقط
												</p>
											</div>
											<Button
												size="sm"
												onClick={() =>
													handleRestockProduct(
														product.id,
														product.current_stock + 1
													)
												}
											>
												إعادة التخزين
											</Button>
										</div>
									))}
							</div>
						) : (
							<div className="text-center p-4 text-muted-foreground">
								لا توجد تنبيهات للمخزون المنخفض
							</div>
						)}
					</CardContent>
				</Card>
			</div>
			<AddProductDialog
				isOpen={isAddProductOpen}
				onClose={closeAddProductDialog}
				onSubmit={handleAddProduct}
			/>
			{selectedProduct && (
				<ProductCard
					product={selectedProduct}
					isOpen={!!selectedProduct}
					onClose={closeProductCard}
					onUpdateStock={handleRestockProduct}
				/>
			)}
			{isEditProductOpen && (
				<EditProductDialog
					isOpen={isEditProductOpen}
					onClose={() => setIsEditProductOpen(false)}
					product={editingProduct}
				/>
			)}
		</MainLayout>
	);
};

export default Inventory;
