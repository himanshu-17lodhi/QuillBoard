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
exports.DocumentsService = void 0;
var common_1 = require("@nestjs/common");
var DocumentsService = /** @class */ (function () {
    function DocumentsService(prisma) {
        this.prisma = prisma;
    }
    DocumentsService.prototype.getDocument = function (userId, documentId) {
        return __awaiter(this, void 0, void 0, function () {
            var document;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.prisma.document.findUnique({
                            where: { id: documentId },
                            include: {
                                workspace: {
                                    include: {
                                        members: {
                                            where: { userId: userId }
                                        }
                                    }
                                }
                            }
                        })];
                    case 1:
                        document = _a.sent();
                        if (!document) {
                            throw new Error('Document not found');
                        }
                        // Check if user has access to the workspace
                        if (!document.workspace || document.workspace.members.length === 0) {
                            throw new common_1.ForbiddenException('You do not have access to this document');
                        }
                        return [2 /*return*/, document];
                }
            });
        });
    };
    DocumentsService.prototype.getDocuments = function (userId, workspaceId) {
        return __awaiter(this, void 0, void 0, function () {
            var workspace;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.prisma.workspace.findUnique({
                            where: { id: workspaceId },
                            include: {
                                members: {
                                    where: { userId: userId }
                                }
                            }
                        })];
                    case 1:
                        workspace = _a.sent();
                        if (!workspace || workspace.members.length === 0) {
                            throw new common_1.ForbiddenException('You do not have access to this workspace');
                        }
                        return [2 /*return*/, this.prisma.document.findMany({
                                where: { workspaceId: workspaceId },
                                orderBy: { updatedAt: 'desc' },
                                include: {
                                    createdByUser: {
                                        select: {
                                            id: true,
                                            email: true,
                                            name: true,
                                            avatarUrl: true
                                        }
                                    }
                                }
                            })];
                }
            });
        });
    };
    DocumentsService.prototype.createDocument = function (userId, workspaceId, title, content) {
        return __awaiter(this, void 0, void 0, function () {
            var workspace;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.prisma.workspace.findUnique({
                            where: { id: workspaceId },
                            include: {
                                members: {
                                    where: { userId: userId }
                                }
                            }
                        })];
                    case 1:
                        workspace = _a.sent();
                        if (!workspace || workspace.members.length === 0) {
                            throw new common_1.ForbiddenException('You do not have access to this workspace');
                        }
                        return [2 /*return*/, this.prisma.document.create({
                                data: {
                                    title: title,
                                    content: content,
                                    workspaceId: workspaceId,
                                    createdBy: userId
                                },
                                include: {
                                    createdByUser: {
                                        select: {
                                            id: true,
                                            email: true,
                                            name: true,
                                            avatarUrl: true
                                        }
                                    }
                                }
                            })];
                }
            });
        });
    };
    DocumentsService.prototype.updateDocument = function (userId, documentId, updates) {
        return __awaiter(this, void 0, void 0, function () {
            var document;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getDocument(userId, documentId)];
                    case 1:
                        document = _a.sent();
                        return [2 /*return*/, this.prisma.document.update({
                                where: { id: documentId },
                                data: updates,
                                include: {
                                    createdByUser: {
                                        select: {
                                            id: true,
                                            email: true,
                                            name: true,
                                            avatarUrl: true
                                        }
                                    }
                                }
                            })];
                }
            });
        });
    };
    DocumentsService.prototype.deleteDocument = function (userId, documentId) {
        return __awaiter(this, void 0, void 0, function () {
            var document, workspace, member;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getDocument(userId, documentId)];
                    case 1:
                        document = _a.sent();
                        return [4 /*yield*/, this.prisma.workspace.findUnique({
                                where: { id: document.workspaceId },
                                include: {
                                    members: {
                                        where: { userId: userId }
                                    }
                                }
                            })];
                    case 2:
                        workspace = _a.sent();
                        // --- FIX IS HERE ---
                        if (!workspace || workspace.members.length === 0) {
                            throw new common_1.ForbiddenException('You do not have permission to delete this document');
                        }
                        member = workspace.members[0];
                        if (member.role !== 'owner' && member.role !== 'editor') {
                            throw new common_1.ForbiddenException('You do not have permission to delete this document');
                        }
                        return [2 /*return*/, this.prisma.document["delete"]({
                                where: { id: documentId }
                            })];
                }
            });
        });
    };
    DocumentsService.prototype.addCollaborator = function (userId, documentId, collaboratorId) {
        return __awaiter(this, void 0, void 0, function () {
            var document, workspace, member;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getDocument(userId, documentId)];
                    case 1:
                        document = _a.sent();
                        return [4 /*yield*/, this.prisma.workspace.findUnique({
                                where: { id: document.workspaceId },
                                include: {
                                    members: {
                                        where: { userId: userId }
                                    }
                                }
                            })];
                    case 2:
                        workspace = _a.sent();
                        // --- FIX IS HERE ---
                        if (!workspace || workspace.members.length === 0) {
                            throw new common_1.ForbiddenException('You do not have permission to add collaborators');
                        }
                        member = workspace.members[0];
                        if (member.role !== 'owner' && member.role !== 'editor') {
                            throw new common_1.ForbiddenException('You do not have permission to add collaborators');
                        }
                        return [2 /*return*/, this.prisma.documentCollaborator.create({
                                data: {
                                    documentId: documentId,
                                    userId: collaboratorId
                                },
                                include: {
                                    user: {
                                        select: {
                                            id: true,
                                            email: true,
                                            name: true,
                                            avatarUrl: true
                                        }
                                    }
                                }
                            })];
                }
            });
        });
    };
    DocumentsService.prototype.removeCollaborator = function (userId, documentId, collaboratorId) {
        return __awaiter(this, void 0, void 0, function () {
            var document, workspace, member;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getDocument(userId, documentId)];
                    case 1:
                        document = _a.sent();
                        return [4 /*yield*/, this.prisma.workspace.findUnique({
                                where: { id: document.workspaceId },
                                include: {
                                    members: {
                                        where: { userId: userId }
                                    }
                                }
                            })];
                    case 2:
                        workspace = _a.sent();
                        // --- FIX IS HERE ---
                        if (!workspace || workspace.members.length === 0) {
                            throw new common_1.ForbiddenException('You do not have permission to remove collaborators');
                        }
                        member = workspace.members[0];
                        if (member.role !== 'owner' && member.role !== 'editor') {
                            throw new common_1.ForbiddenException('You do not have permission to remove collaborators');
                        }
                        return [2 /*return*/, this.prisma.documentCollaborator["delete"]({
                                where: {
                                    documentId_userId: {
                                        documentId: documentId,
                                        userId: collaboratorId
                                    }
                                }
                            })];
                }
            });
        });
    };
    DocumentsService.prototype.getCollaborators = function (userId, documentId) {
        return __awaiter(this, void 0, void 0, function () {
            var document;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getDocument(userId, documentId)];
                    case 1:
                        document = _a.sent();
                        return [2 /*return*/, this.prisma.documentCollaborator.findMany({
                                where: { documentId: documentId },
                                include: {
                                    user: {
                                        select: {
                                            id: true,
                                            email: true,
                                            name: true,
                                            avatarUrl: true
                                        }
                                    }
                                },
                                orderBy: { joinedAt: 'desc' }
                            })];
                }
            });
        });
    };
    DocumentsService = __decorate([
        (0, common_1.Injectable)()
    ], DocumentsService);
    return DocumentsService;
}());
exports.DocumentsService = DocumentsService;
