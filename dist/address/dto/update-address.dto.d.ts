import { CreateAddressDto } from './create-address.dto';
declare const UpdateAddressDto_base: import("@nestjs/mapped-types").MappedType<Partial<Omit<CreateAddressDto, "userId">>>;
export declare class UpdateAddressDto extends UpdateAddressDto_base {
    addressLine1?: string;
    addressLine2?: string;
    city?: string;
    region?: string;
    postalCode?: string;
    country?: string;
    isPrimary?: boolean;
    addressType?: string;
}
export {};
