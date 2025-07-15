import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { MovieWithDetails } from "@/lib/types";
import { Plus, Edit, Trash2, Users, Calendar, BarChart3, Film, Building, Ticket, DollarSign, Star, TrendingUp, Phone, MapPin, Clock, Eye, X } from "lucide-react";

const movieSchema = z.object({
  title: z.string().min(1, "Tên phim là bắt buộc"),
  description: z.string().min(1, "Mô tả là bắt buộc"),
  genre: z.string().min(1, "Thể loại là bắt buộc"),
  duration: z.number().min(1, "Thời lượng phải lớn hơn 0"),
  ageRating: z.string().min(1, "Giới hạn tuổi là bắt buộc"),
  posterUrl: z.string().optional(),
  trailerUrl: z.string().optional(),
  director: z.string().optional(),
  actors: z.string().optional(),
  status: z.string().default("active"),
});

const cinemaSchema = z.object({
  name: z.string().min(1, "Tên rạp là bắt buộc"),
  address: z.string().min(1, "Địa chỉ là bắt buộc"),
  phone: z.string().optional(),
});

type MovieForm = z.infer<typeof movieSchema>;
type CinemaForm = z.infer<typeof cinemaSchema>;

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState("statistics");
  const [isMovieDialogOpen, setIsMovieDialogOpen] = useState(false);
  const [isCinemaDialogOpen, setIsCinemaDialogOpen] = useState(false);
  const [isUserDialogOpen, setIsUserDialogOpen] = useState(false);
  const [isShowtimeDialogOpen, setIsShowtimeDialogOpen] = useState(false);
  const [editingMovie, setEditingMovie] = useState<MovieWithDetails | null>(null);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [editingShowtime, setEditingShowtime] = useState<any>(null);
  const [editingCinema, setEditingCinema] = useState<any>(null);
  const { toast } = useToast();

  const { data: movies, isLoading: moviesLoading } = useQuery<MovieWithDetails[]>({
    queryKey: ["/api/movies"],
  });

  const { data: cinemas, isLoading: cinemasLoading } = useQuery({
    queryKey: ["/api/cinemas"],
  });

  const [selectedCinema, setSelectedCinema] = useState<number | null>(null);
  const [isEditingShowtime, setIsEditingShowtime] = useState(false);

  const { data: rooms } = useQuery({
    queryKey: ["/api/rooms"],
  });

  const filteredRooms = rooms?.filter((room: any) => room.cinemaId === selectedCinema) || [];

  const { data: tickets, refetch: refetchTickets, error: ticketsError } = useQuery({
    queryKey: ["/api/admin/all-tickets"],
    retry: 1,
  });

  const { data: promotions } = useQuery({
    queryKey: ["/api/promotions"],
  });

  const { data: reviews } = useQuery({
    queryKey: ["/api/reviews"],
  });

  const { data: showtimes } = useQuery({
    queryKey: ["/api/showtimes"],
  });

  const { data: users, isLoading: usersLoading } = useQuery({
    queryKey: ["/api/admin/users"],
  });

  const movieForm = useForm<MovieForm>({
    resolver: zodResolver(movieSchema),
    defaultValues: {
      title: "",
      description: "",
      genre: "",
      duration: 0,
      ageRating: "",
      posterUrl: "",
      trailerUrl: "",
      director: "",
      actors: "",
      status: "active",
    },
  });

  const cinemaForm = useForm<CinemaForm>({
    resolver: zodResolver(cinemaSchema),
    defaultValues: {
      name: "",
      address: "",
      phone: "",
    },
  });

  const createMovieMutation = useMutation({
    mutationFn: async (data: MovieForm) => {
      console.log('Form data:', data);
      const movieData = {
        ...data,
        actors: data.actors ? data.actors.split(",").map(actor => actor.trim()) : [],
        releaseDate: new Date().toISOString(),
      };
      console.log('Processed movie data:', movieData);
      const response = await apiRequest("POST", "/api/movies", movieData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/movies"] });
      setIsMovieDialogOpen(false);
      movieForm.reset();
      toast({
        title: "Thành công",
        description: "Phim đã được thêm thành công",
      });
    },
    onError: (error: any) => {
      console.error('Create movie error:', error);
      toast({
        title: "Lỗi",
        description: error.message || "Không thể thêm phim",
        variant: "destructive",
      });
    },
  });

  const updateMovieMutation = useMutation({
    mutationFn: async (data: MovieForm & { id: number }) => {
      const { id, ...updateData } = data;
      const movieData = {
        ...updateData,
        actors: updateData.actors ? updateData.actors.split(",").map(actor => actor.trim()) : [],
      };
      const response = await apiRequest("PUT", `/api/movies/${id}`, movieData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/movies"] });
      setIsMovieDialogOpen(false);
      setEditingMovie(null);
      movieForm.reset();
      toast({
        title: "Thành công",
        description: "Phim đã được cập nhật thành công",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Lỗi",
        description: error.message || "Không thể cập nhật phim",
        variant: "destructive",
      });
    },
  });

  const deleteMovieMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/movies/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/movies"] });
      toast({
        title: "Thành công",
        description: "Phim đã được xóa thành công",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Lỗi",
        description: error.message || "Không thể xóa phim",
        variant: "destructive",
      });
    },
  });

  const createCinemaMutation = useMutation({
    mutationFn: async (data: CinemaForm) => {
      const response = await apiRequest("POST", "/api/cinemas", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cinemas"] });
      setIsCinemaDialogOpen(false);
      cinemaForm.reset();
      setEditingCinema(null);
      toast({
        title: "Thành công",
        description: "Rạp chiếu đã được thêm thành công",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Lỗi",
        description: error.message || "Không thể thêm rạp chiếu",
        variant: "destructive",
      });
    },
  });

  const updateCinemaMutation = useMutation({
    mutationFn: async (data: { id: number } & CinemaForm) => {
      const response = await apiRequest("PUT", `/api/cinemas/${data.id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cinemas"] });
      setIsCinemaDialogOpen(false);
      cinemaForm.reset();
      setEditingCinema(null);
      toast({
        title: "Thành công",
        description: "Cập nhật rạp chiếu thành công",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Lỗi",
        description: error.message || "Không thể cập nhật rạp chiếu",
        variant: "destructive",
      });
    },
  });

  const deleteCinemaMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest("DELETE", `/api/cinemas/${id}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cinemas"] });
      toast({
        title: "Thành công",
        description: "Xóa rạp chiếu thành công",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Lỗi",
        description: error.message || "Không thể xóa rạp chiếu",
        variant: "destructive",
      });
    },
  });

  const updateUserMutation = useMutation({
    mutationFn: async (data: { id: number; role: string }) => {
      const response = await apiRequest("PUT", `/api/admin/users/${data.id}`, { role: data.role });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      setIsUserDialogOpen(false);
      setEditingUser(null);
      toast({
        title: "Thành công",
        description: "Cập nhật người dùng thành công",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Lỗi",
        description: error.message || "Không thể cập nhật người dùng",
        variant: "destructive",
      });
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest("DELETE", `/api/admin/users/${id}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({
        title: "Thành công",
        description: "Xóa người dùng thành công",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Lỗi",
        description: error.message || "Không thể xóa người dùng",
        variant: "destructive",
      });
    },
  });

  const createShowtimeMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/showtimes", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/showtimes"] });
      setIsShowtimeDialogOpen(false);
      toast({
        title: "Thành công",
        description: "Thêm suất chiếu thành công",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Lỗi",
        description: error.message || "Không thể thêm suất chiếu",
        variant: "destructive",
      });
    },
  });

  const updateShowtimeMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("PUT", `/api/showtimes/${data.id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/showtimes"] });
      setIsShowtimeDialogOpen(false);
      setIsEditingShowtime(false);
      toast({
        title: "Thành công",
        description: "Cập nhật suất chiếu thành công",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Lỗi",
        description: error.message || "Không thể cập nhật suất chiếu",
        variant: "destructive",
      });
    },
  });

  const deleteShowtimeMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest("DELETE", `/api/showtimes/${id}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/showtimes"] });
      toast({
        title: "Thành công",
        description: "Xóa suất chiếu thành công",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Lỗi",
        description: error.message || "Không thể xóa suất chiếu",
        variant: "destructive",
      });
    },
  });

  const handleEditMovie = (movie: MovieWithDetails) => {
    setEditingMovie(movie);
    movieForm.reset({
      title: movie.title,
      description: movie.description,
      genre: movie.genre,
      duration: movie.duration,
      ageRating: movie.ageRating,
      posterUrl: movie.posterUrl || "",
      trailerUrl: movie.trailerUrl || "",
      director: movie.director || "",
      actors: movie.actors?.join(", ") || "",
      status: movie.status,
    });
    setIsMovieDialogOpen(true);
  };

  const handleEditCinema = (cinema: any) => {
    setEditingCinema(cinema);
    cinemaForm.reset({
      name: cinema.name,
      address: cinema.address,
      phone: cinema.phone || "",
    });
    setIsCinemaDialogOpen(true);
  };

  const handleDeleteCinema = (id: number) => {
    if (confirm("Bạn có chắc chắn muốn xóa rạp chiếu này?")) {
      deleteCinemaMutation.mutate(id);
    }
  };

  const handleDeleteMovie = (id: number) => {
    if (confirm("Bạn có chắc chắn muốn xóa phim này?")) {
      deleteMovieMutation.mutate(id);
    }
  };

  const handleEditShowtime = (showtime: any) => {
    const room = rooms?.find(r => r.id === showtime.roomId);
    setSelectedCinema(room?.cinemaId || null);
    setEditingShowtime({
      ...showtime,
      startTime: new Date(showtime.startTime).toISOString().slice(0, 16),
      endTime: new Date(showtime.endTime).toISOString().slice(0, 16)
    });
    setIsEditingShowtime(true);
    setIsShowtimeDialogOpen(true);
  };

  const handleDeleteShowtime = (id: number) => {
    if (confirm("Bạn có chắc chắn muốn xóa suất chiếu này?")) {
      deleteShowtimeMutation.mutate(id);
    }
  };

  const onSubmitMovie = (data: MovieForm) => {
    if (editingMovie) {
      updateMovieMutation.mutate({ ...data, id: editingMovie.id });
    } else {
      createMovieMutation.mutate(data);
    }
  };

  const onSubmitCinema = (data: CinemaForm) => {
    if (editingCinema) {
      updateCinemaMutation.mutate({ ...data, id: editingCinema.id });
    } else {
      createCinemaMutation.mutate(data);
    }
  };

  const handleEditUser = (user: any) => {
    setEditingUser(user);
    setIsUserDialogOpen(true);
  };

  const handleDeleteUser = (id: number) => {
    if (confirm("Bạn có chắc chắn muốn xóa người dùng này?")) {
      deleteUserMutation.mutate(id);
    }
  };

  const handleUpdateUserRole = (newRole: string) => {
    if (editingUser) {
      updateUserMutation.mutate({ id: editingUser.id, role: newRole });
    }
  };

  // Calculate statistics
  const calculateStats = () => {
    const totalMovies = movies?.length || 0;
    const totalCinemas = cinemas?.length || 0;
    const totalTickets = tickets?.length || 0;
    const totalRevenue = tickets?.reduce((sum: number, ticket: any) => 
      sum + parseFloat(ticket.totalPrice || "0"), 0) || 0;
    const totalReviews = reviews?.length || 0;
    const avgRating = reviews?.length ? 
      (reviews.reduce((sum: number, review: any) => sum + review.rating, 0) / reviews.length).toFixed(1) : "0";

    return {
      totalMovies,
      totalCinemas,
      totalTickets,
      totalRevenue,
      totalReviews,
      avgRating
    };
  };

  const stats = calculateStats();

  return (
    <div className="pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4">
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white text-2xl">Quản trị hệ thống</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-6 bg-gray-700">
                <TabsTrigger value="statistics" className="text-white">Thống kê</TabsTrigger>
                <TabsTrigger value="movies" className="text-white">Quản lý phim</TabsTrigger>
                <TabsTrigger value="cinemas" className="text-white">Quản lý rạp</TabsTrigger>
                <TabsTrigger value="showtimes" className="text-white">Suất chiếu</TabsTrigger>
                <TabsTrigger value="tickets" className="text-white">Quản lý vé</TabsTrigger>
                <TabsTrigger value="users" className="text-white">Người dùng</TabsTrigger>
              </TabsList>

              <TabsContent value="statistics" className="mt-6">
                <div className="space-y-6">
                  <h3 className="text-xl font-semibold text-white mb-6">Thống kê hệ thống</h3>
                  
                  {/* Statistics Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card className="bg-gray-800 border-gray-700">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-gray-400 text-sm">Tổng số phim</p>
                            <p className="text-2xl font-bold text-white">{stats.totalMovies}</p>
                          </div>
                          <div className="bg-blue-600 p-3 rounded-full">
                            <Film className="w-6 h-6 text-white" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-gray-800 border-gray-700">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-gray-400 text-sm">Tổng số rạp</p>
                            <p className="text-2xl font-bold text-white">{stats.totalCinemas}</p>
                          </div>
                          <div className="bg-green-600 p-3 rounded-full">
                            <Building className="w-6 h-6 text-white" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-gray-800 border-gray-700">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-gray-400 text-sm">Vé đã bán</p>
                            <p className="text-2xl font-bold text-white">{stats.totalTickets}</p>
                          </div>
                          <div className="bg-yellow-600 p-3 rounded-full">
                            <Ticket className="w-6 h-6 text-white" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-gray-800 border-gray-700">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-gray-400 text-sm">Doanh thu</p>
                            <p className="text-2xl font-bold text-white">
                              {new Intl.NumberFormat('vi-VN', {
                                style: 'currency',
                                currency: 'VND'
                              }).format(stats.totalRevenue)}
                            </p>
                          </div>
                          <div className="bg-red-600 p-3 rounded-full">
                            <DollarSign className="w-6 h-6 text-white" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-gray-800 border-gray-700">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-gray-400 text-sm">Đánh giá</p>
                            <p className="text-2xl font-bold text-white">{stats.totalReviews}</p>
                          </div>
                          <div className="bg-purple-600 p-3 rounded-full">
                            <Star className="w-6 h-6 text-white" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-gray-800 border-gray-700">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-gray-400 text-sm">Điểm trung bình</p>
                            <p className="text-2xl font-bold text-white">{stats.avgRating}/5</p>
                          </div>
                          <div className="bg-orange-600 p-3 rounded-full">
                            <TrendingUp className="w-6 h-6 text-white" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Recent Activities */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card className="bg-gray-800 border-gray-700">
                      <CardHeader>
                        <CardTitle className="text-white">Phim mới nhất</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {movies?.slice(0, 5).map((movie) => (
                            <div key={movie.id} className="flex items-center justify-between">
                              <div>
                                <p className="text-white font-medium">{movie.title}</p>
                                <p className="text-gray-400 text-sm">{movie.genre}</p>
                              </div>
                              <Badge variant={movie.status === 'active' ? 'default' : 'secondary'}>
                                {movie.status === 'active' ? 'Đang chiếu' : 'Sắp chiếu'}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-gray-800 border-gray-700">
                      <CardHeader>
                        <CardTitle className="text-white">Khuyến mãi đang hoạt động</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {promotions?.filter((promo: any) => promo.status === 'active').slice(0, 5).map((promo: any) => (
                            <div key={promo.id} className="flex items-center justify-between">
                              <div>
                                <p className="text-white font-medium">{promo.title}</p>
                                <p className="text-gray-400 text-sm">{promo.description}</p>
                              </div>
                              <Badge className="bg-green-600">
                                -{promo.discountValue}{promo.discountType === 'percentage' ? '%' : 'đ'}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="movies" className="mt-6">
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                      <h3 className="text-xl font-semibold text-white">Quản lý phim</h3>
                      <Dialog open={isMovieDialogOpen} onOpenChange={setIsMovieDialogOpen}>
                        <DialogTrigger asChild>
                          <Button className="bg-red-600 hover:bg-red-700">
                            <Plus className="mr-2" size={16} />
                            Thêm phim mới
                          </Button>
                        </DialogTrigger>
                      <DialogContent className="max-w-2xl bg-gray-800 border-gray-700">
                        <DialogHeader>
                          <DialogTitle className="text-white">
                            {editingMovie ? "Chỉnh sửa phim" : "Thêm phim mới"}
                          </DialogTitle>
                        </DialogHeader>
                        <Form {...movieForm}>
                          <form onSubmit={movieForm.handleSubmit(onSubmitMovie)} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <FormField
                                control={movieForm.control}
                                name="title"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel className="text-white">Tên phim</FormLabel>
                                    <FormControl>
                                      <Input {...field} className="bg-gray-700 border-gray-600 text-white" />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={movieForm.control}
                                name="genre"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel className="text-white">Thể loại</FormLabel>
                                    <FormControl>
                                      <Select value={field.value} onValueChange={field.onChange}>
                                        <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                                          <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="Hành động">Hành động</SelectItem>
                                          <SelectItem value="Tâm lý">Tâm lý</SelectItem>
                                          <SelectItem value="Kinh dị">Kinh dị</SelectItem>
                                          <SelectItem value="Hài">Hài</SelectItem>
                                          <SelectItem value="Tình cảm">Tình cảm</SelectItem>
                                          <SelectItem value="Khoa học viễn tưởng">Khoa học viễn tưởng</SelectItem>
                                        </SelectContent>
                                      </Select>
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>
                            <FormField
                              control={movieForm.control}
                              name="description"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-white">Mô tả</FormLabel>
                                  <FormControl>
                                    <Textarea {...field} className="bg-gray-700 border-gray-600 text-white" />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <div className="grid grid-cols-2 gap-4">
                              <FormField
                                control={movieForm.control}
                                name="duration"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel className="text-white">Thời lượng (phút)</FormLabel>
                                    <FormControl>
                                      <Input 
                                        {...field} 
                                        type="number" 
                                        value={field.value || ""}
                                        onChange={(e) => {
                                          const value = e.target.value;
                                          field.onChange(value === "" ? 0 : parseInt(value) || 0);
                                        }}
                                        className="bg-gray-700 border-gray-600 text-white" 
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={movieForm.control}
                                name="ageRating"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel className="text-white">Giới hạn tuổi</FormLabel>
                                    <FormControl>
                                      <Select value={field.value} onValueChange={field.onChange}>
                                        <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                                          <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="K">K</SelectItem>
                                          <SelectItem value="13+">13+</SelectItem>
                                          <SelectItem value="16+">16+</SelectItem>
                                          <SelectItem value="18+">18+</SelectItem>
                                        </SelectContent>
                                      </Select>
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <FormField
                                control={movieForm.control}
                                name="posterUrl"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel className="text-white">Poster phim</FormLabel>
                                    <FormControl>
                                      <div className="space-y-2">
                                        <Input 
                                          type="file" 
                                          accept="image/*"
                                          onChange={(e) => {
                                            const file = e.target.files?.[0];
                                            if (file) {
                                              if (file.size > 500 * 1024) { // 500KB limit
                                                toast({
                                                  title: "Lỗi",
                                                  description: "File hình ảnh quá lớn (>500KB). Vui lòng chọn file nhỏ hơn.",
                                                  variant: "destructive",
                                                });
                                                return;
                                              }
                                              // Resize image if needed
                                              const canvas = document.createElement('canvas');
                                              const ctx = canvas.getContext('2d');
                                              const img = new Image();
                                              
                                              img.onload = () => {
                                                // Calculate new dimensions (max 400x600)
                                                const maxWidth = 400;
                                                const maxHeight = 600;
                                                let { width, height } = img;
                                                
                                                if (width > maxWidth) {
                                                  height = (height * maxWidth) / width;
                                                  width = maxWidth;
                                                }
                                                if (height > maxHeight) {
                                                  width = (width * maxHeight) / height;
                                                  height = maxHeight;
                                                }
                                                
                                                canvas.width = width;
                                                canvas.height = height;
                                                ctx?.drawImage(img, 0, 0, width, height);
                                                
                                                // Convert to base64 with compression
                                                const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.8);
                                                field.onChange(compressedDataUrl);
                                              };
                                              
                                              const reader = new FileReader();
                                              reader.onload = (e) => {
                                                img.src = e.target?.result as string;
                                              };
                                              reader.readAsDataURL(file);
                                            }
                                          }}
                                          className="bg-gray-700 border-gray-600 text-white file:bg-gray-600 file:text-white file:border-none file:rounded" 
                                        />
                                        <Input 
                                          {...field} 
                                          placeholder="Hoặc nhập URL hình ảnh"
                                          className="bg-gray-700 border-gray-600 text-white" 
                                        />
                                      </div>
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={movieForm.control}
                                name="trailerUrl"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel className="text-white">URL Trailer</FormLabel>
                                    <FormControl>
                                      <Input {...field} className="bg-gray-700 border-gray-600 text-white" />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <FormField
                                control={movieForm.control}
                                name="director"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel className="text-white">Đạo diễn</FormLabel>
                                    <FormControl>
                                      <Input {...field} className="bg-gray-700 border-gray-600 text-white" />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={movieForm.control}
                                name="actors"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel className="text-white">Diễn viên (cách nhau bằng dấu phẩy)</FormLabel>
                                    <FormControl>
                                      <Input {...field} className="bg-gray-700 border-gray-600 text-white" />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>
                            <div className="flex space-x-4">
                              <Button 
                                type="submit" 
                                className="bg-red-600 hover:bg-red-700"
                                disabled={createMovieMutation.isPending || updateMovieMutation.isPending}
                              >
                                {editingMovie ? "Cập nhật" : "Thêm phim"}
                              </Button>
                              <Button 
                                type="button" 
                                variant="outline" 
                                onClick={() => {
                                  setIsMovieDialogOpen(false);
                                  setEditingMovie(null);
                                  movieForm.reset();
                                }}
                                className="border-gray-600 text-gray-300"
                              >
                                Hủy
                              </Button>
                            </div>
                          </form>
                        </Form>
                      </DialogContent>
                    </Dialog>
                  </div>

                  <div className="space-y-4">
                    {moviesLoading ? (
                      Array.from({ length: 3 }).map((_, index) => (
                        <Card key={index} className="bg-gray-800 border-gray-700">
                          <CardContent className="p-6">
                            <div className="flex items-center space-x-4">
                              <Skeleton className="w-16 h-20 rounded" />
                              <div className="flex-1 space-y-2">
                                <Skeleton className="h-5 w-3/4" />
                                <Skeleton className="h-4 w-1/2" />
                                <Skeleton className="h-4 w-1/4" />
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    ) : (
                      movies?.map((movie) => (
                        <Card key={movie.id} className="bg-gray-800 border-gray-700 hover:bg-gray-750 transition-colors">
                          <CardContent className="p-6">
                            <div className="flex flex-col lg:flex-row items-start gap-4">
                              <div className="flex items-center space-x-4 flex-1">
                                <img
                                  src={movie.posterUrl || "/placeholder-movie.jpg"}
                                  alt={movie.title}
                                  className="w-16 h-20 object-cover rounded flex-shrink-0"
                                />
                                <div className="flex-1 min-w-0">
                                  <h4 className="font-semibold text-white text-lg truncate">{movie.title}</h4>
                                  <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-400">
                                    <span>Thể loại: {movie.genre}</span>
                                    <span>Thời lượng: {movie.duration} phút</span>
                                    <span>Giới hạn: {movie.ageRating}</span>
                                    <span>Năm: {movie.releaseDate ? new Date(movie.releaseDate).getFullYear() : "2024"}</span>
                                  </div>
                                  <p className="text-gray-400 text-sm mt-2 line-clamp-2">{movie.description}</p>
                                </div>
                              </div>
                              <div className="flex flex-col lg:flex-row items-start lg:items-center gap-3 lg:gap-4">
                                <Badge className={movie.status === "active" ? "bg-green-600" : "bg-red-600"}>
                                  {movie.status === "active" ? "Đang chiếu" : "Ngừng chiếu"}
                                </Badge>
                                <div className="flex space-x-2">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleEditMovie(movie)}
                                    className="border-gray-600 text-blue-400 hover:bg-blue-600 hover:text-white"
                                  >
                                    <Edit size={16} />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleDeleteMovie(movie.id)}
                                    className="border-gray-600 text-red-400 hover:bg-red-600 hover:text-white"
                                  >
                                    <Trash2 size={16} />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    )}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="cinemas" className="mt-6">
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <h3 className="text-xl font-semibold text-white">Quản lý rạp chiếu</h3>
                    <Dialog open={isCinemaDialogOpen} onOpenChange={setIsCinemaDialogOpen}>
                        <DialogTrigger asChild>
                          <Button className="bg-red-600 hover:bg-red-700 w-full sm:w-auto">
                            <Plus className="mr-2" size={16} />
                            Thêm rạp mới
                          </Button>
                        </DialogTrigger>
                      <DialogContent className="bg-gray-800 border-gray-700">
                        <DialogHeader>
                          <DialogTitle className="text-white">
                            {editingCinema ? "Chỉnh sửa rạp chiếu" : "Thêm rạp chiếu mới"}
                          </DialogTitle>
                        </DialogHeader>
                        <Form {...cinemaForm}>
                          <form onSubmit={cinemaForm.handleSubmit(onSubmitCinema)} className="space-y-4">
                            <FormField
                              control={cinemaForm.control}
                              name="name"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-white">Tên rạp</FormLabel>
                                  <FormControl>
                                    <Input {...field} className="bg-gray-700 border-gray-600 text-white" />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={cinemaForm.control}
                              name="address"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-white">Địa chỉ</FormLabel>
                                  <FormControl>
                                    <Input {...field} className="bg-gray-700 border-gray-600 text-white" />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={cinemaForm.control}
                              name="phone"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-white">Số điện thoại</FormLabel>
                                  <FormControl>
                                    <Input {...field} className="bg-gray-700 border-gray-600 text-white" />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <div className="flex space-x-4">
                              <Button 
                                type="submit" 
                                className="bg-red-600 hover:bg-red-700"
                                disabled={createCinemaMutation.isPending || updateCinemaMutation.isPending}
                              >
                                {editingCinema ? "Cập nhật" : "Thêm rạp"}
                              </Button>
                              <Button 
                                type="button" 
                                variant="outline" 
                                onClick={() => {
                                  setIsCinemaDialogOpen(false);
                                  cinemaForm.reset();
                                  setEditingCinema(null);
                                }}
                                className="border-gray-600 text-gray-300"
                              >
                                Hủy
                              </Button>
                            </div>
                          </form>
                        </Form>
                      </DialogContent>
                    </Dialog>
                  </div>

                  <div className="space-y-4">
                    {cinemasLoading ? (
                      Array.from({ length: 3 }).map((_, index) => (
                        <Card key={index} className="bg-gray-800 border-gray-700">
                          <CardContent className="p-6">
                            <div className="space-y-2">
                              <Skeleton className="h-5 w-3/4" />
                              <Skeleton className="h-4 w-full" />
                              <Skeleton className="h-4 w-1/2" />
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    ) : (
                      cinemas?.map((cinema: any) => (
                        <Card key={cinema.id} className="bg-gray-800 border-gray-700 hover:bg-gray-750 transition-colors">
                          <CardContent className="p-6">
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                              <div className="flex-1">
                                <h4 className="text-white font-semibold text-lg">{cinema.name}</h4>
                                <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 mt-2 text-sm text-gray-400">
                                  <span><Building className="inline w-4 h-4 mr-1" />Địa chỉ: {cinema.address}</span>
                                  <span><Phone className="inline w-4 h-4 mr-1" />SĐT: {cinema.phone || "Chưa cập nhật"}</span>
                                </div>
                              </div>
                              <div className="flex space-x-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleEditCinema(cinema)}
                                  className="border-gray-600 text-blue-400 hover:bg-blue-600 hover:text-white"
                                >
                                  <Edit size={16} />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleDeleteCinema(cinema.id)}
                                  className="border-gray-600 text-red-400 hover:bg-red-600 hover:text-white"
                                >
                                  <Trash2 size={16} />
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    )}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="users" className="mt-6">
                <Card className="bg-gray-900 border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center">
                      <Users className="mr-2" />
                      Quản lý người dùng
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {usersLoading ? (
                        Array.from({ length: 3 }).map((_, index) => (
                          <Card key={index} className="bg-gray-800 border-gray-700">
                            <CardContent className="p-4">
                              <div className="flex items-center space-x-4">
                                <Skeleton className="w-10 h-10 rounded-full" />
                                <div className="flex-1 space-y-2">
                                  <Skeleton className="h-4 w-3/4" />
                                  <Skeleton className="h-3 w-1/2" />
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))
                      ) : users?.length > 0 ? (
                        users.map((user: any) => (
                          <Card key={user.id} className="bg-gray-800 border-gray-700">
                            <CardContent className="p-4">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-4">
                                  <div className="w-10 h-10 bg-gray-600 rounded-full flex items-center justify-center">
                                    <Users className="w-5 h-5 text-white" />
                                  </div>
                                  <div>
                                    <h4 className="text-white font-medium">{user.fullName}</h4>
                                    <p className="text-gray-400 text-sm">{user.email}</p>
                                    <p className="text-gray-500 text-xs">@{user.username}</p>
                                  </div>
                                </div>
                                <div className="flex items-center space-x-3">
                                  <Badge className={
                                    user.role === 'admin' ? 'bg-red-600' : 
                                    user.role === 'staff' ? 'bg-blue-600' : 
                                    'bg-green-600'
                                  }>
                                    {user.role === 'admin' ? 'Admin' : 
                                     user.role === 'staff' ? 'Staff' : 
                                     'User'}
                                  </Badge>
                                  <div className="flex space-x-2">
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => handleEditUser(user)}
                                      className="border-gray-600 text-blue-400 hover:bg-blue-600 hover:text-white"
                                    >
                                      <Edit size={16} />
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => handleDeleteUser(user.id)}
                                      className="border-gray-600 text-red-400 hover:bg-red-600 hover:text-white"
                                    >
                                      <Trash2 size={16} />
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))
                      ) : (
                        <div className="text-center py-8 text-gray-400">
                          <Users size={48} className="mx-auto mb-4 text-gray-600" />
                          <p>Chưa có người dùng nào trong hệ thống</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="showtimes" className="mt-6">
                <Card className="bg-gray-900 border-gray-700">
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="text-white flex items-center">
                      <Calendar className="mr-2" />
                      Quản lý suất chiếu
                    </CardTitle>
                    <Button 
                      onClick={() => setIsShowtimeDialogOpen(true)}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      <Plus className="mr-2" size={16} />
                      Thêm suất chiếu
                    </Button>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {showtimes && showtimes.length > 0 ? (
                        showtimes.map((showtime: any) => (
                          <Card key={showtime.id} className="bg-gray-800 border-gray-700">
                            <CardContent className="p-4">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-4">
                                  <div className="bg-gray-700 p-2 rounded-full">
                                    <Calendar className="w-5 h-5 text-gray-300" />
                                  </div>
                                  <div>
                                    <p className="font-medium text-white">
                                      {movies?.find(m => m.id === showtime.movieId)?.title || 'Phim không xác định'}
                                    </p>
                                    <p className="text-sm text-gray-400">
                                      {new Date(showtime.startTime).toLocaleString('vi-VN')} - 
                                      {new Date(showtime.endTime).toLocaleString('vi-VN')}
                                    </p>
                                    <p className="text-sm text-gray-400">
                                      Rạp: {rooms?.find(r => r.id === showtime.roomId)?.cinema?.name || 'Chưa xác định'}
                                    </p>
                                    <p className="text-sm text-gray-400">
                                      Phòng: {rooms?.find(r => r.id === showtime.roomId)?.name || 'Chưa xác định'}
                                    </p>
                                    <p className="text-sm text-gray-400">
                                      Giá: {new Intl.NumberFormat('vi-VN').format(parseInt(showtime.price))}đ
                                    </p>
                                  </div>
                                </div>
                                <div className="flex items-center space-x-3">
                                  <div className="flex flex-col items-end">
                                    <Badge 
                                      variant="outline" 
                                      className={`text-xs ${
                                        showtime.availableSeats?.length === rooms?.find(r => r.id === showtime.roomId)?.capacity 
                                          ? 'border-green-500 text-green-400' 
                                          : showtime.availableSeats?.length < (rooms?.find(r => r.id === showtime.roomId)?.capacity || 0) / 2 
                                          ? 'border-red-500 text-red-400' 
                                          : 'border-yellow-500 text-yellow-400'
                                      }`}
                                    >
                                      {(() => {
                                        const room = rooms?.find(r => r.id === showtime.roomId);
                                        const capacity = room?.capacity || 120;
                                        const available = showtime.availableSeats?.length || 0;
                                        const occupied = capacity - available;
                                        return `${occupied}/${capacity} ghế`;
                                      })()}
                                    </Badge>
                                    <span className="text-xs text-gray-500 mt-1">
                                      {(() => {
                                        const room = rooms?.find(r => r.id === showtime.roomId);
                                        const capacity = room?.capacity || 120;
                                        const available = showtime.availableSeats?.length || 0;
                                        const occupied = capacity - available;
                                        
                                        if (occupied === 0) return 'Còn trống';
                                        if (occupied === capacity) return 'Hết vé';
                                        return `${available} ghế trống`;
                                      })()}
                                    </span>
                                  </div>
                                  <div className="flex space-x-2">
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => handleEditShowtime(showtime)}
                                      className="border-gray-600 text-blue-400 hover:bg-blue-600 hover:text-white"
                                    >
                                      <Edit size={16} />
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => handleDeleteShowtime(showtime.id)}
                                      className="border-gray-600 text-red-400 hover:bg-red-600 hover:text-white"
                                    >
                                      <Trash2 size={16} />
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))
                      ) : (
                        <div className="text-center py-8 text-gray-400">
                          <Calendar size={48} className="mx-auto mb-4 text-gray-600" />
                          <p>Chưa có suất chiếu nào</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="tickets" className="mt-6">
                <Card className="bg-gray-900 border-gray-700">
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="text-white flex items-center">
                      <Ticket className="mr-2" />
                      Quản lý vé
                    </CardTitle>
                    <Button 
                      onClick={() => refetchTickets()}
                      variant="outline"
                      size="sm"
                      className="border-gray-600 text-gray-300 hover:bg-gray-700"
                    >
                      Làm mới
                    </Button>
                  </CardHeader>
                  <CardContent>
                    {tickets && tickets.length > 0 ? (
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b border-gray-700">
                              <th className="text-left py-3 px-4 text-white font-medium">Mã vé</th>
                              <th className="text-left py-3 px-4 text-white font-medium">Khách hàng</th>
                              <th className="text-left py-3 px-4 text-white font-medium">Phim</th>
                              <th className="text-left py-3 px-4 text-white font-medium">Ghế</th>
                              <th className="text-left py-3 px-4 text-white font-medium">Tổng tiền</th>
                              <th className="text-left py-3 px-4 text-white font-medium">Trạng thái</th>
                              <th className="text-left py-3 px-4 text-white font-medium">Hành động</th>
                            </tr>
                          </thead>
                          <tbody>
                            {tickets.map((ticket: any) => (
                              <tr key={ticket.id} className="border-b border-gray-700 hover:bg-gray-800/50">
                                <td className="py-3 px-4 text-white font-mono text-sm">
                                  {ticket.bookingCode}
                                </td>
                                <td className="py-3 px-4 text-gray-300">
                                  <div>
                                    <p className="font-medium">{ticket.customerInfo?.name || 'N/A'}</p>
                                    <p className="text-sm text-gray-400">{ticket.customerInfo?.email || 'N/A'}</p>
                                  </div>
                                </td>
                                <td className="py-3 px-4 text-gray-300">
                                  <div>
                                    <p className="font-medium">{ticket.movie?.title || 'N/A'}</p>
                                    <p className="text-sm text-gray-400">
                                      {ticket.showtime?.room?.cinema?.name || 'N/A'} - {ticket.showtime?.room?.name || 'N/A'}
                                    </p>
                                  </div>
                                </td>
                                <td className="py-3 px-4 text-gray-300">
                                  <div className="flex flex-wrap gap-1">
                                    {ticket.seats?.map((seat: string, index: number) => (
                                      <span key={index} className="bg-gray-700 px-2 py-1 rounded text-xs">
                                        {seat}
                                      </span>
                                    ))}
                                  </div>
                                </td>
                                <td className="py-3 px-4 text-green-400 font-semibold">
                                  {new Intl.NumberFormat('vi-VN').format(parseInt(ticket.totalPrice))}đ
                                </td>
                                <td className="py-3 px-4">
                                  <Badge variant={ticket.status === 'confirmed' ? 'default' : 'secondary'}>
                                    {ticket.status === 'confirmed' ? 'Đã xác nhận' : 'Chờ xác nhận'}
                                  </Badge>
                                </td>
                                <td className="py-3 px-4">
                                  <div className="flex space-x-2">
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="border-gray-600 text-blue-400 hover:bg-blue-600 hover:text-white"
                                      onClick={() => {
                                        // View ticket details
                                        const ticketData = {
                                          bookingCode: ticket.bookingCode,
                                          movie: ticket.movie?.title || 'N/A',
                                          showtime: new Date(ticket.showtime?.startTime).toLocaleString('vi-VN'),
                                          cinema: ticket.showtime?.room?.cinema?.name || 'N/A',
                                          room: ticket.showtime?.room?.name || 'N/A',
                                          seats: ticket.seats?.join(', ') || 'N/A',
                                          totalPrice: new Intl.NumberFormat('vi-VN').format(parseInt(ticket.totalPrice)),
                                          customer: ticket.customerInfo?.name || 'N/A',
                                          paymentMethod: ticket.paymentMethod || 'N/A'
                                        };
                                        
                                        alert(`Chi tiết vé:\n\nMã vé: ${ticketData.bookingCode}\nPhim: ${ticketData.movie}\nSuất chiếu: ${ticketData.showtime}\nRạp: ${ticketData.cinema}\nPhòng: ${ticketData.room}\nGhế: ${ticketData.seats}\nTổng tiền: ${ticketData.totalPrice}đ\nKhách hàng: ${ticketData.customer}\nPhương thức thanh toán: ${ticketData.paymentMethod}`);
                                      }}
                                    >
                                      <Eye size={16} />
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="border-gray-600 text-red-400 hover:bg-red-600 hover:text-white"
                                      onClick={() => {
                                        if (confirm("Bạn có chắc chắn muốn hủy vé này?")) {
                                          // Cancel ticket logic would go here
                                          alert("Tính năng hủy vé sẽ được triển khai sau");
                                        }
                                      }}
                                    >
                                      <X size={16} />
                                    </Button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-400">
                        <Ticket size={48} className="mx-auto mb-4 text-gray-600" />
                        <p>Chưa có vé nào được đặt</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="statistics" className="mt-6">
                <Card className="bg-gray-900 border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center">
                      <BarChart3 className="mr-2" />
                      Thống kê doanh thu
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                      <Card className="bg-gray-800 border-gray-700">
                        <CardContent className="p-6">
                          <div className="text-center">
                            <div className="text-2xl font-bold text-yellow-400 mb-2">
                              {tickets?.length || 0}
                            </div>
                            <div className="text-sm text-gray-400">Tổng số vé</div>
                          </div>
                        </CardContent>
                      </Card>
                      <Card className="bg-gray-800 border-gray-700">
                        <CardContent className="p-6">
                          <div className="text-center">
                            <div className="text-2xl font-bold text-green-400 mb-2">
                              {movies?.length || 0}
                            </div>
                            <div className="text-sm text-gray-400">Số phim</div>
                          </div>
                        </CardContent>
                      </Card>
                      <Card className="bg-gray-800 border-gray-700">
                        <CardContent className="p-6">
                          <div className="text-center">
                            <div className="text-2xl font-bold text-blue-400 mb-2">
                              {cinemas?.length || 0}
                            </div>
                            <div className="text-sm text-gray-400">Số rạp</div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    <div className="text-center py-8 text-gray-400">
                      <BarChart3 size={48} className="mx-auto mb-4 text-gray-600" />
                      <p>Biểu đồ thống kê chi tiết sẽ được triển khai sau</p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Edit User Dialog */}
        <Dialog open={isUserDialogOpen} onOpenChange={setIsUserDialogOpen}>
          <DialogContent className="bg-gray-800 border-gray-700">
            <DialogHeader>
              <DialogTitle className="text-white">Chỉnh sửa người dùng</DialogTitle>
            </DialogHeader>
            {editingUser && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-white text-sm font-medium">Tên đầy đủ</label>
                    <p className="text-gray-300">{editingUser.fullName}</p>
                  </div>
                  <div>
                    <label className="text-white text-sm font-medium">Email</label>
                    <p className="text-gray-300">{editingUser.email}</p>
                  </div>
                </div>
                <div>
                  <label className="text-white text-sm font-medium">Vai trò</label>
                  <select 
                    value={editingUser.role}
                    onChange={(e) => setEditingUser({...editingUser, role: e.target.value})}
                    className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white"
                  >
                    <option value="user">User</option>
                    <option value="staff">Staff</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div className="flex space-x-4">
                  <Button 
                    onClick={() => handleUpdateUserRole(editingUser.role)}
                    className="bg-blue-600 hover:bg-blue-700"
                    disabled={updateUserMutation.isPending}
                  >
                    Cập nhật
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setIsUserDialogOpen(false);
                      setEditingUser(null);
                    }}
                    className="border-gray-600 text-gray-300"
                  >
                    Hủy
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Add Showtime Dialog */}
        <Dialog open={isShowtimeDialogOpen} onOpenChange={setIsShowtimeDialogOpen}>
          <DialogContent className="bg-gray-800 border-gray-700">
            <DialogHeader>
              <DialogTitle className="text-white">
                {isEditingShowtime ? 'Chỉnh sửa suất chiếu' : 'Thêm suất chiếu mới'}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-white text-sm font-medium">Chọn phim</label>
                  <select 
                    onChange={(e) => setEditingShowtime({...editingShowtime, movieId: parseInt(e.target.value)})}
                    className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white"
                  >
                    <option value="">Chọn phim</option>
                    {movies?.map(movie => (
                      <option key={movie.id} value={movie.id}>{movie.title}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-white text-sm font-medium">Chọn rạp</label>
                  <select 
                    onChange={(e) => {
                      const cinemaId = parseInt(e.target.value);
                      setSelectedCinema(cinemaId);
                      setEditingShowtime({...editingShowtime, cinemaId});
                    }}
                    className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white"
                  >
                    <option value="">Chọn rạp</option>
                    {cinemas?.map((cinema: any) => (
                      <option key={cinema.id} value={cinema.id}>{cinema.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="text-white text-sm font-medium">Chọn phòng</label>
                <select 
                  onChange={(e) => setEditingShowtime({...editingShowtime, roomId: parseInt(e.target.value)})}
                  className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white"
                  disabled={!selectedCinema}
                >
                  <option value="">Chọn phòng</option>
                  {filteredRooms?.map((room: any) => (
                    <option key={room.id} value={room.id}>{room.name}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-white text-sm font-medium">Thời gian bắt đầu</label>
                  <input 
                    type="datetime-local"
                    onChange={(e) => setEditingShowtime({...editingShowtime, startTime: e.target.value})}
                    className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="text-white text-sm font-medium">Thời gian kết thúc</label>
                  <input 
                    type="datetime-local"
                    onChange={(e) => setEditingShowtime({...editingShowtime, endTime: e.target.value})}
                    className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white"
                  />
                </div>
              </div>
              <div>
                <label className="text-white text-sm font-medium">Giá vé (VND)</label>
                <input 
                  type="number"
                  onChange={(e) => setEditingShowtime({...editingShowtime, price: e.target.value})}
                  className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white"
                />
              </div>
              <div className="flex space-x-4">
                <Button 
                  onClick={() => {
                    if (editingShowtime?.movieId && editingShowtime?.roomId && editingShowtime?.startTime && editingShowtime?.endTime && editingShowtime?.price) {
                      const showtimeData = {
                        movieId: editingShowtime.movieId,
                        roomId: editingShowtime.roomId,
                        startTime: editingShowtime.startTime,
                        endTime: editingShowtime.endTime,
                        price: editingShowtime.price,
                        availableSeats: Array.from({ length: 10 }, (_, i) => 
                          Array.from({ length: 12 }, (_, j) => `${String.fromCharCode(65 + i)}${j + 1}`)
                        ).flat()
                      };
                      
                      if (isEditingShowtime) {
                        updateShowtimeMutation.mutate({...showtimeData, id: editingShowtime.id});
                      } else {
                        createShowtimeMutation.mutate(showtimeData);
                      }
                      setEditingShowtime(null);
                    }
                  }}
                  className="bg-blue-600 hover:bg-blue-700"
                  disabled={createShowtimeMutation.isPending || updateShowtimeMutation.isPending}
                >
                  {isEditingShowtime ? 'Cập nhật' : 'Thêm suất chiếu'}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setIsShowtimeDialogOpen(false);
                    setEditingShowtime(null);
                    setIsEditingShowtime(false);
                  }}
                  className="border-gray-600 text-gray-300"
                >
                  Hủy
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
