import { AuthService } from './auth.service';
declare const LocalStrategy_base: new (...args: unknown[]) => any;
export declare class LocalStrategy extends LocalStrategy_base {
    private authService;
    constructor(authService: AuthService);
    validate(email: string): Promise<any>;
}
export {};
