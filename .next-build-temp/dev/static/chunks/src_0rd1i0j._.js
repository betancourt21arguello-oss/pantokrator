(globalThis["TURBOPACK"] || (globalThis["TURBOPACK"] = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/src/lib/llama/store.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "useLlamaStore",
    ()=>useLlamaStore
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zustand$2f$esm$2f$react$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/zustand/esm/react.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zustand$2f$esm$2f$middleware$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/zustand/esm/middleware.mjs [app-client] (ecmascript)");
;
;
const useLlamaStore = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zustand$2f$esm$2f$react$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["create"])()((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zustand$2f$esm$2f$middleware$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["persist"])((set, get)=>({
        activeIntention: null,
        isModalOpen: false,
        openModal: ()=>set({
                isModalOpen: true
            }),
        closeModal: ()=>set({
                isModalOpen: false
            }),
        lightCandle: (intention)=>set({
                activeIntention: intention
            }),
        clearCandle: ()=>set({
                activeIntention: null
            }),
        refreshIntensity: async ()=>{
            try {
                const res = await fetch("/api/llama/current");
                if (!res.ok) return;
                const data = await res.json();
                if (data.activeIntention) {
                    set({
                        activeIntention: data.activeIntention
                    });
                } else {
                    set({
                        activeIntention: null
                    });
                }
            } catch (error) {
                console.error("Error al refrescar intensidad de La Llama:", error);
            }
        }
    }), {
    name: "camino.llama",
    partialize: (state)=>({
            activeIntention: state.activeIntention
        })
}));
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/components/llama/LlamaHydrator.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "LlamaHydrator",
    ()=>LlamaHydrator
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$llama$2f$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/llama/store.ts [app-client] (ecmascript)");
var _s = __turbopack_context__.k.signature();
"use client";
;
;
function LlamaHydrator() {
    _s();
    const refreshIntensity = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$llama$2f$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useLlamaStore"])({
        "LlamaHydrator.useLlamaStore[refreshIntensity]": (s)=>s.refreshIntensity
    }["LlamaHydrator.useLlamaStore[refreshIntensity]"]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "LlamaHydrator.useEffect": ()=>{
            refreshIntensity();
        }
    }["LlamaHydrator.useEffect"], [
        refreshIntensity
    ]);
    return null;
}
_s(LlamaHydrator, "wNuMBauYsjHLoM9i9u70G4sVYx8=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$llama$2f$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useLlamaStore"]
    ];
});
_c = LlamaHydrator;
var _c;
__turbopack_context__.k.register(_c, "LlamaHydrator");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/components/llama/IntentionModal.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "IntentionModal",
    ()=>IntentionModal
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$components$2f$AnimatePresence$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/framer-motion/dist/es/components/AnimatePresence/index.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/framer-motion/dist/es/render/components/motion/proxy.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$llama$2f$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/llama/store.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
function IntentionModal() {
    _s();
    const isOpen = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$llama$2f$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useLlamaStore"])({
        "IntentionModal.useLlamaStore[isOpen]": (s)=>s.isModalOpen
    }["IntentionModal.useLlamaStore[isOpen]"]);
    const closeModal = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$llama$2f$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useLlamaStore"])({
        "IntentionModal.useLlamaStore[closeModal]": (s)=>s.closeModal
    }["IntentionModal.useLlamaStore[closeModal]"]);
    const lightCandle = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$llama$2f$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useLlamaStore"])({
        "IntentionModal.useLlamaStore[lightCandle]": (s)=>s.lightCandle
    }["IntentionModal.useLlamaStore[lightCandle]"]);
    const [content, setContent] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("");
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [infoMessage, setInfoMessage] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [isLitAnimation, setIsLitAnimation] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const titleId = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useId"])();
    const inputRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "IntentionModal.useEffect": ()=>{
            if (isOpen) {
                setContent("");
                setInfoMessage(null);
                setIsLitAnimation(false);
                setTimeout({
                    "IntentionModal.useEffect": ()=>inputRef.current?.focus()
                }["IntentionModal.useEffect"], 100);
            }
        }
    }["IntentionModal.useEffect"], [
        isOpen
    ]);
    // Cierre con Escape y trampilla de foco accesible
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "IntentionModal.useEffect": ()=>{
            const handleKeyDown = {
                "IntentionModal.useEffect.handleKeyDown": (e)=>{
                    if (e.key === "Escape" && isOpen) {
                        closeModal();
                    }
                }
            }["IntentionModal.useEffect.handleKeyDown"];
            window.addEventListener("keydown", handleKeyDown);
            return ({
                "IntentionModal.useEffect": ()=>window.removeEventListener("keydown", handleKeyDown)
            })["IntentionModal.useEffect"];
        }
    }["IntentionModal.useEffect"], [
        isOpen,
        closeModal
    ]);
    const handleSubmit = async (e)=>{
        e.preventDefault();
        const trimmed = content.trim();
        if (!trimmed || trimmed.length > 40 || loading) return;
        setLoading(true);
        setInfoMessage(null);
        try {
            const res = await fetch("/api/llama/light", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    content: trimmed
                })
            });
            const data = await res.json();
            if (res.status === 409 && data.activeIntention) {
                lightCandle(data.activeIntention);
                const expires = new Date(data.activeIntention.expiresAt);
                const formattedTime = expires.toLocaleTimeString("es", {
                    hour: "2-digit",
                    minute: "2-digit"
                });
                setInfoMessage(`Ya tienes una vela encendida. Vivirá hasta las ${formattedTime}.`);
                setTimeout(()=>{
                    closeModal();
                }, 2200);
                return;
            }
            if (!res.ok) {
                setInfoMessage(data.error || "No se pudo encender la vela.");
                return;
            }
            if (data.activeIntention) {
                setIsLitAnimation(true);
                lightCandle(data.activeIntention);
                setTimeout(()=>{
                    closeModal();
                }, 1200);
            }
        } catch  {
            setInfoMessage("Ocurrió un error al ofrecer tu intención.");
        } finally{
            setLoading(false);
        }
    };
    if (!isOpen) return null;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$components$2f$AnimatePresence$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["AnimatePresence"], {
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4",
            "aria-modal": "true",
            role: "dialog",
            "aria-labelledby": titleId,
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].div, {
                initial: {
                    opacity: 0,
                    scale: 0.95
                },
                animate: {
                    opacity: 1,
                    scale: 1
                },
                exit: {
                    opacity: 0,
                    scale: 0.95
                },
                transition: {
                    duration: 0.2
                },
                className: "w-full max-w-sm rounded-2xl bg-[#f7f5f0] p-6 shadow-xl text-[#1c1c1e] relative overflow-hidden",
                children: isLitAnimation ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].div, {
                    initial: {
                        scale: 0.8,
                        opacity: 0
                    },
                    animate: {
                        scale: 1,
                        opacity: 1
                    },
                    transition: {
                        duration: 0.6
                    },
                    className: "flex flex-col items-center justify-center py-8 text-center",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "text-5xl mb-3 animate-pulse",
                            children: "🕯️"
                        }, void 0, false, {
                            fileName: "[project]/src/components/llama/IntentionModal.tsx",
                            lineNumber: 115,
                            columnNumber: 15
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            className: "text-base font-serif text-[#1c1c1e]",
                            children: "Tu vela ha sido encendida en la comunidad."
                        }, void 0, false, {
                            fileName: "[project]/src/components/llama/IntentionModal.tsx",
                            lineNumber: 116,
                            columnNumber: 15
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            className: "text-xs text-[#6e6e73] mt-1",
                            children: "Acompañará tu oración durante las próximas horas."
                        }, void 0, false, {
                            fileName: "[project]/src/components/llama/IntentionModal.tsx",
                            lineNumber: 119,
                            columnNumber: 15
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/components/llama/IntentionModal.tsx",
                    lineNumber: 109,
                    columnNumber: 13
                }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex items-center justify-between mb-4",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                    id: titleId,
                                    className: "text-lg font-serif text-[#1c1c1e]",
                                    children: "Ofrecer intención"
                                }, void 0, false, {
                                    fileName: "[project]/src/components/llama/IntentionModal.tsx",
                                    lineNumber: 126,
                                    columnNumber: 17
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    type: "button",
                                    onClick: closeModal,
                                    className: "min-h-[44px] min-w-[44px] flex items-center justify-center text-sm text-[#6e6e73] hover:text-[#1c1c1e] transition-colors",
                                    "aria-label": "Cerrar modal",
                                    children: "✕"
                                }, void 0, false, {
                                    fileName: "[project]/src/components/llama/IntentionModal.tsx",
                                    lineNumber: 129,
                                    columnNumber: 17
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/components/llama/IntentionModal.tsx",
                            lineNumber: 125,
                            columnNumber: 15
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            className: "text-sm text-[#6e6e73] mb-4",
                            children: "Hoy rezas por una persona o intención especial."
                        }, void 0, false, {
                            fileName: "[project]/src/components/llama/IntentionModal.tsx",
                            lineNumber: 139,
                            columnNumber: 15
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("form", {
                            onSubmit: handleSubmit,
                            className: "space-y-4",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "relative",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                            ref: inputRef,
                                            type: "text",
                                            value: content,
                                            onChange: (e)=>setContent(e.target.value),
                                            maxLength: 40,
                                            placeholder: "¿Por quién rezas hoy?",
                                            className: "w-full h-12 px-4 rounded-xl bg-white border border-[#1c1c1e]/10 text-[#1c1c1e] placeholder-[#6e6e73]/60 focus:outline-hidden focus:border-[#7c2d12] text-sm transition-colors"
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/llama/IntentionModal.tsx",
                                            lineNumber: 145,
                                            columnNumber: 19
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "absolute right-3 bottom-3 text-xs text-[#6e6e73]",
                                            children: [
                                                content.length,
                                                "/40"
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/components/llama/IntentionModal.tsx",
                                            lineNumber: 154,
                                            columnNumber: 19
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/components/llama/IntentionModal.tsx",
                                    lineNumber: 144,
                                    columnNumber: 17
                                }, this),
                                infoMessage && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "text-xs text-[#7c2d12] text-center font-medium",
                                    children: infoMessage
                                }, void 0, false, {
                                    fileName: "[project]/src/components/llama/IntentionModal.tsx",
                                    lineNumber: 160,
                                    columnNumber: 19
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "pt-2",
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        type: "submit",
                                        disabled: !content.trim() || content.length > 40 || loading,
                                        className: "w-full h-12 rounded-xl bg-[#7c2d12] text-[#f7f5f0] text-sm font-medium flex items-center justify-center gap-2 disabled:opacity-40 transition-opacity active:scale-[0.98]",
                                        children: loading ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "animate-spin text-base",
                                            children: "🕯️"
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/llama/IntentionModal.tsx",
                                            lineNumber: 172,
                                            columnNumber: 23
                                        }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    children: "🕯️"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/llama/IntentionModal.tsx",
                                                    lineNumber: 175,
                                                    columnNumber: 25
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    children: "Encender vela"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/llama/IntentionModal.tsx",
                                                    lineNumber: 176,
                                                    columnNumber: 25
                                                }, this)
                                            ]
                                        }, void 0, true)
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/llama/IntentionModal.tsx",
                                        lineNumber: 166,
                                        columnNumber: 19
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/src/components/llama/IntentionModal.tsx",
                                    lineNumber: 165,
                                    columnNumber: 17
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/components/llama/IntentionModal.tsx",
                            lineNumber: 143,
                            columnNumber: 15
                        }, this)
                    ]
                }, void 0, true)
            }, void 0, false, {
                fileName: "[project]/src/components/llama/IntentionModal.tsx",
                lineNumber: 101,
                columnNumber: 9
            }, this)
        }, void 0, false, {
            fileName: "[project]/src/components/llama/IntentionModal.tsx",
            lineNumber: 95,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/src/components/llama/IntentionModal.tsx",
        lineNumber: 94,
        columnNumber: 5
    }, this);
}
_s(IntentionModal, "KApgCn/ojc0ZtpuJ8qQ5529qvMk=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$llama$2f$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useLlamaStore"],
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$llama$2f$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useLlamaStore"],
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$llama$2f$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useLlamaStore"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useId"]
    ];
});
_c = IntentionModal;
var _c;
__turbopack_context__.k.register(_c, "IntentionModal");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=src_0rd1i0j._.js.map