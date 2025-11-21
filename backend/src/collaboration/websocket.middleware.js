"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
exports.__esModule = true;
exports.WebsocketMiddleware = void 0;
// backend/src/collaboration/websocket.middleware.ts
var common_1 = require("@nestjs/common");
var WebsocketMiddleware = /** @class */ (function () {
    function WebsocketMiddleware(jwtService) {
        this.jwtService = jwtService;
    }
    WebsocketMiddleware.prototype.use = function (socket, next) {
        try {
            var token = socket.handshake.auth.token;
            if (!token) {
                return next(new Error('Authentication error'));
            }
            var payload = this.jwtService.verify(token);
            socket.data.userId = payload.sub;
            next();
        }
        catch (error) {
            next(new Error('Authentication error'));
        }
    };
    WebsocketMiddleware = __decorate([
        (0, common_1.Injectable)()
    ], WebsocketMiddleware);
    return WebsocketMiddleware;
}());
exports.WebsocketMiddleware = WebsocketMiddleware;
