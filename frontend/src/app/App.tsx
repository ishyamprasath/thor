import { RouterProvider } from "react-router";
import { router } from "./routes";
import { AuthProvider } from "./context/AuthContext";
import { ModeProvider } from "./context/ModeContext";
import { TranslationProvider } from "./context/TranslationContext";
import { ThemeProvider } from "./context/ThemeContext";
import { SplashProvider } from "./context/SplashContext";
import { NotificationProvider } from "./context/NotificationContext";
import SplashScreen from "./components/SplashScreen";
import { useSplash } from "./context/SplashContext";

function AppContent() {
  const { hasSeenSplash } = useSplash();
  
  return (
    <>
      {!hasSeenSplash && <SplashScreen />}
      <RouterProvider router={router} />
    </>
  );
}

export default function App() {
  return (
    <SplashProvider>
      <NotificationProvider>
        <AuthProvider>
          <ModeProvider>
            <TranslationProvider>
              <ThemeProvider>
                <AppContent />
              </ThemeProvider>
            </TranslationProvider>
          </ModeProvider>
        </AuthProvider>
      </NotificationProvider>
    </SplashProvider>
  );
}