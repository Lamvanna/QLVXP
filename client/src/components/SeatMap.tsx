import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SeatSelection } from "@/lib/types";
import { Users, Heart, Star, Eye } from "lucide-react";

interface SeatMapProps {
  availableSeats: string[];
  onSeatSelect: (seats: string[]) => void;
  price: string;
}

export default function SeatMap({ availableSeats, onSeatSelect, price }: SeatMapProps) {
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);

  // Generate seat layout with different types
  const generateSeatLayout = () => {
    const layout = [];
    for (let row = 0; row < 10; row++) {
      const rowSeats = [];
      for (let seat = 1; seat <= 12; seat++) {
        const seatId = `${String.fromCharCode(65 + row)}${seat}`;
        let seatType = "regular";
        
        // VIP seats (first 3 rows)
        if (row < 3) {
          seatType = "vip";
        }
        // Sweet seats (middle sections)
        else if (row >= 4 && row <= 6 && seat >= 4 && seat <= 9) {
          seatType = "sweet";
        }
        // Premium seats (last 2 rows)
        else if (row >= 8) {
          seatType = "premium";
        }
        
        rowSeats.push({
          seatId,
          row: String.fromCharCode(65 + row),
          number: seat,
          type: seatType,
          available: availableSeats.includes(seatId),
          selected: selectedSeats.includes(seatId),
        });
      }
      layout.push(rowSeats);
    }
    return layout;
  };

  const seatLayout = generateSeatLayout();

  const handleSeatClick = (seatId: string, available: boolean) => {
    if (!available) return;

    let newSelectedSeats;
    if (selectedSeats.includes(seatId)) {
      newSelectedSeats = selectedSeats.filter(id => id !== seatId);
    } else {
      newSelectedSeats = [...selectedSeats, seatId];
    }

    setSelectedSeats(newSelectedSeats);
    onSeatSelect(newSelectedSeats);
  };

  const getSeatClass = (seat: any) => {
    const baseClasses = "w-8 h-8 rounded text-xs font-medium transition-all duration-200 flex items-center justify-center";
    
    if (!seat.available) {
      return `${baseClasses} bg-gray-600 text-gray-400 cursor-not-allowed`;
    }
    
    if (seat.selected) {
      return `${baseClasses} bg-red-600 text-white shadow-lg scale-110`;
    }
    
    // Different colors for seat types
    switch (seat.type) {
      case "vip":
        return `${baseClasses} bg-purple-400 text-white hover:bg-purple-500 cursor-pointer`;
      case "sweet":
        return `${baseClasses} bg-pink-400 text-white hover:bg-pink-500 cursor-pointer`;
      case "premium":
        return `${baseClasses} bg-yellow-400 text-gray-900 hover:bg-yellow-500 cursor-pointer`;
      default:
        return `${baseClasses} bg-gray-200 text-gray-800 hover:bg-gray-300 cursor-pointer`;
    }
  };

  const getSeatPrice = (seatType: string) => {
    const basePrice = parseInt(price);
    switch (seatType) {
      case "vip":
        return basePrice * 1.5;
      case "sweet":
        return basePrice * 1.3;
      case "premium":
        return basePrice * 1.2;
      default:
        return basePrice;
    }
  };

  const formatPrice = (price: string) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(parseInt(price));
  };

  const calculateTotalPrice = () => {
    return selectedSeats.reduce((total, seatId) => {
      const seat = seatLayout.flat().find(s => s.seatId === seatId);
      return total + getSeatPrice(seat?.type || "regular");
    }, 0);
  };

  const totalPrice = calculateTotalPrice();

  return (
    <div className="space-y-6">
      {/* Screen */}
      <div className="text-center">
        <div className="bg-gradient-to-r from-yellow-400 to-red-600 rounded-lg p-4 mb-4 shadow-lg">
          <span className="text-gray-900 font-semibold text-lg">MÀN HÌNH</span>
        </div>
      </div>

      {/* Seat Map */}
      <div className="max-w-4xl mx-auto">
        <div className="space-y-2">
          {seatLayout.map((row, rowIndex) => (
            <div key={rowIndex} className="flex items-center justify-center space-x-2">
              <div className="w-8 text-center text-sm text-gray-400">
                {String.fromCharCode(65 + rowIndex)}
              </div>
              {row.map((seat) => (
                <button
                  key={seat.seatId}
                  onClick={() => handleSeatClick(seat.seatId, seat.available)}
                  className={`${getSeatClass(seat)} w-8 h-8 rounded text-xs font-medium transition-all`}
                  disabled={!seat.available}
                >
                  {seat.number}
                </button>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-gray-200 rounded"></div>
          <span>Thường</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-purple-400 rounded"></div>
          <span>VIP (+50%)</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-pink-400 rounded"></div>
          <span>Sweet (+30%)</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-yellow-400 rounded"></div>
          <span>Premium (+20%)</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-red-600 rounded"></div>
          <span>Đã chọn</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-gray-600 rounded"></div>
          <span>Đã bán</span>
        </div>
      </div>

      {/* Booking Summary */}
      <Card className="bg-gray-900 border-gray-700">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-white">Thông tin đặt vé</h3>
              <p className="text-sm text-gray-400">
                Ghế đã chọn: {selectedSeats.length > 0 ? selectedSeats.join(", ") : "Chưa chọn"}
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-yellow-400">
                {formatPrice(price)}
              </div>
              <div className="text-sm text-gray-400">
                x {selectedSeats.length} ghế
              </div>
            </div>
          </div>
          
          <div className="flex items-center justify-between border-t border-gray-700 pt-4">
            <div className="text-lg font-semibold text-white">
              Tổng tiền: {formatPrice(totalPrice.toString())}
            </div>
            <Button
              disabled={selectedSeats.length === 0}
              className="bg-red-600 hover:bg-red-700 disabled:bg-gray-600"
            >
              Tiếp tục thanh toán
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
