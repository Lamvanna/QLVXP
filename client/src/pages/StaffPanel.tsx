import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { MovieWithDetails, ShowtimeWithDetails, TicketWithDetails } from "@/lib/types";
import { Plus, Edit, Calendar, Clock, CheckCircle, XCircle, BarChart3 } from "lucide-react";

const showtimeSchema = z.object({
  movieId: z.number().min(1, "Chọn phim"),
  roomId: z.number().min(1, "Chọn phòng chiếu"),
  startTime: z.string().min(1, "Chọn giờ bắt đầu"),
  price: z.string().min(1, "Nhập giá vé"),
});

type ShowtimeForm = z.infer<typeof showtimeSchema>;

export default function StaffPanel() {
  const [activeTab, setActiveTab] = useState("showtimes");
  const [isShowtimeDialogOpen, setIsShowtimeDialogOpen] = useState(false);
  const [editingShowtime, setEditingShowtime] = useState<ShowtimeWithDetails | null>(null);
  const { toast } = useToast();

  const { data: movies } = useQuery<MovieWithDetails[]>({
    queryKey: ["/api/movies"],
  });

  const { data: cinemas } = useQuery({
    queryKey: ["/api/cinemas"],
  });

  const { data: rooms } = useQuery({
    queryKey: ["/api/rooms"],
  });

  const { data: showtimes, isLoading: showtimesLoading } = useQuery<ShowtimeWithDetails[]>({
    queryKey: ["/api/showtimes"],
  });

  const { data: tickets, isLoading: ticketsLoading } = useQuery<TicketWithDetails[]>({
    queryKey: ["/api/admin/tickets"],
  });

  const showtimeForm = useForm<ShowtimeForm>({
    resolver: zodResolver(showtimeSchema),
    defaultValues: {
      movieId: 0,
      roomId: 0,
      startTime: "",
      price: "",
    },
  });

  const createShowtimeMutation = useMutation({
    mutationFn: async (data: ShowtimeForm) => {
      const startTime = new Date(data.startTime);
      const movie = movies?.find(m => m.id === data.movieId);
      const endTime = new Date(startTime.getTime() + (movie?.duration || 120) * 60000);
      
      // Generate available seats (A1-A12, B1-B12, etc.)
      const availableSeats = [];
      for (let row = 0; row < 10; row++) {
        for (let seat = 1; seat <= 12; seat++) {
          availableSeats.push(`${String.fromCharCode(65 + row)}${seat}`);
        }
      }

      const showtimeData = {
        movieId: data.movieId,
        roomId: data.roomId,
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        price: data.price,
        availableSeats,
      };

      const response = await apiRequest("POST", "/api/showtimes", showtimeData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/showtimes"] });
      setIsShowtimeDialogOpen(false);
      showtimeForm.reset();
      toast({
        title: "Thành công",
        description: "Suất chiếu đã được thêm thành công",
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

  const updateTicketMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      const response = await apiRequest("PUT", `/api/tickets/${id}`, { status });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/tickets"] });
      toast({
        title: "Thành công",
        description: "Trạng thái vé đã được cập nhật",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Lỗi",
        description: error.message || "Không thể cập nhật trạng thái vé",
        variant: "destructive",
      });
    },
  });

  const onSubmitShowtime = (data: ShowtimeForm) => {
    createShowtimeMutation.mutate(data);
  };

  const handleApproveTicket = (ticketId: number) => {
    updateTicketMutation.mutate({ id: ticketId, status: "paid" });
  };

  const handleRejectTicket = (ticketId: number) => {
    updateTicketMutation.mutate({ id: ticketId, status: "cancelled" });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "paid":
        return <Badge className="bg-green-600">Đã thanh toán</Badge>;
      case "pending":
        return <Badge className="bg-yellow-600">Chờ thanh toán</Badge>;
      case "cancelled":
        return <Badge className="bg-red-600">Đã hủy</Badge>;
      default:
        return <Badge className="bg-gray-600">{status}</Badge>;
    }
  };

  const formatPrice = (price: string) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(parseInt(price));
  };

  return (
    <div className="pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4">
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white text-2xl">Quản lý suất chiếu</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3 bg-gray-700">
                <TabsTrigger value="showtimes" className="text-white">Suất chiếu</TabsTrigger>
                <TabsTrigger value="tickets" className="text-white">Quản lý vé</TabsTrigger>
                <TabsTrigger value="reports" className="text-white">Báo cáo</TabsTrigger>
              </TabsList>

              <TabsContent value="showtimes" className="mt-6">
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-semibold text-white">Danh sách suất chiếu</h3>
                    <Dialog open={isShowtimeDialogOpen} onOpenChange={setIsShowtimeDialogOpen}>
                      <DialogTrigger asChild>
                        <Button className="bg-red-600 hover:bg-red-700">
                          <Plus className="mr-2" size={16} />
                          Thêm suất chiếu
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="bg-gray-800 border-gray-700">
                        <DialogHeader>
                          <DialogTitle className="text-white">Thêm suất chiếu mới</DialogTitle>
                        </DialogHeader>
                        <Form {...showtimeForm}>
                          <form onSubmit={showtimeForm.handleSubmit(onSubmitShowtime)} className="space-y-4">
                            <FormField
                              control={showtimeForm.control}
                              name="movieId"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-white">Phim</FormLabel>
                                  <FormControl>
                                    <Select
                                      value={field.value.toString()}
                                      onValueChange={(value) => field.onChange(parseInt(value))}
                                    >
                                      <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                                        <SelectValue placeholder="Chọn phim" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {movies?.map((movie) => (
                                          <SelectItem key={movie.id} value={movie.id.toString()}>
                                            {movie.title}
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={showtimeForm.control}
                              name="roomId"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-white">Phòng chiếu</FormLabel>
                                  <FormControl>
                                    <Select
                                      value={field.value.toString()}
                                      onValueChange={(value) => field.onChange(parseInt(value))}
                                    >
                                      <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                                        <SelectValue placeholder="Chọn phòng" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {rooms?.map((room: any) => (
                                          <SelectItem key={room.id} value={room.id.toString()}>
                                            {room.name} - {cinemas?.find((c: any) => c.id === room.cinemaId)?.name}
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={showtimeForm.control}
                              name="startTime"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-white">Thời gian bắt đầu</FormLabel>
                                  <FormControl>
                                    <Input
                                      {...field}
                                      type="datetime-local"
                                      className="bg-gray-700 border-gray-600 text-white"
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={showtimeForm.control}
                              name="price"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-white">Giá vé (VND)</FormLabel>
                                  <FormControl>
                                    <Input
                                      {...field}
                                      type="number"
                                      className="bg-gray-700 border-gray-600 text-white"
                                      placeholder="85000"
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <div className="flex space-x-4">
                              <Button
                                type="submit"
                                className="bg-red-600 hover:bg-red-700"
                                disabled={createShowtimeMutation.isPending}
                              >
                                Thêm suất chiếu
                              </Button>
                              <Button
                                type="button"
                                variant="outline"
                                onClick={() => {
                                  setIsShowtimeDialogOpen(false);
                                  showtimeForm.reset();
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

                  <Card className="bg-gray-900 border-gray-700">
                    <CardContent className="p-0">
                      {showtimesLoading ? (
                        <div className="p-4 space-y-4">
                          {[...Array(3)].map((_, i) => (
                            <Skeleton key={i} className="h-16 w-full bg-gray-700" />
                          ))}
                        </div>
                      ) : (
                        <Table>
                          <TableHeader>
                            <TableRow className="border-gray-700">
                              <TableHead className="text-white">Phim</TableHead>
                              <TableHead className="text-white">Phòng chiếu</TableHead>
                              <TableHead className="text-white">Thời gian</TableHead>
                              <TableHead className="text-white">Giá vé</TableHead>
                              <TableHead className="text-white">Ghế trống</TableHead>
                              <TableHead className="text-white">Hành động</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {showtimes?.map((showtime) => (
                              <TableRow key={showtime.id} className="border-gray-700">
                                <TableCell className="text-white font-semibold">
                                  {showtime.movie?.title || "Phim"}
                                </TableCell>
                                <TableCell className="text-gray-400">
                                  {showtime.room?.name} - {showtime.room?.cinema.name}
                                </TableCell>
                                <TableCell className="text-gray-400">
                                  <div className="flex items-center space-x-2">
                                    <Calendar size={16} />
                                    <span>{new Date(showtime.startTime).toLocaleDateString('vi-VN')}</span>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <Clock size={16} />
                                    <span>{new Date(showtime.startTime).toLocaleTimeString('vi-VN', {
                                      hour: '2-digit',
                                      minute: '2-digit'
                                    })}</span>
                                  </div>
                                </TableCell>
                                <TableCell className="text-yellow-400 font-semibold">
                                  {formatPrice(showtime.price)}
                                </TableCell>
                                <TableCell className="text-gray-400">
                                  {showtime.availableSeats?.length || 0} / 120
                                </TableCell>
                                <TableCell>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="border-gray-600 text-blue-400 hover:bg-blue-600"
                                  >
                                    <Edit size={16} />
                                  </Button>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="tickets" className="mt-6">
                <div className="space-y-6">
                  <h3 className="text-xl font-semibold text-white">Quản lý đặt vé</h3>
                  
                  <Card className="bg-gray-900 border-gray-700">
                    <CardContent className="p-0">
                      {ticketsLoading ? (
                        <div className="p-4 space-y-4">
                          {[...Array(3)].map((_, i) => (
                            <Skeleton key={i} className="h-16 w-full bg-gray-700" />
                          ))}
                        </div>
                      ) : (
                        <Table>
                          <TableHeader>
                            <TableRow className="border-gray-700">
                              <TableHead className="text-white">Mã vé</TableHead>
                              <TableHead className="text-white">Khách hàng</TableHead>
                              <TableHead className="text-white">Phim</TableHead>
                              <TableHead className="text-white">Ghế</TableHead>
                              <TableHead className="text-white">Tổng tiền</TableHead>
                              <TableHead className="text-white">Trạng thái</TableHead>
                              <TableHead className="text-white">Hành động</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {tickets?.map((ticket) => (
                              <TableRow key={ticket.id} className="border-gray-700">
                                <TableCell className="text-white font-mono">
                                  {ticket.bookingCode}
                                </TableCell>
                                <TableCell className="text-gray-400">
                                  <div>
                                    <div>{ticket.customerInfo?.name || "Khách hàng"}</div>
                                    <div className="text-sm">{ticket.customerInfo?.phone}</div>
                                  </div>
                                </TableCell>
                                <TableCell className="text-gray-400">
                                  {ticket.movie?.title || "Phim"}
                                </TableCell>
                                <TableCell className="text-gray-400">
                                  {ticket.seats.join(", ")}
                                </TableCell>
                                <TableCell className="text-yellow-400 font-semibold">
                                  {formatPrice(ticket.totalPrice)}
                                </TableCell>
                                <TableCell>
                                  {getStatusBadge(ticket.status)}
                                </TableCell>
                                <TableCell>
                                  {ticket.status === "pending" && (
                                    <div className="flex space-x-2">
                                      <Button
                                        size="sm"
                                        onClick={() => handleApproveTicket(ticket.id)}
                                        className="bg-green-600 hover:bg-green-700"
                                        disabled={updateTicketMutation.isPending}
                                      >
                                        <CheckCircle size={16} />
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => handleRejectTicket(ticket.id)}
                                        className="border-gray-600 text-red-400 hover:bg-red-600"
                                        disabled={updateTicketMutation.isPending}
                                      >
                                        <XCircle size={16} />
                                      </Button>
                                    </div>
                                  )}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="reports" className="mt-6">
                <Card className="bg-gray-900 border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center">
                      <BarChart3 className="mr-2" />
                      Báo cáo bán vé
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                      <Card className="bg-gray-800 border-gray-700">
                        <CardContent className="p-6">
                          <div className="text-center">
                            <div className="text-2xl font-bold text-green-400 mb-2">
                              {tickets?.filter(t => t.status === "paid").length || 0}
                            </div>
                            <div className="text-sm text-gray-400">Vé đã bán</div>
                          </div>
                        </CardContent>
                      </Card>
                      <Card className="bg-gray-800 border-gray-700">
                        <CardContent className="p-6">
                          <div className="text-center">
                            <div className="text-2xl font-bold text-yellow-400 mb-2">
                              {tickets?.filter(t => t.status === "pending").length || 0}
                            </div>
                            <div className="text-sm text-gray-400">Vé chờ thanh toán</div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    <div className="text-center py-8 text-gray-400">
                      <BarChart3 size={48} className="mx-auto mb-4 text-gray-600" />
                      <p>Báo cáo chi tiết theo suất chiếu sẽ được triển khai sau</p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
