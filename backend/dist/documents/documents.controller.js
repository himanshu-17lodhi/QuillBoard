"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DocumentsController = void 0;
const common_1 = require("@nestjs/common");
const passport_1 = require("@nestjs/passport");
const documents_service_1 = require("./documents.service");
let DocumentsController = class DocumentsController {
    constructor(documentsService) {
        this.documentsService = documentsService;
    }
    async getDocuments(req, workspaceId) {
        return this.documentsService.getDocuments(req.user.id, workspaceId);
    }
    async getDocument(req, documentId) {
        return this.documentsService.getDocument(req.user.id, documentId);
    }
    async createDocument(req, workspaceId, body) {
        return this.documentsService.createDocument(req.user.id, workspaceId, body.title, body.content);
    }
    async updateDocument(req, documentId, updates) {
        return this.documentsService.updateDocument(req.user.id, documentId, updates);
    }
    async deleteDocument(req, documentId) {
        return this.documentsService.deleteDocument(req.user.id, documentId);
    }
};
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('workspaceId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], DocumentsController.prototype, "getDocuments", null);
__decorate([
    (0, common_1.Get)(':documentId'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('documentId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], DocumentsController.prototype, "getDocument", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('workspaceId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], DocumentsController.prototype, "createDocument", null);
__decorate([
    (0, common_1.Put)(':documentId'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('documentId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], DocumentsController.prototype, "updateDocument", null);
__decorate([
    (0, common_1.Delete)(':documentId'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('documentId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], DocumentsController.prototype, "deleteDocument", null);
DocumentsController = __decorate([
    (0, common_1.Controller)('workspaces/:workspaceId/documents'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    __metadata("design:paramtypes", [documents_service_1.DocumentsService])
], DocumentsController);
exports.DocumentsController = DocumentsController;
//# sourceMappingURL=documents.controller.js.map