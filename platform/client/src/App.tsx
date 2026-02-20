import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Jobs from "./pages/Jobs";
import Dashboard from "./pages/Dashboard";
import EmployerDashboard from "./pages/EmployerDashboard";
import Info from "./pages/Info";
import AdminPanel from "./pages/AdminPanel";
import JobDetail from "./pages/JobDetail";
import { BusinessBoxesPage } from "./pages/BusinessBoxesPage";
import { TasksPage } from "./pages/TasksPage";
import { PrivacyPolicy } from "./pages/PrivacyPolicy";
import { TermsOfService } from "./pages/TermsOfService";
import { DollsBanner } from "./components/DollsBanner";
import { Footer } from "./components/Footer";
import ReferrerLeaderboard from "./pages/ReferrerLeaderboard";
import PremiumListings from "./pages/PremiumListings";

function Router() {
  // make sure to consider if you need authentication for certain routes
  return (
    <div className="flex flex-col min-h-screen">
      <DollsBanner />
      <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/jobs"} component={Jobs} />
      <Route path={"/job-detail"} component={JobDetail} />
      <Route path={"/boxes"} component={BusinessBoxesPage} />
      <Route path={"/tasks"} component={TasksPage} />
      <Route path={"/dashboard"} component={Dashboard} />
      <Route path={"/employer-dashboard"} component={EmployerDashboard} />
      <Route path={"/about"} component={Info} />
      <Route path={"/privacy"} component={PrivacyPolicy} />
      <Route path={"/terms"} component={TermsOfService} />
      <Route path={"/info/:page"} component={Info} />
      <Route path={"/admin"} component={AdminPanel} />
      <Route path={"/leaderboard"} component={ReferrerLeaderboard} />
      <Route path={"/premium"} component={PremiumListings} />
      <Route path={"/404"} component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
    <Footer />
    </div>
  );
}

// NOTE: About Theme
// - First choose a default theme according to your design style (dark or light bg), than change color palette in index.css
//   to keep consistent foreground/background color across components
// - If you want to make theme switchable, pass `switchable` ThemeProvider and use `useTheme` hook

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="light"
        // switchable
      >
        <TooltipProvider>
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
