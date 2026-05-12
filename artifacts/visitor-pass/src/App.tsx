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
import VideoPage from "@/pages/VideoPage";

import DashboardLayout from "@/pages/dashboard/DashboardLayout";
import DashboardHome from "@/pages/dashboard/DashboardHome";
import DashboardApprovals from "@/pages/dashboard/DashboardApprovals";
import DashboardVisitor from "@/pages/dashboard/DashboardVisitor";
import DashboardDepartment from "@/pages/dashboard/DashboardDepartment";
import DashboardEmployee from "@/pages/dashboard/DashboardEmployee";
import DashboardDesignation from "@/pages/dashboard/DashboardDesignation";
import DashboardAdministrator from "@/pages/dashboard/DashboardAdministrator";
import DashboardPreVisitor from "@/pages/dashboard/DashboardPreVisitor";
import DashboardPermissions from "@/pages/dashboard/DashboardPermissions";

const queryClient = new QueryClient();

function ProtectedRoute({ component: Component }: { component: React.ComponentType }) {
  const token = localStorage.getItem('token');
  if (!token) return <Redirect to="/login" />;
  return <Component />;
}

function DashboardRoute({ component: Component }: { component: React.ComponentType }) {
  return (
    <ProtectedRoute component={() => (
      <DashboardLayout>
        <Component />
      </DashboardLayout>
    )} />
  );
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
      <Route path="/video" component={VideoPage} />

      {/* Dashboard home */}
      <Route path="/dashboard">{() => <DashboardRoute component={DashboardHome} />}</Route>

      {/* Approvals */}
      <Route path="/dashboard/approvals">{() => <DashboardRoute component={DashboardApprovals} />}</Route>

      {/* Visitors — plural and singular */}
      <Route path="/dashboard/visitors">{() => <DashboardRoute component={DashboardVisitor} />}</Route>
      <Route path="/dashboard/visitor">{() => <DashboardRoute component={DashboardVisitor} />}</Route>

      {/* Departments — plural, singular, and admin alias */}
      <Route path="/dashboard/departments">{() => <DashboardRoute component={DashboardDepartment} />}</Route>
      <Route path="/dashboard/department">{() => <DashboardRoute component={DashboardDepartment} />}</Route>
      <Route path="/admin/departments">{() => <DashboardRoute component={DashboardDepartment} />}</Route>

      {/* Employees — plural and singular */}
      <Route path="/dashboard/employees">{() => <DashboardRoute component={DashboardEmployee} />}</Route>
      <Route path="/dashboard/employee">{() => <DashboardRoute component={DashboardEmployee} />}</Route>

      {/* Designations — plural and singular */}
      <Route path="/dashboard/designations">{() => <DashboardRoute component={DashboardDesignation} />}</Route>
      <Route path="/dashboard/designation">{() => <DashboardRoute component={DashboardDesignation} />}</Route>

      {/* Administrators — plural and singular */}
      <Route path="/dashboard/administrators">{() => <DashboardRoute component={DashboardAdministrator} />}</Route>
      <Route path="/dashboard/administrator">{() => <DashboardRoute component={DashboardAdministrator} />}</Route>

      {/* Pre-visitors — plural and singular */}
      <Route path="/dashboard/pre-visitors">{() => <DashboardRoute component={DashboardPreVisitor} />}</Route>
      <Route path="/dashboard/pre-visitor">{() => <DashboardRoute component={DashboardPreVisitor} />}</Route>

      {/* Permissions */}
      <Route path="/dashboard/permissions">{() => <DashboardRoute component={DashboardPermissions} />}</Route>

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
