import { NestMiddleware } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Socket } from 'socket.io';
export declare class WebsocketMiddleware implements NestMiddleware {
    private jwtService;
    constructor(jwtService: JwtService);
    use(socket: Socket, next: (err?: Error) => void): void;
}
