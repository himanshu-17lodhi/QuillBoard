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
exports.WorkspacesService = void 0;
// backend/src/workspaces/workspaces.service.ts
var common_1 = require("@nestjs/common");
var WorkspacesService = /** @class */ (function () {
    function WorkspacesService(prisma) {
        this.prisma = prisma;
    }
    WorkspacesService.prototype.getUserWorkspaces = function (userId) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.prisma.workspace.findMany({
                        where: {
                            members: {
                                some: {
                                    userId: userId
                                }
                            }
                        },
                        include: {
                            members: {
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
                            },
                            _count: {
                                select: {
                                    documents: true
                                }
                            }
                        }
                    })];
            });
        });
    };
    WorkspacesService.prototype.getWorkspace = function (userId, workspaceId) {
        return __awaiter(this, void 0, void 0, function () {
            var workspace, hasAccess;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.prisma.workspace.findUnique({
                            where: { id: workspaceId },
                            include: {
                                members: {
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
                                }
                            }
                        })];
                    case 1:
                        workspace = _a.sent();
                        if (!workspace) {
                            throw new Error('Workspace not found');
                        }
                        hasAccess = workspace.members.some(function (member) { return member.userId === userId; });
                        if (!hasAccess) {
                            throw new common_1.ForbiddenException('You do not have access to this workspace');
                        }
                        return [2 /*return*/, workspace];
                }
            });
        });
    };
    WorkspacesService.prototype.createWorkspace = function (userId, name) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.prisma.workspace.create({
                        data: {
                            name: name,
                            ownerId: userId,
                            members: {
                                create: {
                                    userId: userId,
                                    role: 'owner'
                                }
                            }
                        },
                        include: {
                            members: {
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
                            }
                        }
                    })];
            });
        });
    };
    WorkspacesService.prototype.updateWorkspace = function (userId, workspaceId, name) {
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
                        if (workspace.ownerId !== userId) {
                            throw new common_1.ForbiddenException('Only the owner can update the workspace');
                        }
                        return [2 /*return*/, this.prisma.workspace.update({
                                where: { id: workspaceId },
                                data: { name: name }
                            })];
                }
            });
        });
    };
    WorkspacesService.prototype.deleteWorkspace = function (userId, workspaceId) {
        return __awaiter(this, void 0, void 0, function () {
            var workspace;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.prisma.workspace.findUnique({
                            where: { id: workspaceId }
                        })];
                    case 1:
                        workspace = _a.sent();
                        if (!workspace) {
                            throw new Error('Workspace not found');
                        }
                        if (workspace.ownerId !== userId) {
                            throw new common_1.ForbiddenException('Only the owner can delete the workspace');
                        }
                        return [2 /*return*/, this.prisma.workspace["delete"]({
                                where: { id: workspaceId }
                            })];
                }
            });
        });
    };
    WorkspacesService.prototype.inviteToWorkspace = function (ownerId, workspaceId, email, role) {
        return __awaiter(this, void 0, void 0, function () {
            var workspace, user, existingMember;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.prisma.workspace.findUnique({
                            where: { id: workspaceId }
                        })];
                    case 1:
                        workspace = _a.sent();
                        if (!workspace || workspace.ownerId !== ownerId) {
                            throw new common_1.ForbiddenException('Only the owner can invite members');
                        }
                        return [4 /*yield*/, this.prisma.user.findUnique({
                                where: { email: email }
                            })];
                    case 2:
                        user = _a.sent();
                        if (!user) {
                            throw new Error('User not found');
                        }
                        return [4 /*yield*/, this.prisma.workspaceMember.findUnique({
                                where: {
                                    workspaceId_userId: {
                                        workspaceId: workspaceId,
                                        userId: user.id
                                    }
                                }
                            })];
                    case 3:
                        existingMember = _a.sent();
                        if (existingMember) {
                            throw new Error('User is already a member of this workspace');
                        }
                        return [2 /*return*/, this.prisma.workspaceMember.create({
                                data: {
                                    workspaceId: workspaceId,
                                    userId: user.id,
                                    role: role
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
    WorkspacesService.prototype.removeFromWorkspace = function (ownerId, workspaceId, memberId) {
        return __awaiter(this, void 0, void 0, function () {
            var workspace;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.prisma.workspace.findUnique({
                            where: { id: workspaceId }
                        })];
                    case 1:
                        workspace = _a.sent();
                        if (!workspace || workspace.ownerId !== ownerId) {
                            throw new common_1.ForbiddenException('Only the owner can remove members');
                        }
                        // Cannot remove yourself
                        if (ownerId === memberId) {
                            throw new common_1.ForbiddenException('Cannot remove yourself from the workspace');
                        }
                        return [2 /*return*/, this.prisma.workspaceMember["delete"]({
                                where: {
                                    workspaceId_userId: {
                                        workspaceId: workspaceId,
                                        userId: memberId
                                    }
                                }
                            })];
                }
            });
        });
    };
    WorkspacesService = __decorate([
        (0, common_1.Injectable)()
    ], WorkspacesService);
    return WorkspacesService;
}());
exports.WorkspacesService = WorkspacesService;
