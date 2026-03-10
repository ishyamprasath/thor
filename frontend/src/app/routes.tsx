import { createBrowserRouter, Navigate, useRouteError, useNavigate } from "react-router";
import AppShell from "./layouts/AppShell";
import EnterpriseShell from "./layouts/EnterpriseShell";
import AuthLayout from "./layouts/AuthLayout";

// Auth pages
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";

// Tourist pages
import Dashboard from "./pages/tourist/Dashboard";
import SafetyMap from "./pages/tourist/SafetyMap";
import TripPlanner from "./pages/tourist/TripPlanner";
import ActiveJourney from "./pages/tourist/ActiveJourney";
import SafetyMonitor from "./pages/tourist/SafetyMonitor";
import Concierge from "./pages/tourist/Concierge";
import GlobalChatbot from "./pages/tourist/GlobalChatbot";
import Community from "./pages/tourist/Community";
import VoiceAI from "./pages/tourist/VoiceAI";
import Emergency from "./pages/tourist/Emergency";
import Profile from "./pages/tourist/Profile";
import SettingsPage from "./pages/Settings";

// Enterprise pages
import EnterpriseHome from './pages/enterprise/EnterpriseHome';
import CommandCenter from "./pages/enterprise/CommandCenter";
import EnterpriseTrips from "./pages/enterprise/Trips";
import TouristView from "./pages/enterprise/TouristView";
import Authority from "./pages/enterprise/Authority";
import ActivityFeed from "./pages/enterprise/ActivityFeed";
import EnterpriseSettings from "./pages/enterprise/EnterpriseSettings";
import EnterpriseChat from "./pages/enterprise/EnterpriseChat";
import EnterpriseVoice from "./pages/enterprise/EnterpriseVoice";
import EnterpriseCommunity from "./pages/enterprise/EnterpriseCommunity";

function ErrorPage() {
  const error: any = useRouteError();
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center text-center p-8">
      <div className="text-6xl mb-6">⚠️</div>
      <h1 className="text-3xl font-bold text-white mb-2">
        {error?.status === 404 ? "Page Not Found" : "Something went wrong"}
      </h1>
      <p className="text-zinc-500 mb-8 max-w-sm">
        {error?.status === 404
          ? "The page you're looking for doesn't exist or was moved."
          : error?.message || "An unexpected error occurred."}
      </p>
      <button
        onClick={() => navigate(-1)}
        className="px-6 py-3 bg-yellow-500 text-black font-bold rounded-xl hover:bg-yellow-400 transition-colors"
      >
        ← Go Back
      </button>
    </div>
  );
}

export const router = createBrowserRouter([
  // Public — Auth layout
  {
    element: <AuthLayout />,
    errorElement: <ErrorPage />,
    children: [
      { path: "/login", element: <Login /> },
      { path: "/register", element: <Register /> },
    ],
  },

  // Protected — App shell
  {
    element: <AppShell />,
    errorElement: <ErrorPage />,
    children: [
      { path: "/dashboard", element: <Dashboard /> },
      { path: "/map", element: <SafetyMap /> },
      { path: "/planner", element: <TripPlanner /> },
      { path: "/planner/active", element: <ActiveJourney /> },
      { path: "/planner/navigate", element: <SafetyMonitor /> },
      { path: "/concierge", element: <Concierge /> },
      { path: "/chat", element: <GlobalChatbot /> },
      { path: "/community", element: <Community /> },
      { path: "/voice", element: <VoiceAI /> },
      { path: "/emergency", element: <Emergency /> },
      { path: "/profile", element: <Profile /> },
      { path: "/settings", element: <SettingsPage /> },
    ],
  },

  // Protected — Enterprise Shell (Desktop Landscape)
  {
    element: <EnterpriseShell />,
    errorElement: <ErrorPage />,
    children: [
      { path: "/enterprise", element: <EnterpriseHome /> },
      { path: "/enterprise/trip/:id", element: <CommandCenter /> },
      { path: "/enterprise/trips", element: <EnterpriseTrips /> },
      { path: "/enterprise/tourist/:id", element: <TouristView /> },
      { path: "/enterprise/authority", element: <Authority /> },
      { path: "/enterprise/activity", element: <ActivityFeed /> },
      { path: "/enterprise/chat", element: <EnterpriseChat /> },
      { path: "/enterprise/voice", element: <EnterpriseVoice /> },
      { path: "/enterprise/community", element: <EnterpriseCommunity /> },
      { path: "/enterprise/settings", element: <EnterpriseSettings /> },
    ]
  },

  // Root redirect
  { path: "/", element: <Navigate to="/login" replace /> },
  { path: "*", element: <ErrorPage /> },
]);
