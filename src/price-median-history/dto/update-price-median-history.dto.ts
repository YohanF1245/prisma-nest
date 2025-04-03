import { PartialType } from '@nestjs/mapped-types';
import { CreatePriceMedianHistoryDto } from './create-price-median-history.dto';

export class UpdatePriceMedianHistoryDto extends PartialType(CreatePriceMedianHistoryDto) {} 