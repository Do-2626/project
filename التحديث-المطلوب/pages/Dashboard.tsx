import React from 'react';
import { MainLayout } from '@/components/Layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TrendingUp, Package, AlertTriangle, FileText, Users } from 'lucide-react';

const mockProducts = [
	{
		id: 1,
		name: 'حليب كامل الدسم',
		current_stock: 150,
		price: 10,
		purchase_price: 8,
		created_at: '2025-07-01',
		updated_at: '2025-07-01',
	},
	{
		id: 2,
		name: 'زبادي',
		current_stock: 100,
		price: 7,
		purchase_price: 5,
		created_at: '2025-07-02',
		updated_at: '2025-07-02',
	},
	{
		id: 3,
		name: 'جبن أبيض',
		current_stock: 30,
		price: 15,
		purchase_price: 12,
		created_at: '2025-07-02',
		updated_at: '2025-07-02',
	},
];

const Dashboard = () => {
	const products = mockProducts;
	const totalStock = products.reduce((sum, product) => sum + product.current_stock, 0);
	const totalPurchaseValue = products.reduce((sum, product) => {
		const purchasePrice = product.purchase_price || product.price;
		return sum + purchasePrice * product.current_stock;
	}, 0);
	const today = new Date().toISOString().split('T')[0];
	const addedToday = products.filter(product => product.created_at.startsWith(today)).length;
	return (
		<MainLayout title="لوحة التحكم">
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
				<Card className="paper-card">
					<CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
						<CardTitle className="text-sm font-medium">إجمالي المنتجات</CardTitle>
						<Package className="h-4 w-4 text-dairy-500" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{products.length}</div>
						<p className="text-xs text-muted-foreground">+{addedToday} أضيفت اليوم</p>
						<div className="mt-2 pt-2 border-t border-gray-100">
							<p className="text-xs text-muted-foreground">
								إجمالي المخزون: <span className="font-medium">{totalStock} قطعة</span>
							</p>
							<p className="text-xs text-muted-foreground">
								القيمة الشرائية:{' '}
								<span className="font-medium">{totalPurchaseValue.toLocaleString()} ريال</span>
							</p>
						</div>
					</CardContent>
				</Card>
				<Card className="paper-card">
					<CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
						<CardTitle className="text-sm font-medium">المبيعات الشهرية</CardTitle>
						<TrendingUp className="h-4 w-4 text-cream-600" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">18,435 ريال</div>
						<p className="text-xs text-muted-foreground">+8.2% مقارنة بالشهر الماضي</p>
					</CardContent>
				</Card>
				<Card className="paper-card">
					<CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
						<CardTitle className="text-sm font-medium">العملاء النشطون</CardTitle>
						<Users className="h-4 w-4 text-dairy-500" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">24</div>
						<p className="text-xs text-muted-foreground">3 جدد هذا الأسبوع</p>
					</CardContent>
				</Card>
				<Card className="paper-card">
					<CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
						<CardTitle className="text-sm font-medium">المديونيات</CardTitle>
						<FileText className="h-4 w-4 text-cream-600" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">7</div>
						<p className="text-xs text-muted-foreground">2 مستحقة اليوم</p>
					</CardContent>
				</Card>
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
				<Card className="paper-card lg:col-span-2">
					<CardHeader>
						<CardTitle>المعاملات الأخيرة</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="space-y-4">
							<div className="border-b pb-2 flex justify-between">
								<div>
									<p className="font-medium">توريد حليب كامل الدسم</p>
									<p className="text-sm text-muted-foreground">سوبر ماركت الفتح</p>
								</div>
								<div className="text-right">
									<p className="font-medium text-dairy-600">150 وحدة</p>
									<p className="text-sm text-muted-foreground">4 أبريل 2025</p>
								</div>
							</div>
							<div className="border-b pb-2 flex justify-between">
								<div>
									<p className="font-medium">إعادة تخزين الزبادي</p>
									<p className="text-sm text-muted-foreground">شركة الروابي</p>
								</div>
								<div className="text-right">
									<p className="font-medium text-dairy-600">100 وحدة</p>
									<p className="text-sm text-muted-foreground">2 أبريل 2025</p>
								</div>
							</div>
							<div className="border-b pb-2 flex justify-between">
								<div>
									<p className="font-medium">توريد جبن أبيض</p>
									<p className="text-sm text-muted-foreground">سوبر ماركت الفتح</p>
								</div>
								<div className="text-right">
									<p className="font-medium text-dairy-600">30 وحدة</p>
									<p className="text-sm text-muted-foreground">3 أبريل 2025</p>
								</div>
							</div>
						</div>
						<div className="mt-4">
							<Button variant="outline" className="w-full">
								عرض جميع المعاملات
							</Button>
						</div>
					</CardContent>
				</Card>

				<Card className="paper-card">
					<CardHeader>
						<CardTitle>التنبيهات</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="flex items-center gap-2 p-2 bg-red-50 border border-red-200 rounded text-red-800">
							<AlertTriangle className="h-4 w-4" />
							<span className="text-sm">مطلوب فحص الدفعة MLK-002</span>
						</div>
						<div className="flex items-center gap-2 p-2 bg-amber-50 border border-amber-200 rounded text-amber-800">
							<AlertTriangle className="h-4 w-4" />
							<span className="text-sm">انتهاء صلاحية الزبادي خلال 3 أيام</span>
						</div>
						<div className="flex items-center gap-2 p-2 bg-blue-50 border border-blue-200 rounded text-blue-800">
							<AlertTriangle className="h-4 w-4" />
							<span className="text-sm">استحقاق دفع الفاتورة رقم A-2025-123</span>
						</div>
						<div className="mt-4">
							<Button variant="outline" className="w-full">
								عرض كل التنبيهات
							</Button>
						</div>
					</CardContent>
				</Card>
			</div>

			<Card className="paper-card">
				<CardHeader>
					<CardTitle>جدول التسليم - اليوم</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
						<div className="p-3 border rounded-lg">
							<div className="font-medium">المسار الصباحي</div>
							<div className="text-sm text-muted-foreground">8:00 ص - 11:00 ص</div>
							<div className="mt-2 text-sm">3 عمليات تسليم مجدولة</div>
						</div>
						<div className="p-3 border rounded-lg">
							<div className="font-medium">المسار الظهيرة</div>
							<div className="text-sm text-muted-foreground">1:00 م - 4:00 م</div>
							<div className="mt-2 text-sm">5 عمليات تسليم مجدولة</div>
						</div>
						<div className="p-3 border rounded-lg">
							<div className="font-medium">المسار المسائي</div>
							<div className="text-sm text-muted-foreground">5:00 م - 7:00 م</div>
							<div className="mt-2 text-sm">2 عمليات تسليم مجدولة</div>
						</div>
					</div>
				</CardContent>
			</Card>
		</MainLayout>
	);
};

export default Dashboard;
