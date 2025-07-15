import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, Play } from "lucide-react";
import { MovieWithDetails } from "@/lib/types";

interface MovieCardProps {
  movie: MovieWithDetails;
  onBookTicket: (movieId: number) => void;
  onWatchTrailer: (movieId: number) => void;
}

export default function MovieCard({ movie, onBookTicket, onWatchTrailer }: MovieCardProps) {
  const formatPrice = (price: string) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(parseInt(price));
  };

  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Star
          key={i}
          className={`w-4 h-4 ${
            i <= rating ? "text-yellow-400 fill-current" : "text-gray-400"
          }`}
        />
      );
    }
    return stars;
  };

  return (
    <Card className="movie-card bg-gray-800 border-gray-700 overflow-hidden">
      <div className="relative group">
        <img
          src={movie.posterUrl || "/placeholder-movie.jpg"}
          alt={movie.title}
          className="w-full h-80 object-cover"
        />
        <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <Button
            onClick={() => onWatchTrailer(movie.id)}
            className="bg-red-600 hover:bg-red-700"
          >
            <Play className="mr-2" size={16} />
            Xem trailer
          </Button>
        </div>
        <Badge
          className={`absolute top-3 right-3 ${
            movie.ageRating === "18+" ? "bg-red-600" :
            movie.ageRating === "16+" ? "bg-orange-600" :
            movie.ageRating === "13+" ? "bg-green-600" :
            "bg-blue-600"
          }`}
        >
          {movie.ageRating}
        </Badge>
      </div>
      
      <CardContent className="p-4">
        <h4 className="font-bold text-lg mb-2 text-white">{movie.title}</h4>
        <div className="flex items-center space-x-2 text-sm text-gray-400 mb-2">
          <span>{movie.genre}</span>
          <span>•</span>
          <span>{movie.duration} phút</span>
        </div>
        
        <div className="flex items-center space-x-1 mb-3">
          {renderStars(movie.averageRating || 0)}
          <span className="text-sm text-gray-400 ml-1">
            ({movie.averageRating?.toFixed(1) || '0.0'}/5)
          </span>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-yellow-400 font-semibold">
            {formatPrice("85000")}
          </span>
          <Button
            onClick={() => onBookTicket(movie.id)}
            className="bg-red-600 hover:bg-red-700 text-sm"
          >
            Đặt vé
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
