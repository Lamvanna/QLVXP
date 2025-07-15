import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Gift, Calendar, Percent, DollarSign, Copy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Promotions() {
  const { toast } = useToast();
  
  const { data: promotions, isLoading } = useQuery({
    queryKey: ["/api/promotions"],
  });

  const activePromotions = promotions?.filter((promo: any) => promo.status === "active") || [];

  const copyPromoCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast({
      title: "Đã sao chép",
      description: `Mã khuyến mãi "${code}" đã được sao chép vào clipboard`,
    });
  };

  const formatDiscount = (promo: any) => {
    if (promo.discountType === "percentage") {
      return `${promo.discountValue}%`;
    } else {
      return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
      }).format(parseFloat(promo.discountValue));
    }
  };

  const formatMinPurchase = (minPurchase: string) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(parseFloat(minPurchase));
  };

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
          <h1 className="text-3xl font-bold text-white mb-2">Khuyến mãi</h1>
          <p className="text-gray-400">Các chương trình khuyến mãi đang diễn ra</p>
        </div>

        {activePromotions.length === 0 ? (
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-12 text-center">
              <Gift className="mx-auto mb-4 text-gray-400" size={48} />
              <h3 className="text-xl font-semibold text-white mb-2">Chưa có khuyến mãi nào</h3>
              <p className="text-gray-400">Hãy quay lại sau để không bỏ lỡ những ưu đãi hấp dẫn</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activePromotions.map((promo: any) => (
              <Card key={promo.id} className="bg-gray-800 border-gray-700 hover:border-red-600 transition-colors relative overflow-hidden">
                <div className="absolute top-0 right-0 w-20 h-20 bg-red-600 transform rotate-45 translate-x-6 -translate-y-6"></div>
                <div className="absolute top-2 right-2 text-white text-xs font-bold transform rotate-45">
                  HOT
                </div>
                
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-white text-lg mb-2">{promo.title}</CardTitle>
                      <Badge 
                        className={`${promo.discountType === 'percentage' ? 'bg-green-600' : 'bg-blue-600'} text-white`}
                      >
                        {promo.discountType === 'percentage' ? (
                          <Percent className="mr-1" size={12} />
                        ) : (
                          <DollarSign className="mr-1" size={12} />
                        )}
                        Giảm {formatDiscount(promo)}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <p className="text-gray-400 text-sm">{promo.description}</p>
                  
                  <div className="space-y-2">
                    <div className="flex items-center text-gray-400 text-sm">
                      <Calendar size={14} className="mr-2" />
                      Hết hạn: {new Date(promo.endDate).toLocaleDateString('vi-VN')}
                    </div>
                    
                    {promo.minPurchase && (
                      <div className="flex items-center text-gray-400 text-sm">
                        <DollarSign size={14} className="mr-2" />
                        Đơn tối thiểu: {formatMinPurchase(promo.minPurchase)}
                      </div>
                    )}
                    
                    {promo.usageLimit && (
                      <div className="flex items-center text-gray-400 text-sm">
                        <Gift size={14} className="mr-2" />
                        Còn lại: {promo.usageLimit - (promo.currentUsage || 0)} lượt
                      </div>
                    )}
                  </div>
                  
                  <div className="bg-gray-900 rounded-lg p-3 border border-gray-700">
                    <p className="text-gray-400 text-xs mb-2">Mã khuyến mãi:</p>
                    <div className="flex items-center justify-between">
                      <code className="text-red-400 font-mono text-lg font-bold">
                        {promo.code}
                      </code>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyPromoCode(promo.code)}
                        className="border-gray-600 text-gray-400 hover:text-white"
                      >
                        <Copy size={14} className="mr-1" />
                        Sao chép
                      </Button>
                    </div>
                  </div>
                  
                  <div className="text-xs text-gray-500 border-t border-gray-700 pt-3">
                    <p>* Áp dụng khi đặt vé online</p>
                    <p>* Không áp dụng cùng các chương trình khuyến mãi khác</p>
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