import { createBrowserRouter } from "react-router";
import Landing from "./pages/Landing";
import TouristDashboard from "./pages/tourist/Dashboard";
import TouristDestination from "./pages/tourist/Destination";
import TouristRoutePlanner from "./pages/tourist/RoutePlanner";
import TouristMonitoring from "./pages/tourist/Monitoring";
import TouristConcierge from "./pages/tourist/Concierge";
import TouristEmergency from "./pages/tourist/Emergency";
import EnterpriseDashboard from "./pages/enterprise/Dashboard";
import EnterpriseOnboarding from "./pages/enterprise/Onboarding";
import EnterpriseTripPlanner from "./pages/enterprise/TripPlanner";
import EnterpriseTouristView from "./pages/enterprise/TouristView";
import EnterpriseAuthority from "./pages/enterprise/Authority";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Landing />,
  },
  {
    path: "/tourist/dashboard",
    element: <TouristDashboard />,
  },
  {
    path: "/tourist/destination",
    element: <TouristDestination />,
  },
  {
    path: "/tourist/route-planner",
    element: <TouristRoutePlanner />,
  },
  {
    path: "/tourist/monitoring",
    element: <TouristMonitoring />,
  },
  {
    path: "/tourist/concierge",
    element: <TouristConcierge />,
  },
  {
    path: "/tourist/emergency",
    element: <TouristEmergency />,
  },
  {
    path: "/enterprise/onboarding",
    element: <EnterpriseOnboarding />,
  },
  {
    path: "/enterprise/dashboard",
    element: <EnterpriseDashboard />,
  },
  {
    path: "/enterprise/trip-planner",
    element: <EnterpriseTripPlanner />,
  },
  {
    path: "/enterprise/tourist/:id",
    element: <EnterpriseTouristView />,
  },
  {
    path: "/enterprise/authority",
    element: <EnterpriseAuthority />,
  },
]);
