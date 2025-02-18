import { Language_Config } from "@/app/(root)/_constants";
import { CodeEditorState } from "@/types";
import { Monaco } from "@monaco-editor/react";
import { create } from "zustand";

const getInitialState = () => {
  // if on the server, return default values
  if (typeof window === "undefined") {
    return {
      language: "javascript",
      fontSize: 16,
      theme: "vs-dark",
    };
  }

  // if on the client, return values from local storage bc localstorage is a browser API
  const savedLanguage = localStorage.getItem("editor-language") || "javascript";
  const savedTheme = localStorage.getItem("editor-theme") || "vs-dark";
  const savedFontSize = localStorage.getItem("editor-font-size") || 16;
  return {
    language: savedLanguage,
    theme: savedTheme,
    fontSize: Number(savedFontSize),
  };
};
export const useCodeEditorStore = create<CodeEditorState>((set, get) => {
  const initialState = getInitialState();
  return {
    ...initialState,
    output: "",
    isRunning: false,
    error: null,
    editor: null,
    executionResult: null,

    getCode: () => get().editor?.getValue() || "",

    setEditor: (editor: Monaco) => {
      const savedCode = localStorage.getItem(`editor-code-${get().language}`);
      if (savedCode) editor.setValue(savedCode);

      set({ editor });
    },

    setTheme: (theme: string) => {
      localStorage.setItem("editor-theme", theme);
      set({ theme });
    },

    setFontSize: (fontSize: number) => {
      localStorage.setItem("editor-font-size", fontSize.toString());
      set({ fontSize });
    },

    setLanguage: (language: string) => {
      // save current language before switching
      const currentCode = get().editor?.getValue();
      if (currentCode) {
        localStorage.setItem(`editor-code-${get().language}`, currentCode);
      }

      localStorage.setItem("editor-language", language);
      set({
        language,
        output: "",
        error: null,
      });
    },

    runCode: async () => {
      const { language, getCode } = get();
      const code = getCode();

      if (!code) {
        set({ error: "No code to run, please write some code first" });
        return;
      }

      set({ isRunning: true, error: null, output: "" });

      try {
        const runtime = Language_Config[language].pistonRuntime;
        const response = await fetch("https://emkc.org/api/v2/piston/execute", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            language: runtime.language,
            version: runtime.version,
            files: [{ content: code }],
          }),
        });

        const data = await response.json();
        console.log("Data Back from Piston: ", data);

        // handle the response from the piston api error
        if (data.message) {
          set({
            error: data.message,
            executionResult: {
              code,
              output: "",
              error: data.message,
            },
          });
          return;
        }
      } catch (error) {}
    },
  };
});
