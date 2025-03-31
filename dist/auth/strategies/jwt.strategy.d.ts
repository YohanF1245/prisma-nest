import { Strategy } from 'passport-jwt';
import { JwtConfigService } from '../../config/jwt-config.service';
declare const JwtStrategy_base: new (...args: [opt: import("passport-jwt").StrategyOptionsWithRequest] | [opt: import("passport-jwt").StrategyOptionsWithoutRequest]) => Strategy & {
    validate(...args: any[]): unknown;
};
export declare class JwtStrategy extends JwtStrategy_base {
    private jwtConfigService;
    constructor(jwtConfigService: JwtConfigService);
    validate(payload: any): Promise<{
        id: any;
        email: any;
    }>;
}
export {};
