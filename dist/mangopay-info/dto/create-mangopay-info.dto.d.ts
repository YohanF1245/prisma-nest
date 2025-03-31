export declare class CreateMangopayInfoDto {
    userId: string;
    type: string;
    firstName: string;
    lastName: string;
    email: string;
    birthday: string;
    nationality: string;
    countryOfResidence: string;
    address?: {
        addressLine1: string;
        addressLine2?: string;
        city: string;
        region?: string;
        postalCode: string;
        country: string;
    };
    legalRepresentative?: {
        firstName: string;
        lastName: string;
        email: string;
        birthday: string;
        nationality: string;
        countryOfResidence: string;
    };
    companyInfo?: {
        name: string;
        legalPersonType: string;
        businessType: string;
        registrationNumber: string;
    };
}
