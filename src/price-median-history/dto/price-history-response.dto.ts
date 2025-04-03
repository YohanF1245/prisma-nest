export class PriceHistoryResponseDto {
  id: string;
  shareId: string;
  price: number;
  createdAt: Date;
}

export class PriceVariationResponseDto {
  variation: number;
  percentage: number;
  oldestPrice: number;
  latestPrice: number;
  period: string;
} 