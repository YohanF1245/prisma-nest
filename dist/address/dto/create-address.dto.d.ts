export declare class CreateAddressDto {
    userId: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    region?: string;
    postalCode: string;
    country: string;
    isPrimary?: boolean;
    addressType?: string;
}
