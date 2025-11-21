"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
exports.__esModule = true;
exports.WorkspacesController = void 0;
// backend/src/workspaces/workspaces.controller.ts
var common_1 = require("@nestjs/common");
var passport_1 = require("@nestjs/passport");
var WorkspacesController = /** @class */ (function () {
    function WorkspacesController(workspacesService) {
        this.workspacesService = workspacesService;
    }
    WorkspacesController.prototype.getWorkspaces = function (req) {
        return this.workspacesService.getUserWorkspaces(req.user.id);
    };
    WorkspacesController.prototype.getWorkspace = function (req, id) {
        return this.workspacesService.getWorkspace(req.user.id, id);
    };
    WorkspacesController.prototype.createWorkspace = function (req, body) {
        return this.workspacesService.createWorkspace(req.user.id, body.name);
    };
    WorkspacesController.prototype.updateWorkspace = function (req, id, body) {
        return this.workspacesService.updateWorkspace(req.user.id, id, body.name);
    };
    WorkspacesController.prototype.deleteWorkspace = function (req, id) {
        return this.workspacesService.deleteWorkspace(req.user.id, id);
    };
    WorkspacesController.prototype.inviteToWorkspace = function (req, id, body) {
        return this.workspacesService.inviteToWorkspace(req.user.id, id, body.email, body.role);
    };
    WorkspacesController.prototype.removeFromWorkspace = function (req, id, memberId) {
        return this.workspacesService.removeFromWorkspace(req.user.id, id, memberId);
    };
    __decorate([
        (0, common_1.Get)(),
        __param(0, (0, common_1.Request)())
    ], WorkspacesController.prototype, "getWorkspaces");
    __decorate([
        (0, common_1.Get)(':id'),
        __param(0, (0, common_1.Request)()),
        __param(1, (0, common_1.Param)('id'))
    ], WorkspacesController.prototype, "getWorkspace");
    __decorate([
        (0, common_1.Post)(),
        __param(0, (0, common_1.Request)()),
        __param(1, (0, common_1.Body)())
    ], WorkspacesController.prototype, "createWorkspace");
    __decorate([
        (0, common_1.Put)(':id'),
        __param(0, (0, common_1.Request)()),
        __param(1, (0, common_1.Param)('id')),
        __param(2, (0, common_1.Body)())
    ], WorkspacesController.prototype, "updateWorkspace");
    __decorate([
        (0, common_1.Delete)(':id'),
        __param(0, (0, common_1.Request)()),
        __param(1, (0, common_1.Param)('id'))
    ], WorkspacesController.prototype, "deleteWorkspace");
    __decorate([
        (0, common_1.Post)(':id/invite'),
        __param(0, (0, common_1.Request)()),
        __param(1, (0, common_1.Param)('id')),
        __param(2, (0, common_1.Body)())
    ], WorkspacesController.prototype, "inviteToWorkspace");
    __decorate([
        (0, common_1.Delete)(':id/members/:memberId'),
        __param(0, (0, common_1.Request)()),
        __param(1, (0, common_1.Param)('id')),
        __param(2, (0, common_1.Param)('memberId'))
    ], WorkspacesController.prototype, "removeFromWorkspace");
    WorkspacesController = __decorate([
        (0, common_1.Controller)('workspaces'),
        (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt'))
    ], WorkspacesController);
    return WorkspacesController;
}());
exports.WorkspacesController = WorkspacesController;
