module.exports = [
"[externals]/fs [external] (fs, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("fs", () => require("fs"));

module.exports = mod;
}),
"[externals]/stream [external] (stream, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("stream", () => require("stream"));

module.exports = mod;
}),
"[externals]/zlib [external] (zlib, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("zlib", () => require("zlib"));

module.exports = mod;
}),
"[externals]/react-dom [external] (react-dom, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("react-dom", () => require("react-dom"));

module.exports = mod;
}),
"[project]/frontend/src/stores/useStore.ts [ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// frontend/stores/useStore.ts
__turbopack_context__.s([
    "useStore",
    ()=>useStore
]);
(()=>{
    const e = new Error("Cannot find module 'zustand'");
    e.code = 'MODULE_NOT_FOUND';
    throw e;
})();
(()=>{
    const e = new Error("Cannot find module 'zustand/middleware'");
    e.code = 'MODULE_NOT_FOUND';
    throw e;
})();
;
;
const useStore = create()(persist((set)=>({
        user: null,
        workspaces: [],
        currentWorkspace: null,
        documents: [],
        currentDocument: null,
        setUser: (user)=>set({
                user
            }),
        setWorkspaces: (workspaces)=>set({
                workspaces
            }),
        setCurrentWorkspace: (currentWorkspace)=>set({
                currentWorkspace
            }),
        setDocuments: (documents)=>set({
                documents
            }),
        setCurrentDocument: (currentDocument)=>set({
                currentDocument
            }),
        addDocument: (document)=>set((state)=>({
                    documents: [
                        ...state.documents,
                        document
                    ]
                })),
        updateDocument: (id, updates)=>set((state)=>({
                    documents: state.documents.map((doc)=>doc.id === id ? {
                            ...doc,
                            ...updates
                        } : doc),
                    currentDocument: state.currentDocument?.id === id ? {
                        ...state.currentDocument,
                        ...updates
                    } : state.currentDocument
                })),
        deleteDocument: (id)=>set((state)=>({
                    documents: state.documents.filter((doc)=>doc.id !== id),
                    currentDocument: state.currentDocument?.id === id ? null : state.currentDocument
                }))
    }), {
    name: 'app-storage',
    partialize: (state)=>({
            user: state.user,
            workspaces: state.workspaces,
            currentWorkspace: state.currentWorkspace
        })
}));
}),
"[project]/frontend/pages/index.tsx [ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// frontend/pages/index.tsx
__turbopack_context__.s([
    "default",
    ()=>Home
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/react/jsx-dev-runtime [external] (react/jsx-dev-runtime, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/react [external] (react, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$router$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/router.js [ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$src$2f$stores$2f$useStore$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/frontend/src/stores/useStore.ts [ssr] (ecmascript)");
;
;
;
;
function Home() {
    const router = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$router$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__["useRouter"])();
    const user = (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$src$2f$stores$2f$useStore$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__["useStore"])((state)=>state.user);
    (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useEffect"])(()=>{
        if (user) {
            router.push('/dashboard');
        } else {
            router.push('/auth/login');
        }
    }, [
        user,
        router
    ]);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
        className: "min-h-screen bg-gray-900 flex items-center justify-center",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
            className: "animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"
        }, void 0, false, {
            fileName: "[project]/frontend/pages/index.tsx",
            lineNumber: 20,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/frontend/pages/index.tsx",
        lineNumber: 19,
        columnNumber: 5
    }, this);
}
}),
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__77f67629._.js.map