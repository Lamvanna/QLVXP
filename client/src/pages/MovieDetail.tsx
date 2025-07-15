import { useState } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Star, Play, Calendar, Clock, Users } from "lucide-react";
import SeatMap from "@/components/SeatMap";
import BookingForm from "@/components/BookingForm";
import MovieReviews from "@/components/MovieReviews";
import { MovieWithDetails, ShowtimeWithDetails } from "@/lib/types";
import { queryClient } from "@/lib/queryClient";

export default function MovieDetail() {
  const { id } = useParams();
  const [, setLocation] = useLocation();
  const [selectedShowtime, setSelectedShowtime] = useState<ShowtimeWithDetails | null>(null);
  const [showSeatSelection, setShowSeatSelection] = useState(false);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);

  const { data: movie, isLoading } = useQuery<MovieWithDetails>({
    queryKey: ["/api/movies", id],
  });

  const { data: showtimes } = useQuery<ShowtimeWithDetails[]>({
    queryKey: ["/api/movies", id, "showtimes"],
  });

  const { data: reviews } = useQuery({
    queryKey: ["/api/movies", id, "reviews"],
  });

  const handleShowtimeSelect = (showtime: ShowtimeWithDetails) => {
    setSelectedShowtime(showtime);
    setShowSeatSelection(true);
  };

  const handleSeatSelect = (seats: string[]) => {
    setSelectedSeats(seats);
    if (seats.length > 0) {
      setShowSeatSelection(false);
      setShowBookingForm(true);
    }
  };

  const handleBookingSuccess = () => {
    setShowBookingForm(false);
    setSelectedSeats([]);
    setSelectedShowtime(null);
    // Refresh showtime data to get updated seat availability
    queryClient.invalidateQueries({ queryKey: ["/api/movies", id, "showtimes"] });
  };

  const handleBookingBack = () => {
    setShowBookingForm(false);
    setShowSeatSelection(true);
  };

  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Star
          key={i}
          className={`w-5 h-5 ${
            i <= rating ? "text-yellow-400 fill-current" : "text-gray-400"
          }`}
        />
      );
    }
    return stars;
  };

  if (isLoading) {
    return (
      <div className="pt-24 pb-16">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Skeleton className="w-full h-96 bg-gray-700" />
            <div className="space-y-6">
              <Skeleton className="h-8 w-3/4 bg-gray-700" />
              <Skeleton className="h-20 w-full bg-gray-700" />
              <Skeleton className="h-40 w-full bg-gray-700" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="pt-24 pb-16">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Phim không tồn tại</h1>
          <Button onClick={() => setLocation("/")} className="bg-red-600 hover:bg-red-700">
            Quay về trang chủ
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-24 pb-16">
      <div className="max-w-6xl mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <img
              src={movie.posterUrl || "/placeholder-movie.jpg"}
              alt={movie.title}
              className="w-full rounded-lg shadow-2xl"
            />
          </div>
          
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold mb-2 text-white">{movie.title}</h1>
              <div className="flex items-center space-x-4 text-gray-400 mb-4">
                <Badge className={`${
                  movie.ageRating === "18+" ? "bg-red-600" :
                  movie.ageRating === "16+" ? "bg-orange-600" :
                  movie.ageRating === "13+" ? "bg-green-600" :
                  "bg-blue-600"
                }`}>
                  {movie.ageRating}
                </Badge>
                <span>{movie.genre}</span>
                <span>•</span>
                <span className="flex items-center">
                  <Clock className="w-4 h-4 mr-1" />
                  {movie.duration} phút
                </span>
                <span>•</span>
                <span className="flex items-center">
                  <Calendar className="w-4 h-4 mr-1" />
                  {movie.releaseDate ? new Date(movie.releaseDate).getFullYear() : "2024"}
                </span>
              </div>
              
              <div className="flex items-center space-x-2 mb-4">
                {renderStars(movie.averageRating || 0)}
                <span className="text-sm text-gray-400 ml-2">
                  ({movie.averageRating?.toFixed(1) || '0.0'}/5 - {movie.reviewCount || 0} đánh giá)
                </span>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-2 text-white">Tóm tắt</h3>
              <p className="text-gray-300 leading-relaxed">{movie.description}</p>
            </div>

            {movie.actors && movie.actors.length > 0 && (
              <div>
                <h3 className="text-xl font-semibold mb-2 text-white">Diễn viên</h3>
                <div className="flex flex-wrap gap-2">
                  {movie.actors.map((actor, index) => (
                    <Badge key={index} variant="secondary" className="bg-gray-800 text-gray-300">
                      {actor}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {movie.director && (
              <div>
                <h3 className="text-xl font-semibold mb-2 text-white">Đạo diễn</h3>
                <p className="text-gray-300">{movie.director}</p>
              </div>
            )}

            <div className="flex space-x-4">
              <Button className="bg-red-600 hover:bg-red-700 flex-1">
                <Play className="mr-2" size={16} />
                Xem trailer
              </Button>
              <Button 
                variant="outline"
                className="border-gray-600 text-gray-300 hover:bg-gray-800 flex-1"
                onClick={() => {
                  if (showtimes && showtimes.length > 0) {
                    // Tự động chọn showtime đầu tiên
                    setSelectedShowtime(showtimes[0]);
                    setShowSeatSelection(true);
                  } else {
                    // Cuộn xuống phần lịch chiếu
                    document.getElementById('showtimes-section')?.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
              >
                Đặt vé ngay
              </Button>
            </div>
          </div>
        </div>

        {/* Showtimes */}
        {showtimes && showtimes.length > 0 && (
          <div id="showtimes-section" className="mt-12">
            <h3 className="text-2xl font-semibold mb-6 text-white">Lịch chiếu</h3>
            <div className="space-y-4">
              {showtimes.map((showtime) => (
                <Card key={showtime.id} className="bg-gray-800 border-gray-700">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-white">{showtime.room?.cinema.name}</h4>
                      <span className="text-sm text-gray-400">
                        {showtime.room?.cinema.address}
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <Button
                        variant="outline"
                        className="bg-gray-900 border-gray-600 text-white hover:bg-red-600"
                        onClick={() => handleShowtimeSelect(showtime)}
                      >
                        {new Date(showtime.startTime).toLocaleTimeString('vi-VN', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* No Showtimes Message */}
        {showtimes && showtimes.length === 0 && (
          <div className="mt-12 text-center py-8">
            <div className="text-gray-400">
              <Calendar size={48} className="mx-auto mb-4 text-gray-600" />
              <p>Hiện tại phim này chưa có lịch chiếu</p>
              <p className="text-sm mt-2">Vui lòng quay lại sau</p>
            </div>
          </div>
        )}

        {/* Reviews */}
        <div className="mt-12">
          <MovieReviews movieId={parseInt(id!)} />
        </div>
      </div>

      {/* Seat Selection Dialog */}
      <Dialog open={showSeatSelection} onOpenChange={setShowSeatSelection}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto bg-gray-800 border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-white">
              Chọn ghế - {movie.title}
            </DialogTitle>
            {selectedShowtime && (
              <p className="text-gray-400">
                {selectedShowtime.room?.cinema.name} - {selectedShowtime.room?.name} - {" "}
                {new Date(selectedShowtime.startTime).toLocaleString('vi-VN')}
              </p>
            )}
          </DialogHeader>
          
          {selectedShowtime && (
            <SeatMap
              availableSeats={selectedShowtime.availableSeats || []}
              onSeatSelect={handleSeatSelect}
              price={selectedShowtime.price}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Booking Form Dialog */}
      <Dialog open={showBookingForm} onOpenChange={setShowBookingForm}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-gray-800 border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-white">
              Hoàn tất đặt vé - {movie.title}
            </DialogTitle>
            {selectedShowtime && (
              <p className="text-gray-400">
                {selectedShowtime.room?.cinema.name} - {selectedShowtime.room?.name} - {" "}
                {new Date(selectedShowtime.startTime).toLocaleString('vi-VN')}
              </p>
            )}
          </DialogHeader>
          
          {selectedShowtime && (
            <BookingForm
              showtimeId={selectedShowtime.id}
              selectedSeats={selectedSeats}
              totalPrice={selectedSeats.length * parseInt(selectedShowtime.price)}
              onSuccess={handleBookingSuccess}
              onBack={handleBookingBack}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
