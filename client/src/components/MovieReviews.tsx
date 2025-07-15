import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Star, MessageCircle, ThumbsUp, User } from "lucide-react";
import { isAuthenticated, getAuthUser } from "@/lib/auth";

const reviewSchema = z.object({
  rating: z.number().min(1).max(5),
  content: z.string().min(10, "Đánh giá phải có ít nhất 10 ký tự"),
});

type ReviewFormData = z.infer<typeof reviewSchema>;

interface MovieReviewsProps {
  movieId: number;
}

interface Review {
  id: number;
  userId: number;
  rating: number;
  content: string;
  createdAt: string;
  user?: {
    fullName: string;
    username: string;
  };
}

export default function MovieReviews({ movieId }: MovieReviewsProps) {
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [selectedRating, setSelectedRating] = useState(0);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const currentUser = getAuthUser();

  const { data: reviews, isLoading } = useQuery<Review[]>({
    queryKey: [`/api/movies/${movieId}/reviews`],
  });

  const form = useForm<ReviewFormData>({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      rating: 0,
      content: "",
    },
  });

  const reviewMutation = useMutation({
    mutationFn: async (data: ReviewFormData) => {
      return await apiRequest(`/api/movies/${movieId}/reviews`, {
        method: "POST",
        body: JSON.stringify({
          ...data,
          movieId,
          userId: currentUser?.id,
        }),
      });
    },
    onSuccess: () => {
      toast({
        title: "Đánh giá thành công!",
        description: "Cảm ơn bạn đã đánh giá phim.",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/movies/${movieId}/reviews`] });
      setShowReviewForm(false);
      form.reset();
      setSelectedRating(0);
    },
    onError: () => {
      toast({
        title: "Lỗi đánh giá",
        description: "Có lỗi xảy ra khi gửi đánh giá. Vui lòng thử lại.",
        variant: "destructive",
      });
    },
  });

  const renderStars = (rating: number, interactive = false, onRate?: (rating: number) => void) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-5 h-5 ${
              star <= rating
                ? "text-yellow-400 fill-yellow-400"
                : "text-gray-400"
            } ${interactive ? "cursor-pointer hover:text-yellow-400" : ""}`}
            onClick={() => interactive && onRate?.(star)}
          />
        ))}
      </div>
    );
  };

  const calculateAverageRating = () => {
    if (!reviews || reviews.length === 0) return 0;
    const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
    return (sum / reviews.length).toFixed(1);
  };

  const onSubmit = (data: ReviewFormData) => {
    reviewMutation.mutate({ ...data, rating: selectedRating });
  };

  return (
    <div className="space-y-6">
      {/* Reviews Summary */}
      <Card className="bg-gray-900 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <MessageCircle className="w-5 h-5" />
            Đánh giá phim
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-400">
                {calculateAverageRating()}
              </div>
              <div className="flex items-center gap-1">
                {renderStars(Math.round(Number(calculateAverageRating())))}
              </div>
              <div className="text-sm text-gray-400">
                {reviews?.length || 0} đánh giá
              </div>
            </div>
            
            <Separator orientation="vertical" className="h-16 bg-gray-700" />
            
            <div className="flex-1">
              {[5, 4, 3, 2, 1].map((rating) => {
                const count = reviews?.filter(r => r.rating === rating).length || 0;
                const percentage = reviews?.length ? (count / reviews.length) * 100 : 0;
                
                return (
                  <div key={rating} className="flex items-center gap-2 mb-1">
                    <span className="text-sm text-gray-400 w-8">{rating}</span>
                    <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                    <div className="flex-1 bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-yellow-400 h-2 rounded-full transition-all"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="text-sm text-gray-400 w-8">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {isAuthenticated() && (
            <div className="flex gap-4">
              <Button
                onClick={() => setShowReviewForm(!showReviewForm)}
                className="bg-red-600 hover:bg-red-700"
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                Viết đánh giá
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Review Form */}
      {showReviewForm && (
        <Card className="bg-gray-900 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Viết đánh giá của bạn</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label className="text-white">Đánh giá sao</Label>
                <div className="flex items-center gap-2">
                  {renderStars(selectedRating, true, setSelectedRating)}
                  <span className="text-gray-400 ml-2">
                    {selectedRating > 0 ? `${selectedRating}/5 sao` : "Chưa chọn"}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="content" className="text-white">Nội dung đánh giá</Label>
                <Textarea
                  id="content"
                  {...form.register("content")}
                  className="bg-gray-800 border-gray-600 text-white min-h-[100px]"
                  placeholder="Chia sẻ cảm nhận của bạn về bộ phim..."
                />
                {form.formState.errors.content && (
                  <p className="text-red-400 text-sm">{form.formState.errors.content.message}</p>
                )}
              </div>

              <div className="flex gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowReviewForm(false)}
                  className="border-gray-600 text-white hover:bg-gray-800"
                >
                  Hủy
                </Button>
                <Button
                  type="submit"
                  disabled={selectedRating === 0 || reviewMutation.isPending}
                  className="bg-red-600 hover:bg-red-700"
                >
                  {reviewMutation.isPending ? "Đang gửi..." : "Gửi đánh giá"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Reviews List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="text-center text-gray-400">Đang tải đánh giá...</div>
        ) : !reviews || reviews.length === 0 ? (
          <Card className="bg-gray-900 border-gray-700">
            <CardContent className="p-8 text-center">
              <MessageCircle className="w-12 h-12 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400">Chưa có đánh giá nào cho phim này.</p>
              <p className="text-gray-500 text-sm mt-2">
                Hãy là người đầu tiên đánh giá phim này!
              </p>
            </CardContent>
          </Card>
        ) : (
          reviews.map((review) => (
            <Card key={review.id} className="bg-gray-900 border-gray-700">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <Avatar className="w-10 h-10">
                    <AvatarFallback className="bg-gray-700 text-white">
                      {review.user?.fullName?.charAt(0) || "U"}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-white font-medium">
                        {review.user?.fullName || "Ẩn danh"}
                      </span>
                      <div className="flex items-center gap-1">
                        {renderStars(review.rating)}
                      </div>
                      <span className="text-gray-400 text-sm">
                        {new Date(review.createdAt).toLocaleDateString('vi-VN')}
                      </span>
                    </div>
                    
                    <p className="text-gray-300 leading-relaxed">{review.content}</p>
                    
                    <div className="flex items-center gap-4 mt-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-gray-400 hover:text-white"
                      >
                        <ThumbsUp className="w-4 h-4 mr-1" />
                        Hữu ích
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
  );
}