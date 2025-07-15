import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Film, Search, User, Menu, LogOut } from "lucide-react";
import { isAuthenticated, getAuthUser, logout } from "@/lib/auth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function Navigation() {
  const [location, setLocation] = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const authenticated = isAuthenticated();
  const user = getAuthUser();

  const handleLogout = () => {
    logout();
    setLocation("/");
    // Force page refresh to ensure all components re-render
    window.location.reload();
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 px-4 py-4 navbar-scroll border-b border-gray-800">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-8">
          <Link href="/" className="flex items-center space-x-2">
            <Film className="text-red-600 text-2xl" />
            <h1 className="text-2xl font-bold text-red-600">NaCinema</h1>
          </Link>
          
          <div className="hidden md:flex space-x-6">
            <Link href="/" className="text-white hover:text-red-600 transition-colors">
              Phim đang chiếu
            </Link>
            <Link href="/coming-soon" className="text-gray-400 hover:text-red-600 transition-colors">
              Phim sắp chiếu
            </Link>
            <Link href="/cinemas" className="text-gray-400 hover:text-red-600 transition-colors">
              Rạp chiếu
            </Link>
            <Link href="/promotions" className="text-gray-400 hover:text-red-600 transition-colors">
              Khuyến mãi
            </Link>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="hidden md:flex items-center space-x-3 bg-gray-800 rounded-full px-4 py-2">
            <Search className="text-gray-400" size={20} />
            <Input
              type="text"
              placeholder="Tìm kiếm phim..."
              className="bg-transparent border-none outline-none text-white placeholder-gray-400"
            />
          </div>

          {authenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center space-x-2">
                  <User size={20} />
                  <span>{user?.fullName}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setLocation("/dashboard")}>
                  Tài khoản của tôi
                </DropdownMenuItem>
                {user?.role === "admin" && (
                  <DropdownMenuItem onClick={() => setLocation("/admin")}>
                    Quản trị hệ thống
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut size={16} className="mr-2" />
                  Đăng xuất
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button onClick={() => setLocation("/login")} className="bg-red-600 hover:bg-red-700">
              <User className="mr-2" size={16} />
              Đăng nhập
            </Button>
          )}

          <Button
            variant="ghost"
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <Menu size={24} />
          </Button>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden mt-4 pb-4 border-t border-gray-800">
          <div className="flex flex-col space-y-2 pt-4">
            <Link href="/" className="text-white hover:text-red-600 transition-colors py-2">
              Phim đang chiếu
            </Link>
            <Link href="/coming-soon" className="text-gray-400 hover:text-red-600 transition-colors py-2">
              Phim sắp chiếu
            </Link>
            <Link href="/cinemas" className="text-gray-400 hover:text-red-600 transition-colors py-2">
              Rạp chiếu
            </Link>
            <Link href="/promotions" className="text-gray-400 hover:text-red-600 transition-colors py-2">
              Khuyến mãi
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
