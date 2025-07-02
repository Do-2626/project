import React, { useState } from 'react';
import { MainLayout } from '@/components/Layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Users, UserPlus, Search, Pencil, Trash2, Shield } from 'lucide-react';
// Define User type
interface User {
  id: string;
  email: string;
  fullName: string;
  role: 'مستخدم' | 'مشرف' | 'مدير';
  created_at: string;
}

// User service functions
const getUsers = async (): Promise<User[]> => {
  // TODO: Implement actual API call
  return [];
};

const addUser = async (email: string, password: string, fullName: string): Promise<User> => {
  // TODO: Implement actual API call
  throw new Error('Not implemented');
};

const deleteUser = async (userId: string): Promise<void> => {
  // TODO: Implement actual API call
  throw new Error('Not implemented');
};
import { useAuth } from '@/contexts/AuthContext';

// مخطط التحقق من صحة بيانات المستخدم الجديد
const userSchema = z.object({
  email: z.string().email({
    message: 'يرجى إدخال بريد إلكتروني صحيح.',
  }),
  password: z.string().min(6, {
    message: 'يجب أن تتكون كلمة المرور من 6 أحرف على الأقل.',
  }),
  fullName: z.string().min(2, {
    message: 'يجب أن يتكون الاسم من حرفين على الأقل.',
  }),
  role: z.enum(['مستخدم', 'مشرف', 'مدير']).default('مستخدم'),
});

type UserFormValues = z.infer<typeof userSchema>;

const UserManagement = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [isDeleteUserOpen, setIsDeleteUserOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // نموذج إضافة مستخدم جديد
  const form = useForm<UserFormValues>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      email: '',
      password: '',
      fullName: '',
      role: 'مستخدم',
    },
  });

  // استعلام قائمة المستخدمين
  const { data: users = [], isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: getUsers,
  });

  // إضافة مستخدم جديد
  const addUserMutation = useMutation({
    mutationFn: (data: UserFormValues) => addUser(data.email, data.password, data.fullName),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast({
        title: "تم إنشاء المستخدم بنجاح",
        description: "تم إضافة المستخدم الجديد إلى النظام"
      });
      setIsAddUserOpen(false);
      form.reset();
    },
    onError: (error: any) => {
      toast({
        title: "فشل إنشاء المستخدم",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  // حذف مستخدم
  const deleteUserMutation = useMutation({
    mutationFn: (userId: string) => deleteUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast({
        title: "تم حذف المستخدم بنجاح",
      });
      setIsDeleteUserOpen(false);
    },
    onError: (error: any) => {
      toast({
        title: "فشل حذف المستخدم",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  // فتح نافذة إضافة مستخدم جديد
  const openAddUserDialog = () => {
    setIsAddUserOpen(true);
  };

  // إغلاق نافذة إضافة مستخدم جديد
  const closeAddUserDialog = () => {
    setIsAddUserOpen(false);
    form.reset();
  };

  // فتح نافذة حذف مستخدم
  const openDeleteUserDialog = (user: User) => {
    setSelectedUser(user);
    setIsDeleteUserOpen(true);
  };

  // إغلاق نافذة حذف مستخدم
  const closeDeleteUserDialog = () => {
    setIsDeleteUserOpen(false);
    setSelectedUser(null);
  };

  // إضافة مستخدم جديد
  const handleAddUser = (data: UserFormValues) => {
    addUserMutation.mutate(data);
  };

  // حذف مستخدم
  const handleDeleteUser = () => {
    if (selectedUser) {
      deleteUserMutation.mutate(selectedUser.id);
    }
  };

  // تحديث حقل البحث
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  // تصفية المستخدمين حسب البحث
  const filteredUsers = users.filter(user =>
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <MainLayout title="إدارة المستخدمين">
      <div className="flex flex-col md:flex-row justify-between mb-6 gap-4">
        <div className="relative w-full md:w-64">
          <Search className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <Input
            placeholder="البحث عن المستخدمين..."
            className="pr-8"
            value={searchTerm}
            onChange={handleSearchChange}
          />
        </div>
        <Button
          size="sm"
          className="flex items-center gap-1"
          onClick={openAddUserDialog}
        >
          <UserPlus size={16} />
          إنشاء مستخدم جديد
        </Button>
      </div>

      <Card className="paper-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users size={18} />
            قائمة المستخدمين
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center p-8">جاري تحميل البيانات...</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-right">اسم المستخدم</TableHead>
                    <TableHead className="text-right">البريد الإلكتروني</TableHead>
                    <TableHead className="text-right">الصلاحية</TableHead>
                    <TableHead className="text-right">تاريخ الإنشاء</TableHead>
                    <TableHead className="text-right">الإجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-6 text-gray-500">
                        لا يوجد مستخدمين مطابقين للبحث
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            user.role === 'مدير' ? 'bg-blue-100 text-blue-800' :
                            user.role === 'مشرف' ? 'bg-green-100 text-green-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {user.role}
                          </span>
                        </TableCell>
                        <TableCell>{new Date(user.created_at).toLocaleDateString('ar-EG')}</TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button variant="outline" size="sm" className="flex items-center">
                              <Shield size={14} className="ml-1" />
                              الصلاحيات
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="flex items-center text-red-600 hover:text-red-700"
                              onClick={() => openDeleteUserDialog(user)}
                            >
                              <Trash2 size={14} className="ml-1" />
                              حذف
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* نافذة إضافة مستخدم جديد */}
      <Dialog open={isAddUserOpen} onOpenChange={closeAddUserDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>إنشاء مستخدم جديد</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleAddUser)} className="space-y-4">
              <FormField
                control={form.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>الاسم الكامل</FormLabel>
                    <FormControl>
                      <Input placeholder="أدخل الاسم الكامل" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>البريد الإلكتروني</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="example@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>كلمة المرور</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="******" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>الصلاحية</FormLabel>
                    <FormControl>
                      <select
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        {...field}
                      >
                        <option value="مستخدم">مستخدم</option>
                        <option value="مشرف">مشرف</option>
                        <option value="مدير">مدير</option>
                      </select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter className="mt-6">
                <Button type="button" variant="outline" onClick={closeAddUserDialog}>
                  إلغاء
                </Button>
                <Button type="submit" disabled={addUserMutation.isPending}>
                  {addUserMutation.isPending ? 'جاري الإنشاء...' : 'إنشاء المستخدم'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* نافذة حذف مستخدم */}
      <Dialog open={isDeleteUserOpen} onOpenChange={closeDeleteUserDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>حذف المستخدم</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-center mb-4">هل أنت متأكد من رغبتك في حذف المستخدم التالي؟</p>
            {selectedUser && (
              <div className="p-4 bg-gray-50 rounded-md text-center">
                <p className="font-semibold">{selectedUser.email}</p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={closeDeleteUserDialog}>
              إلغاء
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDeleteUser}
              disabled={deleteUserMutation.isPending}
            >
              {deleteUserMutation.isPending ? 'جاري الحذف...' : 'تأكيد الحذف'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
};

export default UserManagement;