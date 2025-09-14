// backend/src/collaboration/websocket.middleware.ts
import { Injectable, NestMiddleware } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Socket } from 'socket.io';

@Injectable()
export class WebsocketMiddleware implements NestMiddleware {
  constructor(private jwtService: JwtService) {}

  use(socket: Socket, next: (err?: Error) => void) {
    try {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error('Authentication error'));
      }

      const payload = this.jwtService.verify(token);
      socket.data.userId = payload.sub;
      next();
    } catch (error) {
      next(new Error('Authentication error'));
    }
  }
}