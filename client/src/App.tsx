import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { isAuthenticated, getAuthUser } from "./lib/auth";
import Navigation from "./components/Navigation";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import MovieDetail from "./pages/MovieDetail";
import Dashboard from "./pages/Dashboard";
import AdminPanel from "./pages/AdminPanel";
import ComingSoon from "./pages/ComingSoon";
import Cinemas from "./pages/Cinemas";
import Promotions from "./pages/Promotions";
import NotFound from "./pages/not-found";

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const authenticated = isAuthenticated();
  
  if (!authenticated) {
    return <Login />;
  }
  
  return <>{children}</>;
}

function RoleProtectedRoute({ children, allowedRoles }: { children: React.ReactNode; allowedRoles: string[] }) {
  const user = getAuthUser();
  const authenticated = isAuthenticated();
  
  if (!authenticated) {
    return <Login />;
  }
  
  if (!user || !allowedRoles.includes(user.role)) {
    return <NotFound />;
  }
  
  return <>{children}</>;
}

function Router() {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Navigation />
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/login" component={Login} />
        <Route path="/register" component={Register} />
        <Route path="/coming-soon" component={ComingSoon} />
        <Route path="/cinemas" component={Cinemas} />
        <Route path="/promotions" component={Promotions} />
        <Route path="/movie/:id">
          {(params) => <MovieDetail />}
        </Route>
        <Route path="/dashboard">
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        </Route>
        <Route path="/admin">
          <RoleProtectedRoute allowedRoles={["admin"]}>
            <AdminPanel />
          </RoleProtectedRoute>
        </Route>

        <Route component={NotFound} />
      </Switch>
      
      {/* Footer */}
      <footer className="bg-gray-800 py-12 px-4 mt-16">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <i className="fas fa-film text-red-600 text-2xl"></i>
                <h3 className="text-xl font-bold text-red-600">CinemaBook</h3>
              </div>
              <p className="text-gray-400 mb-4">Nền tảng đặt vé xem phim trực tuyến hàng đầu Việt Nam</p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4 text-white">Dịch vụ</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-red-600">Đặt vé online</a></li>
                <li><a href="#" className="hover:text-red-600">Lịch chiếu phim</a></li>
                <li><a href="#" className="hover:text-red-600">Khuyến mãi</a></li>
                <li><a href="#" className="hover:text-red-600">Thẻ thành viên</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4 text-white">Hỗ trợ</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-red-600">Liên hệ</a></li>
                <li><a href="#" className="hover:text-red-600">Câu hỏi thường gặp</a></li>
                <li><a href="#" className="hover:text-red-600">Hướng dẫn đặt vé</a></li>
                <li><a href="#" className="hover:text-red-600">Chính sách bảo mật</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4 text-white">Liên hệ</h4>
              <ul className="space-y-2 text-gray-400">
                <li className="flex items-center"><i className="fas fa-phone mr-2"></i>1900 1234</li>
                <li className="flex items-center"><i className="fas fa-envelope mr-2"></i>support@cinemabook.vn</li>
                <li className="flex items-center"><i className="fas fa-map-marker-alt mr-2"></i>123 Nguyễn Trãi, Hà Nội</li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 CinemaBook. Tất cả quyền được bảo lưu.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
