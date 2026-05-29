// src/pages/AuthPage.jsx
import React, { useEffect, useMemo, useState } from "react";
import { Activity, UserPlus, LogIn, ChevronRight, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { loginUser, registerUser, getSession } from "@/lib/auth";
import { useAuth } from "@/lib/AuthContext";
import {
  loadLanguageModel,
  getTopLetters,
  getSuggestedWords,
  registerWordUsage,
} from "@/lib/languageModel";
import Keyboard from "@/components/writer/Keyboard";
import TopLetters from "@/components/writer/TopLetters";
import SuggestionsSidebar from "@/components/writer/SuggestionsSidebar";

const DEMO_USER = {
  id: "demo-user",
  nombre: "Usuario Demo",
  email: "demo@mioassist.mx",
  password: "demo1234",
  telefono: "55 1234 5678",
  edad: "28",
  doctorNombre: "Dra. Adriana Vera",
  doctorEmail: "avera@tec.mx",
  doctorTel: "81 8358 2000",
  objetivo: "Comunicación autónoma y rehabilitación",
  createdAt: new Date().toISOString(),
};

const LOGIN_FIELDS = [
  { key: "email", label: "Correo electrónico", required: true },
  { key: "password", label: "Contraseña", required: true, password: true },
];

const REGISTER_FIELDS = [
  { key: "nombre", label: "Nombre completo", required: true },
  { key: "email", label: "Correo electrónico", required: true },
  { key: "password", label: "Contraseña", required: true, password: true },
  { key: "telefono", label: "Teléfono (opcional)", required: false },
  { key: "edad", label: "Edad (opcional)", required: false },
  { key: "doctorNombre", label: "Nombre del doctor/terapeuta", required: false },
  { key: "doctorEmail", label: "Correo del doctor", required: false },
  { key: "doctorTel", label: "Teléfono del doctor", required: false },
  { key: "objetivo", label: "Objetivo de uso", required: false },
];

const LETTER_ROWS = [
  ["q", "w", "e", "r", "t", "y", "u", "i", "o", "p"],
  ["a", "s", "d", "f", "g", "h", "j", "k", "l", "ñ"],
  ["z", "x", "c", "v", "b", "n", "m"],
  ["á", "é", "í", "ó", "ú"],
  ["SHIFT", "123", "ESPACIO", "BORRAR", "LIMPIAR", "DICCIONARIO"],
];

const NUM_ROWS = [
  ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"],
  ["@", "#", "$", "%", "&", "*", "(", ")", "−", "_"],
  [".", ",", "?", "!", ";", ":", "/"],
  ["SHIFT", "123", "ESPACIO", "BORRAR", "LIMPIAR", "DICCIONARIO"],
];

export default function AuthPage() {
  const { login } = useAuth();

  const [mode, setMode] = useState("welcome");
  const [form, setForm] = useState({});
  const [error, setError] = useState("");
  const [remember, setRemember] = useState(false);
  const [modelReady, setModelReady] = useState(false);
  const [editing, setEditing] = useState(false);
  const [activeField, setActiveField] = useState(null);
  const [shift, setShift] = useState(true);
  const [numMode, setNumMode] = useState(false);
  const [kbRow, setKbRow] = useState(0);
  const [kbCol, setKbCol] = useState(0);
  const [zona, setZona] = useState("fields");
  const [fieldIndex, setFieldIndex] = useState(0);
  const [topIndex, setTopIndex] = useState(0);
  const [suggIndex, setSuggIndex] = useState(0);
  const [socialToast, setSocialToast] = useState("");

  // NUEVO: índice para navegar la pantalla inicial con flechas
  const [welcomeIndex, setWelcomeIndex] = useState(0);

  const savedSession = getSession();
  const fields = mode === "login" ? LOGIN_FIELDS : REGISTER_FIELDS;

  const welcomeActions = useMemo(() => {
    const actions = [];

    if (savedSession) actions.push("continue");

    actions.push("demo", "login", "register", "google", "facebook", "apple");

    return actions;
  }, [savedSession]);

  useEffect(() => {
    loadLanguageModel().then(() => setModelReady(true));
  }, []);

  useEffect(() => {
    if (activeField && !(form[activeField] || "")) setShift(true);
  }, [activeField]);

  useEffect(() => {
    if (mode !== "welcome") return;

    setWelcomeIndex((i) => Math.min(i, welcomeActions.length - 1));
  }, [mode, welcomeActions.length]);

  const activeValue = activeField ? form[activeField] || "" : "";

  const topLettersData = useMemo(() => {
    if (!modelReady || !activeField) return [];
    return getTopLetters(activeValue, 5);
  }, [activeValue, modelReady, activeField]);

  const suggestionsData = useMemo(() => {
    if (!modelReady || !activeField) return [];
    return getSuggestedWords(activeValue, 8);
  }, [activeValue, modelReady, activeField]);

  const typeInField = (ch) => {
    if (!activeField) return;

    const finalCh = shift && !numMode ? ch.toUpperCase() : ch;

    setForm((f) => ({
      ...f,
      [activeField]: (f[activeField] || "") + finalCh,
    }));

    if (shift && !numMode) setShift(false);
  };

  const backspaceField = () => {
    if (!activeField) return;

    setForm((f) => ({
      ...f,
      [activeField]: (f[activeField] || "").slice(0, -1),
    }));
  };

  const clearField = () => {
    if (!activeField) return;

    setForm((f) => ({
      ...f,
      [activeField]: "",
    }));

    setShift(true);
  };

  const spaceField = () => {
    if (!activeField) return;

    setForm((f) => ({
      ...f,
      [activeField]: (f[activeField] || "") + " ",
    }));
  };

  const replaceWord = (word) => {
    if (!activeField) return;

    setForm((f) => {
      const prev = f[activeField] || "";
      const parts = prev.split(" ");
      parts[parts.length - 1] = word;

      return {
        ...f,
        [activeField]: parts.join(" ") + " ",
      };
    });

    registerWordUsage(word);
  };

  const ejecutarTecla = (value) => {
    if (value === "ESPACIO") return spaceField();
    if (value === "BORRAR") return backspaceField();
    if (value === "LIMPIAR") return clearField();
    if (value === "DICCIONARIO") return;

    if (value === "SHIFT") {
      setShift((s) => !s);
      return;
    }

    if (value === "123") {
      setNumMode((n) => !n);
      return;
    }

    typeInField(value);
  };

  const activateField = (key, idx) => {
    setActiveField(key);
    setFieldIndex(idx);
    setEditing(true);
    setZona("keyboard");
    setKbRow(0);
    setKbCol(0);

    if (!(form[key] || "")) setShift(true);
  };

  const handleDemo = () => {
    login(DEMO_USER);
  };

  const handleSocial = (provider) => {
    setSocialToast(`Inicio con ${provider} próximamente disponible`);
    setTimeout(() => setSocialToast(""), 3000);
  };

  const goLogin = () => {
    setMode("login");
    setFieldIndex(0);
    setActiveField(null);
    setEditing(false);
    setForm({});
  };

  const goRegister = () => {
    setMode("register");
    setFieldIndex(0);
    setActiveField(null);
    setEditing(false);
    setForm({});
  };

  const handleWelcomeAction = (action) => {
    if (action === "continue" && savedSession) {
      login(savedSession);
      return;
    }

    if (action === "demo") {
      handleDemo();
      return;
    }

    if (action === "login") {
      goLogin();
      return;
    }

    if (action === "register") {
      goRegister();
      return;
    }

    if (action === "google") {
      handleSocial("Google");
      return;
    }

    if (action === "facebook") {
      handleSocial("Facebook");
      return;
    }

    if (action === "apple") {
      handleSocial("Apple");
    }
  };

  const isWelcomeSelected = (action) => {
    return welcomeActions[welcomeIndex] === action;
  };

  // NUEVO: navegación con flechas en pantalla inicial
  useEffect(() => {
    if (mode !== "welcome") return;

    const onKey = (e) => {
      if (!["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Enter"].includes(e.key)) return;

      e.preventDefault();

      const currentAction = welcomeActions[welcomeIndex];

      if (e.key === "ArrowUp") {
        setWelcomeIndex((i) => Math.max(0, i - 1));
      }

      if (e.key === "ArrowDown") {
        setWelcomeIndex((i) => Math.min(welcomeActions.length - 1, i + 1));
      }

      if (e.key === "ArrowLeft") {
        if (currentAction === "register") {
          setWelcomeIndex(welcomeActions.indexOf("login"));
        } else if (currentAction === "facebook") {
          setWelcomeIndex(welcomeActions.indexOf("google"));
        } else if (currentAction === "apple") {
          setWelcomeIndex(welcomeActions.indexOf("facebook"));
        }
      }

      if (e.key === "ArrowRight") {
        if (currentAction === "login") {
          setWelcomeIndex(welcomeActions.indexOf("register"));
        } else if (currentAction === "google") {
          setWelcomeIndex(welcomeActions.indexOf("facebook"));
        } else if (currentAction === "facebook") {
          setWelcomeIndex(welcomeActions.indexOf("apple"));
        }
      }

      if (e.key === "Enter") {
        handleWelcomeAction(currentAction);
      }
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [mode, welcomeIndex, welcomeActions, savedSession]);

  // Navegación EMG con flechas dentro de login / registro
  useEffect(() => {
    if (mode === "welcome") return;

    const onKey = (e) => {
      if (!["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Enter"].includes(e.key)) return;

      e.preventDefault();

      if (!editing) {
        if (e.key === "ArrowDown") {
          setFieldIndex((i) => Math.min(fields.length - 1, i + 1));
        }

        if (e.key === "ArrowUp") {
          setFieldIndex((i) => Math.max(0, i - 1));
        }

        if (e.key === "Enter") {
          const key = fields[fieldIndex]?.key;
          if (key) activateField(key, fieldIndex);
        }

        return;
      }

      const activeRows = numMode ? NUM_ROWS : LETTER_ROWS;

      if (e.key === "ArrowDown") {
        if (zona === "top") {
          setZona("keyboard");
          setKbRow(0);
          setKbCol(0);
        } else if (zona === "keyboard") {
          if (kbRow < activeRows.length - 1) {
            const next = numMode && kbRow === 2 ? 3 : kbRow + 1;
            setKbRow(next);
            setKbCol((c) => Math.min(c, activeRows[next].length - 1));
          } else if (suggestionsData.length > 0) {
            setZona("suggestions");
            setSuggIndex(0);
          }
        } else if (zona === "suggestions") {
          setSuggIndex((i) => Math.min(suggestionsData.length - 1, i + 1));
        }
      }

      if (e.key === "ArrowUp") {
        if (zona === "keyboard") {
          if (kbRow === 0) {
            setZona("top");
          } else {
            const prev = numMode && kbRow === 3 ? 2 : kbRow - 1;
            setKbRow(prev);
            setKbCol((c) => Math.min(c, activeRows[prev].length - 1));
          }
        } else if (zona === "top") {
          setEditing(false);
          setZona("fields");
        } else if (zona === "suggestions") {
          setSuggIndex((i) => Math.max(0, i - 1));
        }
      }

      if (e.key === "ArrowLeft") {
        if (zona === "keyboard") setKbCol((i) => Math.max(0, i - 1));
        if (zona === "top") setTopIndex((i) => Math.max(0, i - 1));
      }

      if (e.key === "ArrowRight") {
        if (zona === "keyboard") {
          setKbCol((i) => Math.min((activeRows[kbRow]?.length || 1) - 1, i + 1));
        }

        if (zona === "top") {
          setTopIndex((i) => Math.min(topLettersData.length - 1, i + 1));
        }
      }

      if (e.key === "Enter") {
        if (zona === "top") {
          const l = topLettersData[topIndex]?.letter;
          if (l) ejecutarTecla(l);
        } else if (zona === "keyboard") {
          const effectiveRow = numMode && kbRow === 3 ? 3 : kbRow;
          const row = activeRows[effectiveRow];

          if (row) {
            const k = row[Math.min(kbCol, row.length - 1)];
            if (k) ejecutarTecla(k);
          }
        } else if (zona === "suggestions") {
          const w = suggestionsData[suggIndex]?.word;
          if (w) replaceWord(w);
        }
      }
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [
    mode,
    editing,
    zona,
    fieldIndex,
    kbRow,
    kbCol,
    topIndex,
    suggIndex,
    topLettersData,
    suggestionsData,
    shift,
    numMode,
    fields,
    activeField,
    form,
  ]);

  const handleSubmit = () => {
    setError("");

    if (mode === "login") {
      const r = loginUser(form.email || "", form.password || "", remember);

      if (!r.ok) {
        setError(r.error);
        return;
      }

      login(r.user);
    } else {
      if (!form.nombre?.trim()) {
        setError("El nombre es obligatorio.");
        return;
      }

      if (!form.email?.trim()) {
        setError("El correo es obligatorio.");
        return;
      }

      if (!form.password) {
        setError("La contraseña es obligatoria.");
        return;
      }

      const r = registerUser(form);

      if (!r.ok) {
        setError(r.error);
        return;
      }

      login(r.user);
    }
  };

  if (mode === "welcome") {
    return (
      <div className="min-h-screen w-full bg-gradient-to-br from-slate-50 to-cyan-50 flex flex-col items-center justify-center p-6">
        {socialToast && (
          <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-slate-800 text-white text-sm px-5 py-3 rounded-2xl shadow-lg">
            {socialToast}
          </div>
        )}

        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-primary to-cyan-400 mb-5 soft-shadow">
              <Activity className="w-10 h-10 text-white" />
            </div>

            <h1 className="text-4xl font-bold tracking-tight">MioAssist</h1>

            <p className="text-muted-foreground mt-2">
              Escritura asistida mediante señales EMG
            </p>
          </div>

          {savedSession && (
            <button
              type="button"
              onClick={() => login(savedSession)}
              className={cn(
                "w-full mb-4 h-16 rounded-2xl bg-gradient-to-r from-primary to-cyan-400 text-white font-semibold text-lg flex items-center justify-center gap-3 soft-shadow hover:opacity-95 transition-all",
                isWelcomeSelected("continue") &&
                  "ring-4 ring-cyan-400/80 ring-offset-4 ring-offset-cyan-50 scale-[1.02]"
              )}
            >
              <ChevronRight className="w-5 h-5" />
              Continuar como {savedSession.nombre?.split(" ")[0]}
            </button>
          )}

          <button
            type="button"
            onClick={handleDemo}
            className={cn(
              "w-full mb-4 h-14 rounded-2xl bg-gradient-to-r from-amber-400 to-orange-400 text-white font-semibold flex items-center justify-center gap-2 hover:opacity-95 transition-all soft-shadow",
              isWelcomeSelected("demo") &&
                "ring-4 ring-cyan-400/80 ring-offset-4 ring-offset-cyan-50 scale-[1.02]"
            )}
          >
            <Zap className="w-5 h-5" />
            Entrar en modo demo
          </button>

          <div className="flex gap-3 mb-5">
            <button
              type="button"
              onClick={goLogin}
              className={cn(
                "flex-1 h-14 rounded-2xl border-2 border-primary text-primary font-semibold flex items-center justify-center gap-2 hover:bg-primary/5 transition-all",
                isWelcomeSelected("login") &&
                  "ring-4 ring-cyan-400/80 ring-offset-4 ring-offset-cyan-50 scale-[1.02]"
              )}
            >
              <LogIn className="w-5 h-5" />
              Iniciar sesión
            </button>

            <button
              type="button"
              onClick={goRegister}
              className={cn(
                "flex-1 h-14 rounded-2xl bg-primary text-white font-semibold flex items-center justify-center gap-2 hover:bg-primary/90 transition-all",
                isWelcomeSelected("register") &&
                  "ring-4 ring-cyan-400/80 ring-offset-4 ring-offset-cyan-50 scale-[1.02]"
              )}
            >
              <UserPlus className="w-5 h-5" />
              Registrarse
            </button>
          </div>

          <div className="flex items-center gap-3 mb-4">
            <div className="flex-1 h-px bg-border" />
            <span className="text-xs text-muted-foreground">o continúa con</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleSocial("Google")}
              className={cn(
                "h-12 rounded-xl border border-border/70 bg-card flex items-center justify-center gap-2 text-sm font-medium text-muted-foreground hover:bg-secondary transition-all soft-shadow",
                isWelcomeSelected("google") &&
                  "ring-4 ring-cyan-400/80 ring-offset-4 ring-offset-cyan-50 scale-[1.03]"
              )}
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Google
            </button>

            <button
              type="button"
              onClick={() => handleSocial("Facebook")}
              className={cn(
                "h-12 rounded-xl border border-border/70 bg-card flex items-center justify-center gap-2 text-sm font-medium text-muted-foreground hover:bg-secondary transition-all soft-shadow",
                isWelcomeSelected("facebook") &&
                  "ring-4 ring-cyan-400/80 ring-offset-4 ring-offset-cyan-50 scale-[1.03]"
              )}
            >
              <svg className="w-4 h-4" fill="#1877F2" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
              Facebook
            </button>

            <button
              type="button"
              onClick={() => handleSocial("Apple")}
              className={cn(
                "h-12 rounded-xl border border-border/70 bg-card flex items-center justify-center gap-2 text-sm font-medium text-muted-foreground hover:bg-secondary transition-all soft-shadow",
                isWelcomeSelected("apple") &&
                  "ring-4 ring-cyan-400/80 ring-offset-4 ring-offset-cyan-50 scale-[1.03]"
              )}
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701" />
              </svg>
              Apple
            </button>
          </div>

          <p className="text-center text-xs text-muted-foreground mt-4">
            Google, Facebook y Apple próximamente disponibles
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      {socialToast && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-slate-800 text-white text-sm px-5 py-3 rounded-2xl shadow-lg">
          {socialToast}
        </div>
      )}

      <div className="border-b border-border/60 px-6 py-3 flex items-center justify-between bg-card shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary to-cyan-400 flex items-center justify-center">
            <Activity className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold">MioAssist</span>
        </div>

        <button
          type="button"
          onClick={() => setMode("welcome")}
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          ← Volver
        </button>
      </div>

      <div className="flex-1 grid grid-cols-1 xl:grid-cols-[1fr_420px] overflow-hidden">
        <div className="hidden xl:flex flex-col gap-3 p-4 overflow-hidden border-r border-border/60 bg-card/30">
          <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground px-1">
            {editing && activeField ? (
              <>
                ✏️ Editando:{" "}
                <span className="text-primary">
                  {fields.find((f) => f.key === activeField)?.label}
                </span>
              </>
            ) : (
              "Selecciona un campo →"
            )}
          </div>

          <TopLetters
            letters={topLettersData}
            onPick={(l) => ejecutarTecla(l)}
            zona={zona}
            topIndex={topIndex}
          />

          <Keyboard
            onType={(k) => ejecutarTecla(k)}
            onBackspace={backspaceField}
            onClear={clearField}
            onSpace={spaceField}
            onOpenDictionary={() => {}}
            zona={zona}
            kbRow={kbRow}
            kbCol={kbCol}
            showDictionaryButton={false}
            externalShift={shift}
            externalNumMode={numMode}
            onShiftChange={setShift}
            onNumModeChange={setNumMode}
          />

          <SuggestionsSidebar
            suggestions={suggestionsData}
            onPick={replaceWord}
            highlighted={false}
            zona={zona}
            suggestionIndex={suggIndex}
          />
        </div>

        <div className="overflow-y-auto p-5 space-y-4">
          <div>
            <h2 className="text-2xl font-bold">
              {mode === "login" ? "Iniciar sesión" : "Crear cuenta"}
            </h2>

            <p className="text-xs text-muted-foreground mt-1">
              Toca un campo para escribir con el teclado EMG
            </p>
          </div>

          <button
            type="button"
            onClick={handleDemo}
            className="w-full h-11 rounded-xl bg-gradient-to-r from-amber-400 to-orange-400 text-white font-semibold text-sm flex items-center justify-center gap-2 hover:opacity-95 transition-opacity"
          >
            <Zap className="w-4 h-4" />
            Entrar en modo demo (acceso rápido)
          </button>

          <div className="space-y-2">
            {fields.map((field, i) => {
              const isActive = activeField === field.key && editing;
              const isCursor = !editing && fieldIndex === i;

              return (
                <div key={field.key}>
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1 block">
                    {field.label} {field.required && <span className="text-primary">*</span>}
                  </label>

                  <div
                    onClick={() => activateField(field.key, i)}
                    className={cn(
                      "w-full min-h-[44px] px-3 py-2.5 rounded-xl border-2 text-sm cursor-pointer transition-all flex items-center gap-1",
                      isActive && "border-primary bg-primary/5 shadow-[0_0_0_3px_rgba(6,182,212,0.15)]",
                      isCursor && !isActive && "border-cyan-400 bg-cyan-50/50",
                      !isActive && !isCursor && "border-border/60 bg-background hover:border-primary/40"
                    )}
                  >
                    <span
                      className={cn(
                        "flex-1 truncate",
                        !form[field.key] && "text-muted-foreground/50"
                      )}
                    >
                      {field.password
                        ? "•".repeat((form[field.key] || "").length) || "Escribe aquí..."
                        : form[field.key] || "Escribe aquí..."}
                    </span>

                    {isActive && <span className="w-0.5 h-4 bg-primary animate-pulse shrink-0" />}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="xl:hidden space-y-3">
            <TopLetters
              letters={topLettersData}
              onPick={(l) => ejecutarTecla(l)}
              zona={zona}
              topIndex={topIndex}
            />

            <Keyboard
              onType={(k) => ejecutarTecla(k)}
              onBackspace={backspaceField}
              onClear={clearField}
              onSpace={spaceField}
              onOpenDictionary={() => {}}
              zona={zona}
              kbRow={kbRow}
              kbCol={kbCol}
              showDictionaryButton={false}
              externalShift={shift}
              externalNumMode={numMode}
              onShiftChange={setShift}
              onNumModeChange={setNumMode}
            />
          </div>

          {mode === "login" && (
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                className="w-4 h-4 accent-primary"
              />
              <span className="text-sm text-muted-foreground">Recordar usuario</span>
            </label>
          )}

          {error && (
            <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}

          <button
            type="button"
            onClick={handleSubmit}
            className="w-full h-12 rounded-xl bg-gradient-to-r from-primary to-cyan-400 text-white font-semibold flex items-center justify-center gap-2 hover:opacity-95 soft-shadow"
          >
            {mode === "login" ? (
              <>
                <LogIn className="w-4 h-4" /> Entrar
              </>
            ) : (
              <>
                <UserPlus className="w-4 h-4" /> Registrarme
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => {
              setMode(mode === "login" ? "register" : "login");
              setForm({});
              setError("");
              setFieldIndex(0);
              setActiveField(null);
              setEditing(false);
            }}
            className="w-full text-sm text-muted-foreground hover:text-primary py-1"
          >
            {mode === "login"
              ? "¿No tienes cuenta? Regístrate"
              : "¿Ya tienes cuenta? Inicia sesión"}
          </button>

          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-border" />
            <span className="text-xs text-muted-foreground">o continúa con</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          <div className="grid grid-cols-3 gap-2">
            {["Google", "Facebook", "Apple"].map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => handleSocial(p)}
                className="h-11 rounded-xl border border-border/70 bg-card text-xs font-medium text-muted-foreground hover:bg-secondary transition-colors"
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}