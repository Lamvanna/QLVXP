import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Play, Ticket } from "lucide-react";
import MovieCard from "@/components/MovieCard";
import { MovieWithDetails } from "@/lib/types";

export default function Home() {
  const [, setLocation] = useLocation();
  const [selectedGenre, setSelectedGenre] = useState<string>("all");
  const [selectedCinema, setSelectedCinema] = useState<string>("all");

  const { data: movies, isLoading } = useQuery<MovieWithDetails[]>({
    queryKey: ["/api/movies"],
  });

  const { data: cinemas } = useQuery({
    queryKey: ["/api/cinemas"],
  });

  const { data: promotions } = useQuery({
    queryKey: ["/api/promotions/active"],
  });

  const filteredMovies = movies?.filter(movie => {
    if (selectedGenre !== "all" && movie.genre !== selectedGenre) return false;
    return movie.status === "active";
  }) || [];

  const comingSoonMovies = movies?.filter(movie => movie.status === "coming-soon") || [];

  const genres = [...new Set(movies?.map(movie => movie.genre) || [])];

  const handleBookTicket = (movieId: number) => {
    setLocation(`/movie/${movieId}`);
  };

  const handleWatchTrailer = (movieId: number) => {
    // Open trailer in modal or new tab
    const movie = movies?.find(m => m.id === movieId);
    if (movie?.trailerUrl) {
      window.open(movie.trailerUrl, '_blank');
    }
  };

  if (isLoading) {
    return (
      <div className="pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <Card key={i} className="bg-gray-800 border-gray-700">
                <Skeleton className="h-80 w-full bg-gray-700" />
                <CardContent className="p-4">
                  <Skeleton className="h-6 w-3/4 bg-gray-700 mb-2" />
                  <Skeleton className="h-4 w-1/2 bg-gray-700 mb-2" />
                  <Skeleton className="h-4 w-full bg-gray-700" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-24">
      {/* Hero Section */}
      <section className="relative pb-16 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-gray-900 via-gray-900/90 to-transparent z-10"></div>
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1489599732986-c0e2de6ddc38?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2000&q=80')"
          }}
        ></div>
        <div className="relative z-20 max-w-7xl mx-auto px-4 py-20">
          <div className="max-w-2xl">
            <h2 className="text-5xl font-bold mb-6 leading-tight text-white">
              Trải nghiệm điện ảnh<br/>
              <span className="text-red-600">đỉnh cao</span>
            </h2>
            <p className="text-xl text-gray-300 mb-8 leading-relaxed">
              Đặt vé xem phim online nhanh chóng, tiện lợi. Hàng nghìn suất chiếu, đa dạng thể loại phim mới nhất.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button className="bg-red-600 hover:bg-red-700 px-8 py-6 text-lg">
                <Ticket className="mr-2" size={20} />
                Đặt vé ngay
              </Button>
              <Button 
                variant="outline" 
                className="border-gray-400 text-gray-300 hover:bg-gray-800 px-8 py-6 text-lg"
              >
                <Play className="mr-2" size={20} />
                Xem trailer
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Promotions Section */}
      {promotions && promotions.length > 0 && (
        <section className="py-16 px-4 bg-gray-800">
          <div className="max-w-7xl mx-auto">
            <h3 className="text-3xl font-bold text-white mb-8">Khuyến mãi hot</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {promotions.map((promotion: any) => (
                <Card key={promotion.id} className="bg-gradient-to-br from-red-600 to-red-800 border-red-500 text-white">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-xl font-bold">{promotion.title}</h4>
                      <div className="bg-yellow-400 text-black px-3 py-1 rounded-full text-sm font-semibold">
                        -{promotion.discountValue}%
                      </div>
                    </div>
                    <p className="text-gray-100 mb-4">{promotion.description}</p>
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-gray-200">
                        Mã: <span className="font-mono bg-black/20 px-2 py-1 rounded">{promotion.code}</span>
                      </div>
                      <div className="text-sm text-gray-200">
                        Đến: {new Date(promotion.endDate).toLocaleDateString('vi-VN')}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Movie Grid */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-3xl font-bold text-white">Phim đang chiếu</h3>
            <div className="flex space-x-4">
              <Select value={selectedGenre} onValueChange={setSelectedGenre}>
                <SelectTrigger className="w-48 bg-gray-800 border-gray-600 text-white">
                  <SelectValue placeholder="Tất cả thể loại" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả thể loại</SelectItem>
                  {genres.map(genre => (
                    <SelectItem key={genre} value={genre}>{genre}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={selectedCinema} onValueChange={setSelectedCinema}>
                <SelectTrigger className="w-48 bg-gray-800 border-gray-600 text-white">
                  <SelectValue placeholder="Tất cả rạp" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả rạp</SelectItem>
                  {cinemas?.map((cinema: any) => (
                    <SelectItem key={cinema.id} value={cinema.id.toString()}>
                      {cinema.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredMovies.map((movie) => (
              <MovieCard
                key={movie.id}
                movie={movie}
                onBookTicket={handleBookTicket}
                onWatchTrailer={handleWatchTrailer}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Coming Soon Movies */}
      {comingSoonMovies.length > 0 && (
        <section className="py-16 px-4 bg-gray-800">
          <div className="max-w-7xl mx-auto">
            <h3 className="text-3xl font-bold text-white mb-8">Phim sắp chiếu</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {comingSoonMovies.map((movie) => (
                <Card key={movie.id} className="bg-gray-900 border-gray-700 overflow-hidden group hover:border-red-500 transition-colors">
                  <div className="relative">
                    <img 
                      src={movie.posterUrl || 'https://images.unsplash.com/photo-1489599732986-c0e2de6ddc38?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80'} 
                      alt={movie.title}
                      className="w-full h-80 object-cover"
                    />
                    <div className="absolute top-4 left-4 bg-yellow-500 text-black px-3 py-1 rounded-full text-sm font-semibold">
                      Sắp chiếu
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <h4 className="font-bold text-white mb-2">{movie.title}</h4>
                    <p className="text-gray-400 text-sm mb-2">{movie.genre} • {movie.ageRating}</p>
                    <p className="text-gray-300 text-sm mb-4 line-clamp-2">{movie.description}</p>
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-gray-400">
                        Khởi chiếu: {new Date(movie.releaseDate || '').toLocaleDateString('vi-VN')}
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="border-gray-600 text-gray-300 hover:bg-gray-800"
                        onClick={() => handleWatchTrailer(movie.id)}
                      >
                        <Play className="w-4 h-4 mr-1" />
                        Trailer
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
