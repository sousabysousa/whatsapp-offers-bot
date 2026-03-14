import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import WhatsAppSessions from "./pages/WhatsAppSessions";
import Groups from "./pages/Groups";
import Products from "./pages/Products";
import Offers from "./pages/Offers";
import History from "./pages/History";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/whatsapp" component={WhatsAppSessions} />
      <Route path="/groups" component={Groups} />
      <Route path="/products" component={Products} />
      <Route path="/offers" component={Offers} />
      <Route path="/history" component={History} />
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
