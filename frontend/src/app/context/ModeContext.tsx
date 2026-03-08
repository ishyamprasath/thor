import { createContext, useContext, useState, useCallback, ReactNode } from "react";

type Mode = "tourist" | "enterprise";

interface ModeContextType {
    mode: Mode;
    setMode: (m: Mode) => void;
    toggleMode: () => void;
}

const ModeContext = createContext<ModeContextType>({
    mode: "tourist",
    setMode: () => { },
    toggleMode: () => { },
});

export function ModeProvider({ children }: { children: ReactNode }) {
    const [mode, setMode] = useState<Mode>(
        () => (localStorage.getItem("thor-mode") as Mode) || "tourist"
    );

    const handleSetMode = useCallback((m: Mode) => {
        setMode(m);
        localStorage.setItem("thor-mode", m);
    }, []);

    const toggleMode = useCallback(() => {
        handleSetMode(mode === "tourist" ? "enterprise" : "tourist");
    }, [mode, handleSetMode]);

    return (
        <ModeContext.Provider value={{ mode, setMode: handleSetMode, toggleMode }}>
            {children}
        </ModeContext.Provider>
    );
}

export const useMode = () => useContext(ModeContext);
