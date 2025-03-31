/**
 * Interface représentant un document KYC dans Mangopay
 */
export interface MangopayDocument {
  Id: string;
  Status?: string;
  RefusedReasonType?: string;
  RefusedReasonMessage?: string;
  [key: string]: any;
} 