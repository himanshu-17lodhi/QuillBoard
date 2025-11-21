"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
exports.CollaborationGateway = void 0;
// backend/src/collaboration/collaboration.gateway.ts
var websockets_1 = require("@nestjs/websockets");
var CollaborationGateway = /** @class */ (function () {
    function CollaborationGateway(jwtService, prisma) {
        this.jwtService = jwtService;
        this.prisma = prisma;
    }
    CollaborationGateway.prototype.handleConnection = function (client) {
        return __awaiter(this, void 0, void 0, function () {
            var token, payload;
            return __generator(this, function (_a) {
                try {
                    token = client.handshake.auth.token;
                    payload = this.jwtService.verify(token);
                    client.data.userId = payload.sub;
                    console.log("Client connected: ".concat(client.id, ", User: ").concat(payload.sub));
                }
                catch (error) {
                    console.error('Authentication error:', error);
                    client.disconnect();
                }
                return [2 /*return*/];
            });
        });
    };
    CollaborationGateway.prototype.handleDisconnect = function (client) {
        console.log("Client disconnected: ".concat(client.id));
    };
    CollaborationGateway.prototype.handleJoinDocument = function (client, documentId) {
        return __awaiter(this, void 0, void 0, function () {
            var collaborators;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        client.join(documentId);
                        console.log("User ".concat(client.data.userId, " joined document ").concat(documentId));
                        // Add user to document collaborators
                        return [4 /*yield*/, this.prisma.documentCollaborator.upsert({
                                where: {
                                    documentId_userId: {
                                        documentId: documentId,
                                        userId: client.data.userId
                                    }
                                },
                                create: {
                                    documentId: documentId,
                                    userId: client.data.userId
                                },
                                update: {
                                    joinedAt: new Date()
                                }
                            })];
                    case 1:
                        // Add user to document collaborators
                        _a.sent();
                        // Notify other users about the new collaborator
                        client.to(documentId).emit('user-joined', {
                            userId: client.data.userId,
                            clientId: client.id
                        });
                        return [4 /*yield*/, this.prisma.documentCollaborator.findMany({
                                where: { documentId: documentId },
                                include: { user: true }
                            })];
                    case 2:
                        collaborators = _a.sent();
                        // Send current collaborators to the new user
                        client.emit('current-collaborators', collaborators.map(function (c) { return ({
                            userId: c.userId,
                            clientId: null,
                            user: c.user
                        }); }));
                        return [2 /*return*/];
                }
            });
        });
    };
    CollaborationGateway.prototype.handleLeaveDocument = function (client, documentId) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        client.leave(documentId);
                        console.log("User ".concat(client.data.userId, " left document ").concat(documentId));
                        // Remove user from document collaborators
                        return [4 /*yield*/, this.prisma.documentCollaborator.deleteMany({
                                where: {
                                    documentId: documentId,
                                    userId: client.data.userId
                                }
                            })];
                    case 1:
                        // Remove user from document collaborators
                        _a.sent();
                        // Notify other users
                        client.to(documentId).emit('user-left', {
                            userId: client.data.userId,
                            clientId: client.id
                        });
                        return [2 /*return*/];
                }
            });
        });
    };
    CollaborationGateway.prototype.handleContentUpdate = function (client, data) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        // Broadcast update to all other clients in the same document
                        client.to(data.documentId).emit('content-updated', {
                            content: data.content,
                            userId: client.data.userId
                        });
                        // Debounce database updates to avoid too many writes
                        // In a real application, you'd implement proper debouncing
                        return [4 /*yield*/, this.updateDocumentContent(data.documentId, data.content)];
                    case 1:
                        // Debounce database updates to avoid too many writes
                        // In a real application, you'd implement proper debouncing
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    CollaborationGateway.prototype.updateDocumentContent = function (documentId, content) {
        return __awaiter(this, void 0, void 0, function () {
            var error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.prisma.document.update({
                                where: { id: documentId },
                                data: { content: content, updatedAt: new Date() }
                            })];
                    case 1:
                        _a.sent();
                        return [3 /*break*/, 3];
                    case 2:
                        error_1 = _a.sent();
                        console.error('Error updating document content:', error_1);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    __decorate([
        (0, websockets_1.WebSocketServer)()
    ], CollaborationGateway.prototype, "server");
    __decorate([
        (0, websockets_1.SubscribeMessage)('join-document')
    ], CollaborationGateway.prototype, "handleJoinDocument");
    __decorate([
        (0, websockets_1.SubscribeMessage)('leave-document')
    ], CollaborationGateway.prototype, "handleLeaveDocument");
    __decorate([
        (0, websockets_1.SubscribeMessage)('update-content')
    ], CollaborationGateway.prototype, "handleContentUpdate");
    CollaborationGateway = __decorate([
        (0, websockets_1.WebSocketGateway)({
            cors: {
                origin: process.env.FRONTEND_URL || 'http://localhost:3000',
                credentials: true
            }
        })
    ], CollaborationGateway);
    return CollaborationGateway;
}());
exports.CollaborationGateway = CollaborationGateway;
