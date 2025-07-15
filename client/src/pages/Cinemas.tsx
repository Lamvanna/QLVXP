import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Phone, Clock, Users } from "lucide-react";

export default function Cinemas() {
  const { data: cinemas, isLoading } = useQuery({
    queryKey: ["/api/cinemas"],
  });

  const { data: rooms } = useQuery({
    queryKey: ["/api/rooms"],
  });

  if (isLoading) {
    return (
      <div className="pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="bg-gray-800 border-gray-700 animate-pulse">
                <CardHeader>
                  <div className="h-6 bg-gray-700 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-gray-700 rounded w-1/2"></div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="h-4 bg-gray-700 rounded"></div>
                    <div className="h-4 bg-gray-700 rounded"></div>
                    <div className="h-4 bg-gray-700 rounded"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const getCinemaRooms = (cinemaId: number) => {
    return rooms?.filter((room: any) => room.cinemaId === cinemaId) || [];
  };

  return (
    <div className="pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Hệ thống rạp chiếu</h1>
          <p className="text-gray-400">Tìm rạp chiếu gần nhất với bạn</p>
        </div>

        {!cinemas || cinemas.length === 0 ? (
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-12 text-center">
              <MapPin className="mx-auto mb-4 text-gray-400" size={48} />
              <h3 className="text-xl font-semibold text-white mb-2">Chưa có rạp chiếu nào</h3>
              <p className="text-gray-400">Hệ thống rạp chiếu sẽ sớm được cập nhật</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {cinemas.map((cinema: any) => {
              const cinemaRooms = getCinemaRooms(cinema.id);
              return (
                <Card key={cinema.id} className="bg-gray-800 border-gray-700 hover:border-red-600 transition-colors">
                  <CardHeader>
                    <CardTitle className="text-white text-xl">{cinema.name}</CardTitle>
                    <Badge variant="secondary" className="w-fit">
                      {cinemaRooms.length} phòng chiếu
                    </Badge>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-start space-x-3">
                        <MapPin className="text-red-600 mt-1 flex-shrink-0" size={16} />
                        <div>
                          <p className="text-gray-400 text-sm">Địa chỉ</p>
                          <p className="text-white">{cinema.address}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start space-x-3">
                        <Phone className="text-red-600 mt-1 flex-shrink-0" size={16} />
                        <div>
                          <p className="text-gray-400 text-sm">Liên hệ</p>
                          <p className="text-white">{cinema.phone || "1900 1234"}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start space-x-3">
                        <Clock className="text-red-600 mt-1 flex-shrink-0" size={16} />
                        <div>
                          <p className="text-gray-400 text-sm">Giờ mở cửa</p>
                          <p className="text-white">8:00 - 23:00 (Hàng ngày)</p>
                        </div>
                      </div>

                      {cinemaRooms.length > 0 && (
                        <div className="border-t border-gray-700 pt-4">
                          <p className="text-gray-400 text-sm mb-2">Phòng chiếu:</p>
                          <div className="flex flex-wrap gap-2">
                            {cinemaRooms.map((room: any) => (
                              <Badge key={room.id} variant="outline" className="text-gray-300 border-gray-600">
                                <Users size={12} className="mr-1" />
                                {room.name} ({room.capacity || 100} chỗ)
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}