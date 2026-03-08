import { RouterProvider } from "react-router";
import { router } from "./routes";
import { AuthProvider } from "./context/AuthContext";
import { ModeProvider } from "./context/ModeContext";
import { TranslationProvider } from "./context/TranslationContext";
import { ThemeProvider } from "./context/ThemeContext";

export default function App() {
  return (
    <AuthProvider>
      <ModeProvider>
        <TranslationProvider>
          <ThemeProvider>
            <RouterProvider router={router} />
          </ThemeProvider>
        </TranslationProvider>
      </ModeProvider>
    </AuthProvider>
  );
}