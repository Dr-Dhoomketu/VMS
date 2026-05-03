import { Switch, Route, Router as WouterRouter, Redirect } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";

import LandingPage from "@/pages/LandingPage";
import LoginPage from "@/pages/LoginPage";
import CheckInPage from "@/pages/CheckInPage";
import AppointmentPage from "@/pages/AppointmentPage";
import ReturningPage from "@/pages/ReturningPage";
import ApprovalsPage from "@/pages/ApprovalsPage";

import DashboardLayout from "@/pages/dashboard/DashboardLayout";
import DashboardHome from "@/pages/dashboard/DashboardHome";
import DashboardApprovals from "@/pages/dashboard/DashboardApprovals";
import DashboardVisitor from "@/pages/dashboard/DashboardVisitor";
import DashboardDepartment from "@/pages/dashboard/DashboardDepartment";
import DashboardEmployee from "@/pages/dashboard/DashboardEmployee";
import DashboardDesignation from "@/pages/dashboard/DashboardDesignation";
import DashboardAdministrator from "@/pages/dashboard/DashboardAdministrator";
import DashboardPreVisitor from "@/pages/dashboard/DashboardPreVisitor";

const queryClient = new QueryClient();

function ProtectedRoute({ component: Component }: { component: React.ComponentType }) {
  const token = localStorage.getItem('token');
  if (!token) return <Redirect to="/login" />;
  return <Component />;
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={LandingPage} />
      <Route path="/login" component={LoginPage} />
      <Route path="/check-in" component={CheckInPage} />
      <Route path="/appointment" component={AppointmentPage} />
      <Route path="/returning" component={ReturningPage} />
      <Route path="/approvals" component={ApprovalsPage} />

      <Route path="/dashboard">
        {() => (
          <ProtectedRoute component={() => (
            <DashboardLayout>
              <DashboardHome />
            </DashboardLayout>
          )} />
        )}
      </Route>
      <Route path="/dashboard/approvals">
        {() => (
          <ProtectedRoute component={() => (
            <DashboardLayout>
              <DashboardApprovals />
            </DashboardLayout>
          )} />
        )}
      </Route>
      <Route path="/dashboard/visitors">
        {() => (
          <ProtectedRoute component={() => (
            <DashboardLayout>
              <DashboardVisitor />
            </DashboardLayout>
          )} />
        )}
      </Route>
      <Route path="/dashboard/departments">
        {() => (
          <ProtectedRoute component={() => (
            <DashboardLayout>
              <DashboardDepartment />
            </DashboardLayout>
          )} />
        )}
      </Route>
      <Route path="/dashboard/employees">
        {() => (
          <ProtectedRoute component={() => (
            <DashboardLayout>
              <DashboardEmployee />
            </DashboardLayout>
          )} />
        )}
      </Route>
      <Route path="/dashboard/designations">
        {() => (
          <ProtectedRoute component={() => (
            <DashboardLayout>
              <DashboardDesignation />
            </DashboardLayout>
          )} />
        )}
      </Route>
      <Route path="/dashboard/administrators">
        {() => (
          <ProtectedRoute component={() => (
            <DashboardLayout>
              <DashboardAdministrator />
            </DashboardLayout>
          )} />
        )}
      </Route>
      <Route path="/dashboard/pre-visitors">
        {() => (
          <ProtectedRoute component={() => (
            <DashboardLayout>
              <DashboardPreVisitor />
            </DashboardLayout>
          )} />
        )}
      </Route>

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
