(globalThis["TURBOPACK"] || (globalThis["TURBOPACK"] = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/src/hooks/useProgressiveAuth.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "useProgressiveAuth",
    ()=>useProgressiveAuth
]);
// ============================================================================
// CAMINO · Hook de Autenticación Progresiva (frontend)
// ----------------------------------------------------------------------------
// Expone:
//   - profile:      perfil del peregrino (anónimo o vinculado)
//   - isAnonymous:  true mientras no haya email vinculado (la UI debe avisar)
//   - loading:      estado de carga inicial
//   - linkEmail():  vincula un email conservando el progreso
//   - refresh():    recarga el perfil
//
// El usuario se inicializa de forma anónima automáticamente al montar
// (cero fricción). No hay pantalla de login obligatoria.
// ============================================================================
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var _s = __turbopack_context__.k.signature();
"use client";
;
function useProgressiveAuth() {
    _s();
    const [profile, setProfile] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(true);
    const [error, setError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const refresh = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "useProgressiveAuth.useCallback[refresh]": async ()=>{
            try {
                const res = await fetch("/api/auth/session", {
                    method: "GET",
                    credentials: "include",
                    cache: "no-store"
                });
                const data = await res.json();
                if (data.ok) {
                    setProfile(data.profile);
                    setError(null);
                } else {
                    setError(data.error ?? "No se pudo cargar la sesión.");
                }
            } catch  {
                setError("Sin conexión. Reintentando…");
            } finally{
                setLoading(false);
            }
        }
    }["useProgressiveAuth.useCallback[refresh]"], []);
    // Inicialización anónima automática al montar.
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "useProgressiveAuth.useEffect": ()=>{
            void refresh();
        }
    }["useProgressiveAuth.useEffect"], [
        refresh
    ]);
    const linkEmail = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "useProgressiveAuth.useCallback[linkEmail]": async (email, displayName)=>{
            try {
                const res = await fetch("/api/auth/link-email", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    credentials: "include",
                    body: JSON.stringify({
                        email,
                        displayName
                    })
                });
                const data = await res.json();
                if (data.ok) {
                    setProfile({
                        "useProgressiveAuth.useCallback[linkEmail]": (prev)=>({
                                ...prev ?? {},
                                ...data.profile
                            })
                    }["useProgressiveAuth.useCallback[linkEmail]"]);
                    return {
                        ok: true
                    };
                }
                return {
                    ok: false,
                    error: data.error
                };
            } catch  {
                return {
                    ok: false,
                    error: "No se pudo vincular el email."
                };
            }
        }
    }["useProgressiveAuth.useCallback[linkEmail]"], []);
    return {
        profile,
        isAnonymous: profile?.isAnonymous ?? true,
        loading,
        error,
        linkEmail,
        refresh
    };
}
_s(useProgressiveAuth, "f+jlEMxqEL4kZhpMOWkA83ve0Bs=");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/hooks/usePrayerExperience.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "usePrayerExperience",
    ()=>usePrayerExperience
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var _s = __turbopack_context__.k.signature();
"use client";
;
const VIBRATION_DURATION = 50;
const AUTO_ADVANCE_PHRASES = [
    "ahora y en la hora de nuestra muerte amén",
    "ahora y en la hora de nuestra muerte",
    "amén"
];
function hashString(str) {
    let hash = 0;
    for(let i = 0; i < str.length; i++){
        const char = str.charCodeAt(i);
        hash = (hash << 5) - hash + char;
        hash = hash & hash;
    }
    return Math.abs(hash);
}
function detectCompletion(transcript) {
    const lower = transcript.toLowerCase();
    return AUTO_ADVANCE_PHRASES.some((phrase)=>lower.includes(phrase));
}
function usePrayerExperience({ targetCount = 10, profileId, displayName = "Peregrino", onComplete, onSync } = {}) {
    _s();
    const [count, setCount] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(0);
    const [isResponding, setIsResponding] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [voiceEnabled, setVoiceEnabled] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [isListening, setIsListening] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [transcript, setTranscript] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("");
    const recognitionRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const respondingTimeoutRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const lastSpokenCountRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(0);
    const progress = targetCount > 0 ? count / targetCount * 100 : 0;
    const triggerPrayer = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "usePrayerExperience.useCallback[triggerPrayer]": ()=>{
            setCount({
                "usePrayerExperience.useCallback[triggerPrayer]": (prev)=>{
                    const next = Math.min(prev + 1, targetCount);
                    if (navigator.vibrate) {
                        navigator.vibrate(VIBRATION_DURATION);
                    }
                    setIsResponding(true);
                    if (respondingTimeoutRef.current) clearTimeout(respondingTimeoutRef.current);
                    respondingTimeoutRef.current = setTimeout({
                        "usePrayerExperience.useCallback[triggerPrayer]": ()=>setIsResponding(false)
                    }["usePrayerExperience.useCallback[triggerPrayer]"], 2000);
                    if (onSync) onSync(next);
                    if (next >= targetCount && onComplete) onComplete();
                    return next;
                }
            }["usePrayerExperience.useCallback[triggerPrayer]"]);
        }
    }["usePrayerExperience.useCallback[triggerPrayer]"], [
        targetCount,
        onComplete,
        onSync
    ]);
    const reset = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "usePrayerExperience.useCallback[reset]": ()=>{
            setCount(0);
            setIsResponding(false);
            setTranscript("");
            lastSpokenCountRef.current = 0;
        }
    }["usePrayerExperience.useCallback[reset]"], []);
    const toggleVoice = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "usePrayerExperience.useCallback[toggleVoice]": ()=>{
            setVoiceEnabled({
                "usePrayerExperience.useCallback[toggleVoice]": (prev)=>!prev
            }["usePrayerExperience.useCallback[toggleVoice]"]);
        }
    }["usePrayerExperience.useCallback[toggleVoice]"], []);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "usePrayerExperience.useEffect": ()=>{
            if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
            ;
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            if (!SpeechRecognition) {
                console.warn("Web Speech API no soportada en este navegador");
                return;
            }
            const recognition = new SpeechRecognition();
            recognition.continuous = true;
            recognition.interimResults = true;
            recognition.lang = "es-ES";
            recognition.maxAlternatives = 1;
            recognition.onresult = ({
                "usePrayerExperience.useEffect": (event)=>{
                    let finalTranscript = "";
                    let interimTranscript = "";
                    for(let i = event.resultIndex; i < event.results.length; i++){
                        const result = event.results[i];
                        if (result.isFinal) {
                            finalTranscript += result[0].transcript;
                        } else {
                            interimTranscript += result[0].transcript;
                        }
                    }
                    const fullText = finalTranscript || interimTranscript;
                    setTranscript(fullText);
                    if (finalTranscript && detectCompletion(finalTranscript)) {
                        const newCount = lastSpokenCountRef.current + 1;
                        if (newCount <= targetCount && newCount > count) {
                            lastSpokenCountRef.current = newCount;
                            triggerPrayer();
                        }
                    }
                }
            })["usePrayerExperience.useEffect"];
            recognition.onerror = ({
                "usePrayerExperience.useEffect": (event)=>{
                    if (event.error !== "no-speech") {
                        console.error("Error en reconocimiento de voz:", event.error);
                    }
                    setIsListening(false);
                }
            })["usePrayerExperience.useEffect"];
            recognition.onend = ({
                "usePrayerExperience.useEffect": ()=>{
                    setIsListening(false);
                    if (voiceEnabled) {
                        try {
                            recognition.start();
                            setIsListening(true);
                        } catch  {
                            setIsListening(false);
                        }
                    }
                }
            })["usePrayerExperience.useEffect"];
            recognitionRef.current = recognition;
            if (voiceEnabled) {
                try {
                    recognition.start();
                    setIsListening(true);
                } catch  {
                    setIsListening(false);
                }
            }
            return ({
                "usePrayerExperience.useEffect": ()=>{
                    if (recognitionRef.current) {
                        recognitionRef.current.abort();
                        recognitionRef.current = null;
                    }
                    if (respondingTimeoutRef.current) clearTimeout(respondingTimeoutRef.current);
                }
            })["usePrayerExperience.useEffect"];
        }
    }["usePrayerExperience.useEffect"], [
        voiceEnabled,
        targetCount,
        count,
        triggerPrayer
    ]);
    return {
        count,
        isResponding,
        voiceEnabled,
        isListening,
        transcript,
        triggerPrayer,
        toggleVoice,
        reset,
        progress
    };
}
_s(usePrayerExperience, "ZYXCuIk1Ay1pEDwkc6CC0FwKU4o=");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/components/rosario/CommunityTreeSVG.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "CommunityTreeSVG",
    ()=>CommunityTreeSVG
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
const SACRED_PALETTE = [
    "#C6A15B",
    "#5E81AC",
    "#FAF8F5",
    "#8B7355",
    "#A0C4E8",
    "#D4AF37",
    "#7BA3A8",
    "#E8DCC4"
];
function deterministicHash(str) {
    let hash = 0;
    for(let i = 0; i < str.length; i++){
        const char = str.charCodeAt(i);
        hash = (hash << 5) - hash + char;
        hash = hash & hash;
    }
    return Math.abs(hash);
}
function getLeafColor(seed) {
    return SACRED_PALETTE[seed % SACRED_PALETTE.length];
}
function getLeafShape(seed) {
    const shapes = [
        "M 0 0 Q 3 -4 0 -8 Q -3 -4 0 0",
        "M 0 0 Q 4 -3 2 -7 Q -2 -7 -2 -3 Q 0 0",
        "M 0 0 Q 3 -5 0 -9 Q -3 -5 0 0",
        "M 0 0 Q 2 -3 0 -6 Q -2 -3 0 0",
        "M 0 0 Q 5 -4 3 -8 Q -3 -8 -5 -4 Q 0 0"
    ];
    return shapes[seed % shapes.length];
}
function getLeafPosition(index, total, seed) {
    const baseY = 40 + seed % 60;
    const spread = 120 + seed % 40;
    const x = 100 + index / Math.max(total, 1) * spread - spread / 2 + (seed % 20 - 10);
    const y = baseY + Math.sin(index / Math.max(total, 1) * Math.PI * 2) * 30;
    const rotation = seed % 360 - 180;
    return {
        x,
        y,
        rotation
    };
}
function CommunityTreeSVG({ participants, currentUserId, width = 400, height = 500 }) {
    _s();
    const leaves = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "CommunityTreeSVG.useMemo[leaves]": ()=>{
            if (!participants || participants.length === 0) return [];
            return participants.map({
                "CommunityTreeSVG.useMemo[leaves]": (participant, index)=>{
                    const gardenSeed = (participant.seedsFaith || 0) + (participant.seedsHope || 0) * 10 + (participant.seedsCharity || 0) * 100;
                    const hashInput = `${participant.id}-${gardenSeed}`;
                    const seed = deterministicHash(hashInput);
                    const color = getLeafColor(seed);
                    const shape = getLeafShape(seed);
                    const { x, y, rotation } = getLeafPosition(index, participants.length, seed);
                    const isCurrentUser = participant.id === currentUserId;
                    return {
                        id: participant.id,
                        x,
                        y,
                        rotation,
                        color,
                        shape,
                        opacity: isCurrentUser ? 1 : 0.7 + seed % 3 * 0.1,
                        scale: isCurrentUser ? 1.2 : 0.9 + seed % 4 * 0.1,
                        displayName: participant.displayName
                    };
                }
            }["CommunityTreeSVG.useMemo[leaves]"]);
        }
    }["CommunityTreeSVG.useMemo[leaves]"], [
        participants,
        currentUserId
    ]);
    const trunkPath = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "CommunityTreeSVG.useMemo[trunkPath]": ()=>{
            return `M 200 480 Q 200 400 200 350 Q 190 300 180 250 Q 170 200 175 150`;
        }
    }["CommunityTreeSVG.useMemo[trunkPath]"], []);
    const branchLeft = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "CommunityTreeSVG.useMemo[branchLeft]": ()=>{
            return `M 200 350 Q 150 320 120 280 Q 100 240 90 200`;
        }
    }["CommunityTreeSVG.useMemo[branchLeft]"], []);
    const branchRight = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "CommunityTreeSVG.useMemo[branchRight]": ()=>{
            return `M 200 350 Q 250 320 280 280 Q 300 240 310 200`;
        }
    }["CommunityTreeSVG.useMemo[branchRight]"], []);
    const totalLeaves = leaves.length;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
        width: width,
        height: height,
        viewBox: "0 0 400 500",
        xmlns: "http://www.w3.org/2000/svg",
        className: "select-none",
        "aria-hidden": "true",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("defs", {
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("filter", {
                        id: "leafGlow",
                        x: "-50%",
                        y: "-50%",
                        width: "200%",
                        height: "200%",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("feGaussianBlur", {
                                stdDeviation: "2",
                                result: "blur"
                            }, void 0, false, {
                                fileName: "[project]/src/components/rosario/CommunityTreeSVG.tsx",
                                lineNumber: 130,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("feMerge", {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("feMergeNode", {
                                        in: "blur"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/rosario/CommunityTreeSVG.tsx",
                                        lineNumber: 132,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("feMergeNode", {
                                        in: "SourceGraphic"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/rosario/CommunityTreeSVG.tsx",
                                        lineNumber: 133,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/rosario/CommunityTreeSVG.tsx",
                                lineNumber: 131,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/rosario/CommunityTreeSVG.tsx",
                        lineNumber: 129,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("linearGradient", {
                        id: "trunkGradient",
                        x1: "0%",
                        y1: "0%",
                        x2: "0%",
                        y2: "100%",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("stop", {
                                offset: "0%",
                                stopColor: "#8B7355",
                                stopOpacity: "0.8"
                            }, void 0, false, {
                                fileName: "[project]/src/components/rosario/CommunityTreeSVG.tsx",
                                lineNumber: 137,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("stop", {
                                offset: "100%",
                                stopColor: "#5C4A3A",
                                stopOpacity: "0.9"
                            }, void 0, false, {
                                fileName: "[project]/src/components/rosario/CommunityTreeSVG.tsx",
                                lineNumber: 138,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/rosario/CommunityTreeSVG.tsx",
                        lineNumber: 136,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/rosario/CommunityTreeSVG.tsx",
                lineNumber: 128,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("rect", {
                width: width,
                height: height,
                fill: "transparent"
            }, void 0, false, {
                fileName: "[project]/src/components/rosario/CommunityTreeSVG.tsx",
                lineNumber: 142,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("g", {
                opacity: "0.6",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                        d: trunkPath,
                        fill: "none",
                        stroke: "url(#trunkGradient)",
                        strokeWidth: "4",
                        strokeLinecap: "round"
                    }, void 0, false, {
                        fileName: "[project]/src/components/rosario/CommunityTreeSVG.tsx",
                        lineNumber: 145,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                        d: branchLeft,
                        fill: "none",
                        stroke: "url(#trunkGradient)",
                        strokeWidth: "3",
                        strokeLinecap: "round"
                    }, void 0, false, {
                        fileName: "[project]/src/components/rosario/CommunityTreeSVG.tsx",
                        lineNumber: 146,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                        d: branchRight,
                        fill: "none",
                        stroke: "url(#trunkGradient)",
                        strokeWidth: "3",
                        strokeLinecap: "round"
                    }, void 0, false, {
                        fileName: "[project]/src/components/rosario/CommunityTreeSVG.tsx",
                        lineNumber: 147,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/rosario/CommunityTreeSVG.tsx",
                lineNumber: 144,
                columnNumber: 7
            }, this),
            leaves.map((leaf)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("g", {
                    transform: `translate(${leaf.x}, ${leaf.y}) rotate(${leaf.rotation}) scale(${leaf.scale})`,
                    opacity: leaf.opacity,
                    filter: "url(#leafGlow)",
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                        d: leaf.shape,
                        fill: leaf.color,
                        stroke: leaf.color,
                        strokeWidth: "0.5",
                        opacity: "0.9"
                    }, void 0, false, {
                        fileName: "[project]/src/components/rosario/CommunityTreeSVG.tsx",
                        lineNumber: 157,
                        columnNumber: 11
                    }, this)
                }, leaf.id, false, {
                    fileName: "[project]/src/components/rosario/CommunityTreeSVG.tsx",
                    lineNumber: 151,
                    columnNumber: 9
                }, this)),
            totalLeaves > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("text", {
                x: "200",
                y: "30",
                textAnchor: "middle",
                fill: "#C6A15B",
                fontSize: "12",
                fontWeight: "600",
                opacity: "0.8",
                children: [
                    totalLeaves,
                    " ",
                    totalLeaves === 1 ? "hoja" : "hojas",
                    " en el Árbol"
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/rosario/CommunityTreeSVG.tsx",
                lineNumber: 168,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/rosario/CommunityTreeSVG.tsx",
        lineNumber: 120,
        columnNumber: 5
    }, this);
}
_s(CommunityTreeSVG, "Qt4itxPIAfgMeXaviAuoccnXPSE=");
_c = CommunityTreeSVG;
var _c;
__turbopack_context__.k.register(_c, "CommunityTreeSVG");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/components/rosario/LongPressButton.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "LongPressButton",
    ()=>LongPressButton
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
function LongPressButton({ onComplete, disabled = false, holdDurationMs = 500, className = "", children }) {
    _s();
    const [progress, setProgress] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(0);
    const [isPressed, setIsPressed] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const timerRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const startTimeRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(0);
    const rafRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(0);
    const clearTimers = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "LongPressButton.useCallback[clearTimers]": ()=>{
            if (timerRef.current) {
                clearInterval(timerRef.current);
                timerRef.current = null;
            }
            if (rafRef.current) {
                cancelAnimationFrame(rafRef.current);
                rafRef.current = 0;
            }
        }
    }["LongPressButton.useCallback[clearTimers]"], []);
    const startPress = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "LongPressButton.useCallback[startPress]": (clientX, clientY)=>{
            if (disabled) return;
            clearTimers();
            setIsPressed(true);
            setProgress(0);
            startTimeRef.current = Date.now();
            const tick = {
                "LongPressButton.useCallback[startPress].tick": ()=>{
                    const elapsed = Date.now() - startTimeRef.current;
                    const pct = Math.min(elapsed / holdDurationMs, 1);
                    setProgress(pct);
                    if (pct >= 1) {
                        clearTimers();
                        setIsPressed(false);
                        setProgress(0);
                        if (navigator.vibrate) {
                            navigator.vibrate(50);
                        }
                        onComplete();
                    } else {
                        rafRef.current = requestAnimationFrame(tick);
                    }
                }
            }["LongPressButton.useCallback[startPress].tick"];
            rafRef.current = requestAnimationFrame(tick);
        }
    }["LongPressButton.useCallback[startPress]"], [
        disabled,
        holdDurationMs,
        onComplete,
        clearTimers
    ]);
    const endPress = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "LongPressButton.useCallback[endPress]": ()=>{
            clearTimers();
            setIsPressed(false);
            setProgress(0);
        }
    }["LongPressButton.useCallback[endPress]"], [
        clearTimers
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "LongPressButton.useEffect": ()=>{
            return clearTimers;
        }
    }["LongPressButton.useEffect"], [
        clearTimers
    ]);
    const circumference = 2 * Math.PI * 54;
    const strokeDashoffset = circumference - progress * circumference;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
        onMouseDown: (e)=>startPress(e.clientX, e.clientY),
        onMouseUp: endPress,
        onMouseLeave: endPress,
        onTouchStart: (e)=>{
            e.preventDefault();
            const touch = e.touches[0];
            startPress(touch.clientX, touch.clientY);
        },
        onTouchEnd: (e)=>{
            e.preventDefault();
            endPress();
        },
        onTouchCancel: endPress,
        disabled: disabled,
        className: `relative flex h-48 w-48 items-center justify-center rounded-full border-2 border-[#C6A15B]/40 transition-transform active:scale-[0.97] disabled:opacity-50 ${className}`,
        style: {
            background: isPressed ? "radial-gradient(circle, rgba(198,161,91,0.15) 0%, rgba(15,21,38,0.9) 100%)" : "radial-gradient(circle, rgba(198,161,91,0.05) 0%, rgba(15,21,38,0.7) 100%)"
        },
        children: [
            isPressed && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                className: "absolute inset-0 h-full w-full -rotate-90",
                viewBox: "0 0 120 120",
                "aria-hidden": "true",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("circle", {
                        cx: "60",
                        cy: "60",
                        r: "54",
                        fill: "none",
                        stroke: "rgba(198,161,91,0.2)",
                        strokeWidth: "3"
                    }, void 0, false, {
                        fileName: "[project]/src/components/rosario/LongPressButton.tsx",
                        lineNumber: 113,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("circle", {
                        cx: "60",
                        cy: "60",
                        r: "54",
                        fill: "none",
                        stroke: "#C6A15B",
                        strokeWidth: "3",
                        strokeDasharray: circumference,
                        strokeDashoffset: strokeDashoffset,
                        strokeLinecap: "round",
                        style: {
                            transition: "stroke-dashoffset 0.05s linear"
                        }
                    }, void 0, false, {
                        fileName: "[project]/src/components/rosario/LongPressButton.tsx",
                        lineNumber: 121,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/rosario/LongPressButton.tsx",
                lineNumber: 108,
                columnNumber: 9
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "relative z-10 text-center",
                children: isPressed ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            className: "text-3xl font-semibold text-[#C6A15B]",
                            children: [
                                Math.round(progress * 100),
                                "%"
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/components/rosario/LongPressButton.tsx",
                            lineNumber: 141,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            className: "mt-1 text-[11px] uppercase tracking-widest text-white/60",
                            children: "Mantén presionado"
                        }, void 0, false, {
                            fileName: "[project]/src/components/rosario/LongPressButton.tsx",
                            lineNumber: 144,
                            columnNumber: 13
                        }, this)
                    ]
                }, void 0, true) : children
            }, void 0, false, {
                fileName: "[project]/src/components/rosario/LongPressButton.tsx",
                lineNumber: 138,
                columnNumber: 7
            }, this),
            isPressed && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                className: "pointer-events-none absolute inset-0 flex items-center justify-center",
                "aria-hidden": "true",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                    className: "inline-block h-24 w-24 rounded-full bg-[#C6A15B]/20",
                    style: {
                        animation: "ping 1s cubic-bezier(0, 0, 0.2, 1) infinite"
                    }
                }, void 0, false, {
                    fileName: "[project]/src/components/rosario/LongPressButton.tsx",
                    lineNumber: 158,
                    columnNumber: 11
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/components/rosario/LongPressButton.tsx",
                lineNumber: 154,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/rosario/LongPressButton.tsx",
        lineNumber: 85,
        columnNumber: 5
    }, this);
}
_s(LongPressButton, "1K1IJ/mgVhgE/TRQ8F09ksZ3rvs=");
_c = LongPressButton;
var _c;
__turbopack_context__.k.register(_c, "LongPressButton");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/components/rosario/LivePrayerScreen.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "LivePrayerScreen",
    ()=>LivePrayerScreen
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$hooks$2f$usePrayerExperience$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/hooks/usePrayerExperience.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$rosario$2f$CommunityTreeSVG$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/rosario/CommunityTreeSVG.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$rosario$2f$LongPressButton$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/rosario/LongPressButton.tsx [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
;
function LivePrayerScreen({ profileId, displayName, participants, currentStepIndex, repeatIteration = 1, repeatTotal = 10, onResponse }) {
    _s();
    const [showIntentions, setShowIntentions] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(true);
    const [intentions, setIntentions] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([
        "Por la paz en mi familia",
        "Por las almas del purgatorio",
        "Por la sanación de mi hermano"
    ]);
    const { triggerPrayer, progress, isResponding } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$hooks$2f$usePrayerExperience$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["usePrayerExperience"])({
        profileId,
        displayName,
        targetCount: repeatTotal,
        onComplete: onResponse
    });
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "LivePrayerScreen.useEffect": ()=>{
            const interval = setInterval({
                "LivePrayerScreen.useEffect.interval": ()=>{
                    setIntentions({
                        "LivePrayerScreen.useEffect.interval": (prev)=>{
                            if (prev.length > 0 && Math.random() > 0.7) {
                                return [
                                    ...prev.slice(1),
                                    `Intención ${Math.floor(Math.random() * 1000)}`
                                ];
                            }
                            return prev;
                        }
                    }["LivePrayerScreen.useEffect.interval"]);
                }
            }["LivePrayerScreen.useEffect.interval"], 5000);
            return ({
                "LivePrayerScreen.useEffect": ()=>clearInterval(interval)
            })["LivePrayerScreen.useEffect"];
        }
    }["LivePrayerScreen.useEffect"], []);
    const displayCount = Math.min(repeatIteration, repeatTotal);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("main", {
        className: "relative flex min-h-dvh flex-col items-center justify-between bg-[#0f1526] px-6 py-10 text-white",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "absolute inset-0 opacity-40",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$rosario$2f$CommunityTreeSVG$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CommunityTreeSVG"], {
                    participants: participants,
                    currentUserId: profileId
                }, void 0, false, {
                    fileName: "[project]/src/components/rosario/LivePrayerScreen.tsx",
                    lineNumber: 59,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/components/rosario/LivePrayerScreen.tsx",
                lineNumber: 58,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "relative z-10 w-full text-center",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-[11px] uppercase tracking-[0.3em] text-[#C6A15B]",
                        children: "Ave María"
                    }, void 0, false, {
                        fileName: "[project]/src/components/rosario/LivePrayerScreen.tsx",
                        lineNumber: 63,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "mt-3 text-[13px] text-white/60",
                        children: [
                            displayCount,
                            " de ",
                            repeatTotal
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/rosario/LivePrayerScreen.tsx",
                        lineNumber: 66,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/rosario/LivePrayerScreen.tsx",
                lineNumber: 62,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "relative z-10 mt-8 flex flex-col items-center gap-6",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "relative",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex h-56 w-56 items-center justify-center rounded-full border-2 border-[#C6A15B]/40 transition-all duration-300",
                                style: {
                                    boxShadow: isResponding ? "0 0 40px rgba(198, 161, 91, 0.4)" : "0 0 20px rgba(198, 161, 91, 0.1)"
                                },
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "text-center",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            className: "text-[11px] uppercase tracking-[0.3em] text-[#C6A15B]",
                                            children: "Ave María"
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/rosario/LivePrayerScreen.tsx",
                                            lineNumber: 82,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            className: "mt-3 text-[56px] font-semibold leading-none text-[#C6A15B]",
                                            children: displayCount
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/rosario/LivePrayerScreen.tsx",
                                            lineNumber: 85,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            className: "mt-2 text-[13px] text-white/40",
                                            children: [
                                                "de ",
                                                repeatTotal
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/components/rosario/LivePrayerScreen.tsx",
                                            lineNumber: 88,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/components/rosario/LivePrayerScreen.tsx",
                                    lineNumber: 81,
                                    columnNumber: 13
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/src/components/rosario/LivePrayerScreen.tsx",
                                lineNumber: 73,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                className: "absolute inset-0 h-full w-full -rotate-90",
                                viewBox: "0 0 224 224",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("circle", {
                                        cx: "112",
                                        cy: "112",
                                        r: "108",
                                        fill: "none",
                                        stroke: "rgba(198, 161, 91, 0.1)",
                                        strokeWidth: "2"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/rosario/LivePrayerScreen.tsx",
                                        lineNumber: 96,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("circle", {
                                        cx: "112",
                                        cy: "112",
                                        r: "108",
                                        fill: "none",
                                        stroke: "#C6A15B",
                                        strokeWidth: "2",
                                        strokeDasharray: `${Math.min(progress, 100) * 6.78} 678`,
                                        strokeLinecap: "round",
                                        style: {
                                            transition: "stroke-dasharray 0.3s ease"
                                        }
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/rosario/LivePrayerScreen.tsx",
                                        lineNumber: 104,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/rosario/LivePrayerScreen.tsx",
                                lineNumber: 92,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/rosario/LivePrayerScreen.tsx",
                        lineNumber: 72,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$rosario$2f$LongPressButton$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["LongPressButton"], {
                        onComplete: triggerPrayer,
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            className: "text-2xl font-semibold text-[#0f1526]",
                            children: "🙏"
                        }, void 0, false, {
                            fileName: "[project]/src/components/rosario/LivePrayerScreen.tsx",
                            lineNumber: 121,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/src/components/rosario/LivePrayerScreen.tsx",
                        lineNumber: 120,
                        columnNumber: 9
                    }, this),
                    showIntentions && intentions.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "relative z-10 mt-6 w-full max-w-xs",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex flex-col gap-2 opacity-60",
                            children: intentions.slice(-3).map((intention, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "text-center text-[12px] italic text-white/70",
                                    style: {
                                        animation: `fadeIn 0.5s ease ${i * 0.2}s both`
                                    },
                                    children: [
                                        "“",
                                        intention,
                                        "”"
                                    ]
                                }, i, true, {
                                    fileName: "[project]/src/components/rosario/LivePrayerScreen.tsx",
                                    lineNumber: 128,
                                    columnNumber: 17
                                }, this))
                        }, void 0, false, {
                            fileName: "[project]/src/components/rosario/LivePrayerScreen.tsx",
                            lineNumber: 126,
                            columnNumber: 13
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/src/components/rosario/LivePrayerScreen.tsx",
                        lineNumber: 125,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/rosario/LivePrayerScreen.tsx",
                lineNumber: 71,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/rosario/LivePrayerScreen.tsx",
        lineNumber: 57,
        columnNumber: 5
    }, this);
}
_s(LivePrayerScreen, "vV09L6A8fMgeN4tj7BkqKh6PBYc=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$hooks$2f$usePrayerExperience$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["usePrayerExperience"]
    ];
});
_c = LivePrayerScreen;
var _c;
__turbopack_context__.k.register(_c, "LivePrayerScreen");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/lib/supabase.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ensureAnonymousSupabaseSession",
    ()=>ensureAnonymousSupabaseSession,
    "getSupabaseBrowser",
    ()=>getSupabaseBrowser
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = /*#__PURE__*/ __turbopack_context__.i("[project]/node_modules/next/dist/build/polyfills/process.js [app-client] (ecmascript)");
// ============================================================================
// CAMINO · Cliente Supabase (browser) — abstracción para auth progresiva real
// ----------------------------------------------------------------------------
// En este sandbox la identidad progresiva se resuelve vía API routes + cookie
// de dispositivo (ver src/lib/identity.ts y useProgressiveAuth). Cuando el
// proyecto Supabase esté configurado, este cliente permite conmutar a
// Supabase Auth (signInAnonymously / linkIdentity) sin tocar la UI.
//
// Requiere las variables públicas:
//   NEXT_PUBLIC_SUPABASE_URL
//   NEXT_PUBLIC_SUPABASE_ANON_KEY
// ============================================================================
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$supabase$2f$supabase$2d$js$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/@supabase/supabase-js/dist/index.mjs [app-client] (ecmascript) <locals>");
;
let cached = null;
function getSupabaseBrowser() {
    const url = ("TURBOPACK compile-time value", "https://qmuootexudvmczvpwouu.supabase.co");
    const anon = ("TURBOPACK compile-time value", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFtdW9vdGV4dWR2bWN6dnB3b3V1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQzNTEzMjEsImV4cCI6MjA5OTkyNzMyMX0.nGQUIQKXg6VR1bbtesAqfGmKbE5TzrJxEDjBZWT_RW4");
    if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
    ;
    if (cached) return cached;
    cached = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$supabase$2f$supabase$2d$js$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["createClient"])(url, anon, {
        auth: {
            persistSession: true,
            autoRefreshToken: true,
            detectSessionInUrl: true
        }
    });
    return cached;
}
async function ensureAnonymousSupabaseSession() {
    const supabase = getSupabaseBrowser();
    if (!supabase) return;
    const { data } = await supabase.auth.getSession();
    if (!data.session) {
        await supabase.auth.signInAnonymously();
    }
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/hooks/useRosarioSync.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "useRosarioSync",
    ()=>useRosarioSync
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/supabase.ts [app-client] (ecmascript)");
var _s = __turbopack_context__.k.signature();
"use client";
;
;
const HEARTBEAT_INTERVAL = 25_000;
const MAX_PARTICIPANTS = 50;
function useRosarioSync({ programId, profileId, displayName, onStepChange, onParticipantsChange }) {
    _s();
    const [participants, setParticipants] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [snapshot, setSnapshot] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [connectionState, setConnectionState] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("connecting");
    const [isConnected, setIsConnected] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const channelRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const heartbeatRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const reconnectAttemptsRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(0);
    const reconnectTimerRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getSupabaseBrowser"])();
    const sessionIdRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(programId);
    const clearTimers = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "useRosarioSync.useCallback[clearTimers]": ()=>{
            if (heartbeatRef.current) clearInterval(heartbeatRef.current);
            if (reconnectTimerRef.current) clearTimeout(reconnectTimerRef.current);
            heartbeatRef.current = null;
            reconnectTimerRef.current = null;
        }
    }["useRosarioSync.useCallback[clearTimers]"], []);
    const closeChannel = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "useRosarioSync.useCallback[closeChannel]": ()=>{
            if (channelRef.current && supabase) {
                supabase.removeChannel(channelRef.current);
                channelRef.current = null;
            }
        }
    }["useRosarioSync.useCallback[closeChannel]"], [
        supabase
    ]);
    const fetchSnapshot = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "useRosarioSync.useCallback[fetchSnapshot]": async ()=>{
            try {
                const res = await fetch(`/api/rosario/snapshot?programId=${encodeURIComponent(programId)}`);
                if (!res.ok) return null;
                const data = await res.json();
                return data;
            } catch  {
                return null;
            }
        }
    }["useRosarioSync.useCallback[fetchSnapshot]"], [
        programId
    ]);
    const applySnapshot = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "useRosarioSync.useCallback[applySnapshot]": (snap)=>{
            if (!snap) return;
            setSnapshot(snap);
            setParticipants(snap.participants);
            setConnectionState("connected");
            setIsConnected(true);
            reconnectAttemptsRef.current = 0;
            onParticipantsChange?.(snap.participants);
            onStepChange?.(snap.stepId ? 0 : 0);
        }
    }["useRosarioSync.useCallback[applySnapshot]"], [
        onParticipantsChange,
        onStepChange
    ]);
    const connect = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "useRosarioSync.useCallback[connect]": async ()=>{
            if (!supabase) {
                await applySnapshot(await createLocalSnapshot());
                return;
            }
            if (channelRef.current) {
                closeChannel();
            }
            setConnectionState("connecting");
            try {
                const initial = await fetchSnapshot();
                await applySnapshot(initial);
                const channel = supabase.channel(`session:${sessionIdRef.current}`, {
                    config: {
                        presence: {
                            key: profileId
                        }
                    }
                });
                channel.on("presence", {
                    event: "sync"
                }, {
                    "useRosarioSync.useCallback[connect]": ()=>{
                        const state = channel.presenceState();
                        const users = [];
                        Object.values(state).forEach({
                            "useRosarioSync.useCallback[connect]": (entries)=>{
                                const list = entries;
                                users.push(...list);
                            }
                        }["useRosarioSync.useCallback[connect]"]);
                        setParticipants(users);
                        onParticipantsChange?.(users);
                    }
                }["useRosarioSync.useCallback[connect]"]).on("broadcast", {
                    event: "snapshot"
                }, {
                    "useRosarioSync.useCallback[connect]": (payload)=>{
                        applySnapshot(payload.snapshot);
                    }
                }["useRosarioSync.useCallback[connect]"]).subscribe({
                    "useRosarioSync.useCallback[connect]": async (status)=>{
                        if (status === "SUBSCRIBED") {
                            await channel.track({
                                id: profileId,
                                displayName,
                                isResponding: false
                            });
                            setIsConnected(true);
                            setConnectionState("connected");
                            reconnectAttemptsRef.current = 0;
                        } else {
                            setIsConnected(false);
                            setConnectionState("reconnecting");
                        }
                    }
                }["useRosarioSync.useCallback[connect]"]);
                channelRef.current = channel;
            } catch  {
                setConnectionState("reconnecting");
            }
        }
    }["useRosarioSync.useCallback[connect]"], [
        supabase,
        profileId,
        displayName,
        applySnapshot,
        closeChannel,
        onParticipantsChange,
        onStepChange
    ]);
    const createLocalSnapshot = async ()=>{
        try {
            const initial = await fetchSnapshot();
            if (initial) return initial;
        } catch  {}
        return null;
    };
    const sendResponse = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "useRosarioSync.useCallback[sendResponse]": ()=>{
            if (!snapshot) return;
            const eventId = crypto.randomUUID();
            fetch("/api/rosario/transition", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    sessionId: snapshot.sessionId,
                    eventId,
                    sessionVersion: snapshot.sessionVersion,
                    stepInstanceId: snapshot.stepInstanceId,
                    eventType: "HOLD_END",
                    participantId: profileId
                })
            }).then({
                "useRosarioSync.useCallback[sendResponse]": async (res)=>{
                    if (!res.ok) return;
                    const data = await res.json();
                    if (data.snapshot) {
                        applySnapshot(data.snapshot);
                    }
                }
            }["useRosarioSync.useCallback[sendResponse]"]);
        }
    }["useRosarioSync.useCallback[sendResponse]"], [
        snapshot,
        profileId,
        applySnapshot
    ]);
    const sendChatMessage = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "useRosarioSync.useCallback[sendChatMessage]": (text)=>{
            if (!channelRef.current || !text.trim()) return;
            channelRef.current.send({
                type: "broadcast",
                event: "chat",
                payload: {
                    message: {
                        id: crypto.randomUUID(),
                        displayName,
                        text: text.trim(),
                        createdAt: new Date().toISOString()
                    }
                }
            });
        }
    }["useRosarioSync.useCallback[sendChatMessage]"], [
        displayName
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "useRosarioSync.useEffect": ()=>{
            if (!supabase) {
                applySnapshot(null);
                setConnectionState("offline");
                return;
            }
            void connect();
            heartbeatRef.current = setInterval({
                "useRosarioSync.useEffect": async ()=>{
                    try {
                        await fetch("/api/rosario/heartbeat", {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json"
                            },
                            body: JSON.stringify({
                                profileId,
                                displayName
                            })
                        });
                    } catch  {
                    /* ignorar */ }
                }
            }["useRosarioSync.useEffect"], HEARTBEAT_INTERVAL);
            return ({
                "useRosarioSync.useEffect": ()=>{
                    clearTimers();
                    closeChannel();
                    setIsConnected(false);
                }
            })["useRosarioSync.useEffect"];
        }
    }["useRosarioSync.useEffect"], [
        supabase,
        profileId,
        displayName,
        connect,
        clearTimers,
        closeChannel,
        applySnapshot
    ]);
    return {
        participants,
        currentStepIndex: snapshot ? 0 : 0,
        isConnected,
        connectionState,
        sendResponse,
        sendChatMessage,
        repeatIteration: snapshot?.repeatIteration ?? 1,
        repeatTotal: snapshot?.repeatTotal ?? 10
    };
}
_s(useRosarioSync, "9QaR2/Z3GVOfq4JgoPLLkdI4i4I=");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/components/BottomNav.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "BottomNav",
    ()=>BottomNav
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/client/app-dir/link.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/navigation.js [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
const TABS = [
    {
        href: "/",
        label: "Camino",
        icon: "✟"
    },
    {
        href: "/rosario",
        label: "Rosario",
        icon: "◎"
    },
    {
        href: "/comunidad",
        label: "Comunidad",
        icon: "⛪"
    },
    {
        href: "/perfil",
        label: "Mi Perfil",
        icon: "◐"
    }
];
function BottomNav() {
    _s();
    const pathname = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["usePathname"])();
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("nav", {
        className: "fixed inset-x-0 bottom-0 z-40 border-t border-[#eae7df] bg-white/90 backdrop-blur-md",
        style: {
            paddingBottom: "env(safe-area-inset-bottom)"
        },
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "mx-auto grid max-w-md grid-cols-4",
            children: TABS.map((tab)=>{
                const active = tab.href === "/" ? pathname === "/" : pathname?.startsWith(tab.href);
                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                    href: tab.href,
                    className: "flex min-h-[56px] flex-col items-center justify-center gap-0.5 py-1.5",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            className: `text-[18px] leading-none ${active ? "text-[#1c1c1e]" : "text-[#b0aca0]"}`,
                            children: tab.icon
                        }, void 0, false, {
                            fileName: "[project]/src/components/BottomNav.tsx",
                            lineNumber: 31,
                            columnNumber: 15
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            className: `text-[10px] font-medium tracking-wide ${active ? "text-[#1c1c1e]" : "text-[#b0aca0]"}`,
                            children: tab.label
                        }, void 0, false, {
                            fileName: "[project]/src/components/BottomNav.tsx",
                            lineNumber: 38,
                            columnNumber: 15
                        }, this)
                    ]
                }, tab.href, true, {
                    fileName: "[project]/src/components/BottomNav.tsx",
                    lineNumber: 26,
                    columnNumber: 13
                }, this);
            })
        }, void 0, false, {
            fileName: "[project]/src/components/BottomNav.tsx",
            lineNumber: 21,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/src/components/BottomNav.tsx",
        lineNumber: 17,
        columnNumber: 5
    }, this);
}
_s(BottomNav, "xbyQPtUVMO7MNj7WjJlpdWqRcTo=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["usePathname"]
    ];
});
_c = BottomNav;
var _c;
__turbopack_context__.k.register(_c, "BottomNav");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/components/llama/FloatingCandle.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "FloatingCandle",
    ()=>FloatingCandle
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
function formatRemainingTime(expiresAtIso) {
    const expires = new Date(expiresAtIso).getTime();
    const now = new Date().getTime();
    const diffMs = expires - now;
    if (diffMs <= 0) return "Expirando...";
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor(diffMs % (1000 * 60 * 60) / (1000 * 60));
    return `${hours}h ${minutes}m`;
}
function FloatingCandle() {
    _s();
    const activeIntention = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$llama$2f$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useLlamaStore"])({
        "FloatingCandle.useLlamaStore[activeIntention]": (s)=>s.activeIntention
    }["FloatingCandle.useLlamaStore[activeIntention]"]);
    const [showPopover, setShowPopover] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [remainingText, setRemainingText] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("");
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "FloatingCandle.useEffect": ()=>{
            if (!activeIntention) return;
            setRemainingText(formatRemainingTime(activeIntention.expiresAt));
            const interval = setInterval({
                "FloatingCandle.useEffect.interval": ()=>{
                    setRemainingText(formatRemainingTime(activeIntention.expiresAt));
                }
            }["FloatingCandle.useEffect.interval"], 30000);
            return ({
                "FloatingCandle.useEffect": ()=>clearInterval(interval)
            })["FloatingCandle.useEffect"];
        }
    }["FloatingCandle.useEffect"], [
        activeIntention
    ]);
    if (!activeIntention) return null;
    // Escala según intensidad (1..5)
    const scaleByIntensity = 0.9 + (activeIntention.intensityLevel - 1) * 0.06;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "fixed bottom-[88px] right-4 z-40 flex flex-col items-end",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$components$2f$AnimatePresence$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["AnimatePresence"], {
                children: showPopover && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].div, {
                    initial: {
                        opacity: 0,
                        y: 8,
                        scale: 0.95
                    },
                    animate: {
                        opacity: 1,
                        y: 0,
                        scale: 1
                    },
                    exit: {
                        opacity: 0,
                        y: 8,
                        scale: 0.95
                    },
                    transition: {
                        duration: 0.18
                    },
                    className: "mb-2 w-64 rounded-2xl bg-[#f7f5f0] p-4 shadow-xl border border-[#1c1c1e]/10 text-[#1c1c1e]",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex items-center justify-between border-b border-[#1c1c1e]/10 pb-2 mb-2",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "text-xs font-serif font-medium text-[#7c2d12] flex items-center gap-1",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            children: "🕯️"
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/llama/FloatingCandle.tsx",
                                            lineNumber: 54,
                                            columnNumber: 17
                                        }, this),
                                        " Intención viva"
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/components/llama/FloatingCandle.tsx",
                                    lineNumber: 53,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    type: "button",
                                    onClick: ()=>setShowPopover(false),
                                    className: "text-xs text-[#6e6e73] hover:text-[#1c1c1e] p-1",
                                    "aria-label": "Cerrar detalle",
                                    children: "✕"
                                }, void 0, false, {
                                    fileName: "[project]/src/components/llama/FloatingCandle.tsx",
                                    lineNumber: 56,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/components/llama/FloatingCandle.tsx",
                            lineNumber: 52,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            className: "text-sm font-medium italic text-[#1c1c1e] mb-2 break-words",
                            children: [
                                '"',
                                activeIntention.content,
                                '"'
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/components/llama/FloatingCandle.tsx",
                            lineNumber: 66,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex items-center justify-between text-xs text-[#6e6e73]",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    children: [
                                        "Permanecerá: ",
                                        remainingText
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/components/llama/FloatingCandle.tsx",
                                    lineNumber: 71,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "flex items-center gap-0.5",
                                    children: Array.from({
                                        length: activeIntention.intensityLevel
                                    }).map((_, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "text-[10px]",
                                            children: "🕯️"
                                        }, i, false, {
                                            fileName: "[project]/src/components/llama/FloatingCandle.tsx",
                                            lineNumber: 74,
                                            columnNumber: 19
                                        }, this))
                                }, void 0, false, {
                                    fileName: "[project]/src/components/llama/FloatingCandle.tsx",
                                    lineNumber: 72,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/components/llama/FloatingCandle.tsx",
                            lineNumber: 70,
                            columnNumber: 13
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/components/llama/FloatingCandle.tsx",
                    lineNumber: 45,
                    columnNumber: 11
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/components/llama/FloatingCandle.tsx",
                lineNumber: 43,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].button, {
                type: "button",
                onClick: ()=>setShowPopover((prev)=>!prev),
                style: {
                    transform: `scale(${scaleByIntensity})`
                },
                whileTap: {
                    scale: 0.9
                },
                className: "flex h-12 w-12 items-center justify-center rounded-full bg-white/90 shadow-md border border-[#1c1c1e]/10 backdrop-blur-xs transition-shadow hover:shadow-lg",
                "aria-label": "Ver intención activa",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                    className: "text-xl animate-[pulse_2s_infinite]",
                    children: "🕯️"
                }, void 0, false, {
                    fileName: "[project]/src/components/llama/FloatingCandle.tsx",
                    lineNumber: 90,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/components/llama/FloatingCandle.tsx",
                lineNumber: 82,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/llama/FloatingCandle.tsx",
        lineNumber: 42,
        columnNumber: 5
    }, this);
}
_s(FloatingCandle, "GymAtcKbdB4GtJBcYazGwQo0FmU=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$llama$2f$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useLlamaStore"]
    ];
});
_c = FloatingCandle;
var _c;
__turbopack_context__.k.register(_c, "FloatingCandle");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/app/rosario/en-vivo/page.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>RosarioEnVivoPage
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$hooks$2f$useProgressiveAuth$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/hooks/useProgressiveAuth.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$rosario$2f$LivePrayerScreen$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/rosario/LivePrayerScreen.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$hooks$2f$useRosarioSync$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/hooks/useRosarioSync.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$rosario$2f$CommunityTreeSVG$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/rosario/CommunityTreeSVG.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$BottomNav$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/BottomNav.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$llama$2f$FloatingCandle$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/llama/FloatingCandle.tsx [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
;
;
;
;
function RosarioEnVivoPage() {
    _s();
    const { profile, loading: authLoading } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$hooks$2f$useProgressiveAuth$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useProgressiveAuth"])();
    const profileId = profile?.id || "guest";
    const displayName = profile?.displayName || "Peregrino";
    const { participants, sendResponse, connectionState, repeatIteration, repeatTotal } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$hooks$2f$useRosarioSync$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRosarioSync"])({
        programId: "rosario-misterios-dolorosos",
        profileId,
        displayName,
        onStepChange: {
            "RosarioEnVivoPage.useRosarioSync": ()=>{}
        }["RosarioEnVivoPage.useRosarioSync"],
        onParticipantsChange: {
            "RosarioEnVivoPage.useRosarioSync": ()=>{}
        }["RosarioEnVivoPage.useRosarioSync"]
    });
    const handlePrayer = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "RosarioEnVivoPage.useCallback[handlePrayer]": ()=>{
            sendResponse();
        }
    }["RosarioEnVivoPage.useCallback[handlePrayer]"], [
        sendResponse
    ]);
    if (authLoading) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("main", {
            className: "flex min-h-dvh items-center justify-center bg-[#0f1526] text-white",
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                className: "text-sm text-white/60",
                children: "Cargando..."
            }, void 0, false, {
                fileName: "[project]/src/app/rosario/en-vivo/page.tsx",
                lineNumber: 32,
                columnNumber: 9
            }, this)
        }, void 0, false, {
            fileName: "[project]/src/app/rosario/en-vivo/page.tsx",
            lineNumber: 31,
            columnNumber: 7
        }, this);
    }
    const isConnected = connectionState === "connected";
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("main", {
        className: "relative flex min-h-dvh flex-col items-center justify-between bg-[#0f1526] px-6 py-10 text-white",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "absolute inset-0 opacity-30",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$rosario$2f$CommunityTreeSVG$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CommunityTreeSVG"], {
                    participants: participants.map((p)=>({
                            ...p,
                            id: p.profileId
                        })),
                    currentUserId: profileId
                }, void 0, false, {
                    fileName: "[project]/src/app/rosario/en-vivo/page.tsx",
                    lineNumber: 42,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/app/rosario/en-vivo/page.tsx",
                lineNumber: 41,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "relative z-10 w-full text-center",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-[11px] uppercase tracking-[0.3em] text-[#C6A15B]",
                        children: "Oración Perpetua"
                    }, void 0, false, {
                        fileName: "[project]/src/app/rosario/en-vivo/page.tsx",
                        lineNumber: 49,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "mt-2 flex items-center justify-center gap-1",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: `h-2 w-2 rounded-full ${isConnected ? "bg-green-400" : "bg-yellow-400"}`
                            }, void 0, false, {
                                fileName: "[project]/src/app/rosario/en-vivo/page.tsx",
                                lineNumber: 53,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "text-[11px] text-white/60",
                                children: isConnected ? "Conectado" : "Reconectando..."
                            }, void 0, false, {
                                fileName: "[project]/src/app/rosario/en-vivo/page.tsx",
                                lineNumber: 54,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/rosario/en-vivo/page.tsx",
                        lineNumber: 52,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/rosario/en-vivo/page.tsx",
                lineNumber: 48,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "relative z-10 flex flex-1 flex-col items-center justify-center gap-8",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$rosario$2f$LivePrayerScreen$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["LivePrayerScreen"], {
                    profileId: profileId,
                    displayName: displayName,
                    participants: participants.map((p)=>({
                            id: p.profileId,
                            displayName: p.displayName
                        })),
                    currentStepIndex: 0,
                    repeatIteration: repeatIteration,
                    repeatTotal: repeatTotal,
                    onResponse: handlePrayer
                }, void 0, false, {
                    fileName: "[project]/src/app/rosario/en-vivo/page.tsx",
                    lineNumber: 61,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/app/rosario/en-vivo/page.tsx",
                lineNumber: 60,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$llama$2f$FloatingCandle$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FloatingCandle"], {}, void 0, false, {
                fileName: "[project]/src/app/rosario/en-vivo/page.tsx",
                lineNumber: 72,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$BottomNav$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["BottomNav"], {}, void 0, false, {
                fileName: "[project]/src/app/rosario/en-vivo/page.tsx",
                lineNumber: 73,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/app/rosario/en-vivo/page.tsx",
        lineNumber: 40,
        columnNumber: 5
    }, this);
}
_s(RosarioEnVivoPage, "M8SNl798mR9dvggUNSHJdfc01qg=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$hooks$2f$useProgressiveAuth$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useProgressiveAuth"],
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$hooks$2f$useRosarioSync$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRosarioSync"]
    ];
});
_c = RosarioEnVivoPage;
var _c;
__turbopack_context__.k.register(_c, "RosarioEnVivoPage");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=src_10yl8t4._.js.map