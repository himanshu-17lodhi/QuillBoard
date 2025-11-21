"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
exports.__esModule = true;
exports.AppModule = void 0;
var common_1 = require("@nestjs/common");
var config_1 = require("@nestjs/config"); // <-- 1. Import this
var auth_module_1 = require("./auth/auth.module");
var users_module_1 = require("./users/users.module");
var workspaces_module_1 = require("./workspaces/workspaces.module");
var documents_module_1 = require("./documents/documents.module");
// import { CollaborationModule } from './collaboration/collaboration.module'; // Still commented out, which is correct
var AppModule = /** @class */ (function () {
    function AppModule() {
    }
    AppModule = __decorate([
        (0, common_1.Module)({
            imports: [
                config_1.ConfigModule.forRoot({ isGlobal: true }),
                auth_module_1.AuthModule,
                users_module_1.UsersModule,
                workspaces_module_1.WorkspacesModule,
                documents_module_1.DocumentsModule,
                // CollaborationModule,
            ]
        })
    ], AppModule);
    return AppModule;
}());
exports.AppModule = AppModule;
