import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useLocation, Link } from "wouter";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { setAuthToken, setAuthUser } from "@/lib/auth";
import { Film, Eye, EyeOff } from "lucide-react";

const registerSchema = z.object({
  username: z.string().min(3, "Tên đăng nhập phải có ít nhất 3 ký tự"),
  email: z.string().email("Email không hợp lệ"),
  password: z.string().min(6, "Mật khẩu phải có ít nhất 6 ký tự"),
  confirmPassword: z.string(),
  fullName: z.string().min(2, "Họ tên phải có ít nhất 2 ký tự"),
  phone: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Mật khẩu xác nhận không khớp",
  path: ["confirmPassword"],
});

type RegisterForm = z.infer<typeof registerSchema>;

export default function Register() {
  const [, setLocation] = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { toast } = useToast();

  const form = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
      fullName: "",
      phone: "",
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (data: RegisterForm) => {
      const { confirmPassword, ...registerData } = data;
      const response = await apiRequest("POST", "/api/auth/register", {
        ...registerData,
        role: "user",
      });
      return response.json();
    },
    onSuccess: (data) => {
      setAuthToken(data.token);
      setAuthUser(data.user);
      toast({
        title: "Đăng ký thành công",
        description: `Chào mừng ${data.user.fullName}!`,
      });
      setLocation("/");
    },
    onError: (error: any) => {
      toast({
        title: "Đăng ký thất bại",
        description: error.message || "Vui lòng kiểm tra lại thông tin đăng ký",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: RegisterForm) => {
    registerMutation.mutate(data);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 px-4 py-8">
      <Card className="w-full max-w-md bg-gray-800 border-gray-700">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Film className="text-red-600 text-3xl" />
            <h1 className="text-2xl font-bold text-red-600">NaCinema</h1>
          </div>
          <CardTitle className="text-white">Đăng ký</CardTitle>
        </CardHeader>
        
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white">Họ tên</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Nhập họ tên đầy đủ"
                        className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white">Tên đăng nhập</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Nhập tên đăng nhập"
                        className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                      />
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
                    <FormLabel className="text-white">Email</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="email"
                        placeholder="Nhập email của bạn"
                        className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white">Số điện thoại</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Nhập số điện thoại (tùy chọn)"
                        className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                      />
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
                    <FormLabel className="text-white">Mật khẩu</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          {...field}
                          type={showPassword ? "text" : "password"}
                          placeholder="Nhập mật khẩu"
                          className="bg-gray-700 border-gray-600 text-white placeholder-gray-400 pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                        >
                          {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white">Xác nhận mật khẩu</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          {...field}
                          type={showConfirmPassword ? "text" : "password"}
                          placeholder="Nhập lại mật khẩu"
                          className="bg-gray-700 border-gray-600 text-white placeholder-gray-400 pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                        >
                          {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className="w-full bg-red-600 hover:bg-red-700"
                disabled={registerMutation.isPending}
              >
                {registerMutation.isPending ? "Đang đăng ký..." : "Đăng ký"}
              </Button>
            </form>
          </Form>

          <div className="mt-6 text-center">
            <p className="text-gray-400">
              Đã có tài khoản?{" "}
              <Link href="/login" className="text-red-600 hover:text-red-500">
                Đăng nhập ngay
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
