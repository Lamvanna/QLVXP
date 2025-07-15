import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Star, Play } from "lucide-react";
import { MovieWithDetails } from "@/lib/types";

export default function ComingSoon() {
  const { data: movies, isLoading } = useQuery({
    queryKey: ["/api/movies"],
  });

  const comingSoonMovies = movies?.filter((movie: MovieWithDetails) => movie.status === "coming-soon") || [];

  if (isLoading) {
    return (
      <div className="pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="bg-gray-800 border-gray-700 animate-pulse">
                <CardContent className="p-0">
                  <div className="h-96 bg-gray-700 rounded-t-lg"></div>
                  <div className="p-6">
                    <div className="h-4 bg-gray-700 rounded mb-2"></div>
                    <div className="h-3 bg-gray-700 rounded w-2/3 mb-4"></div>
                    <div className="h-8 bg-gray-700 rounded"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Phim sắp chiếu</h1>
          <p className="text-gray-400">Những bộ phim hay nhất sắp ra mắt</p>
        </div>

        {comingSoonMovies.length === 0 ? (
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-12 text-center">
              <Calendar className="mx-auto mb-4 text-gray-400" size={48} />
              <h3 className="text-xl font-semibold text-white mb-2">Chưa có phim sắp chiếu</h3>
              <p className="text-gray-400">Hãy quay lại sau để xem những bộ phim mới nhất</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {comingSoonMovies.map((movie: MovieWithDetails) => (
              <Card key={movie.id} className="bg-gray-800 border-gray-700 hover:border-red-600 transition-colors group">
                <CardContent className="p-0">
                  <div className="relative">
                    <img 
                      src={movie.posterUrl || "/placeholder-movie.jpg"} 
                      alt={movie.title}
                      className="w-full h-96 object-cover rounded-t-lg"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Button variant="ghost" size="icon" className="text-white hover:text-red-600">
                        <Play size={32} />
                      </Button>
                    </div>
                    <Badge className="absolute top-4 right-4 bg-yellow-600 text-white">
                      Sắp chiếu
                    </Badge>
                  </div>
                  
                  <div className="p-6">
                    <h3 className="text-xl font-semibold text-white mb-2 group-hover:text-red-600 transition-colors">
                      {movie.title}
                    </h3>
                    
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center text-gray-400">
                        <Calendar size={16} className="mr-2" />
                        <span>
                          {movie.releaseDate 
                            ? new Date(movie.releaseDate).toLocaleDateString('vi-VN')
                            : "Chưa xác định"
                          }
                        </span>
                      </div>
                      <div className="flex items-center text-gray-400">
                        <Clock size={16} className="mr-2" />
                        <span>{movie.duration} phút</span>
                      </div>
                      <div className="flex items-center text-gray-400">
                        <Star size={16} className="mr-2" />
                        <span>{movie.averageRating || "Chưa có đánh giá"}</span>
                      </div>
                    </div>
                    
                    <Badge variant="secondary" className="mb-4">
                      {movie.genre}
                    </Badge>
                    
                    <p className="text-gray-400 text-sm mb-4 line-clamp-3">
                      {movie.description}
                    </p>
                    
                    <div className="flex space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1 border-gray-600 text-gray-400 hover:text-white"
                      >
                        <Play className="mr-2" size={16} />
                        Trailer
                      </Button>
                      <Button 
                        size="sm" 
                        className="flex-1 bg-gray-600 hover:bg-gray-700"
                        disabled
                      >
                        Thông báo ra mắt
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}