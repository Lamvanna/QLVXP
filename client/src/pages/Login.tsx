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

const loginSchema = z.object({
  email: z.string().email("Email không hợp lệ"),
  password: z.string().min(6, "Mật khẩu phải có ít nhất 6 ký tự"),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function Login() {
  const [, setLocation] = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const { toast } = useToast();

  const form = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const loginMutation = useMutation({
    mutationFn: async (data: LoginForm) => {
      const response = await apiRequest("POST", "/api/auth/login", data);
      return response.json();
    },
    onSuccess: (data) => {
      setAuthToken(data.token);
      setAuthUser(data.user);
      toast({
        title: "Đăng nhập thành công",
        description: `Chào mừng ${data.user.fullName}!`,
      });
      setLocation("/");
    },
    onError: (error: any) => {
      toast({
        title: "Đăng nhập thất bại",
        description: error.message || "Vui lòng kiểm tra lại thông tin đăng nhập",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: LoginForm) => {
    loginMutation.mutate(data);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 px-4">
      <Card className="w-full max-w-md bg-gray-800 border-gray-700">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Film className="text-red-600 text-3xl" />
            <h1 className="text-2xl font-bold text-red-600">NaCinema</h1>
          </div>
          <CardTitle className="text-white">Đăng nhập</CardTitle>
        </CardHeader>
        
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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

              <Button
                type="submit"
                className="w-full bg-red-600 hover:bg-red-700"
                disabled={loginMutation.isPending}
              >
                {loginMutation.isPending ? "Đang đăng nhập..." : "Đăng nhập"}
              </Button>
            </form>
          </Form>

          <div className="mt-6 text-center">
            <p className="text-gray-400">
              Chưa có tài khoản?{" "}
              <Link href="/register" className="text-red-600 hover:text-red-500">
                Đăng ký ngay
              </Link>
            </p>
          </div>

          <div className="mt-4 text-center">
            <p className="text-sm text-gray-500">
              Demo: admin@cinemabook.vn / password
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
