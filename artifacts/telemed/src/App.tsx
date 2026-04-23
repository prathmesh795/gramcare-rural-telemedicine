import { useEffect, useRef } from "react";
import {
  ClerkProvider,
  Show,
  useClerk,
} from "@clerk/react";
import {
  Switch,
  Route,
  Redirect,
  useLocation,
  Router as WouterRouter,
} from "wouter";
import {
  QueryClientProvider,
  useQueryClient,
} from "@tanstack/react-query";
import { Toaster } from "sonner";
import { queryClient } from "./lib/queryClient";
import { useSyncLanguageWithProfile } from "./lib/i18n";
import { AppShell } from "./components/layout/app-shell";
import Landing from "./pages/landing";
import { SignInPage, SignUpPage } from "./pages/auth-pages";
import RoleSelect from "./pages/role-select";
import PatientDashboard from "./pages/patient/dashboard";
import BookAppointment from "./pages/patient/book";
import PatientAppointments from "./pages/patient/appointments";
import PatientDocuments from "./pages/patient/documents";
import SymptomChecker from "./pages/patient/symptoms";
import EmergencyPage from "./pages/patient/emergency";
import DoctorDashboard from "./pages/doctor/dashboard";
import DoctorAppointments from "./pages/doctor/appointments";
import PatientRecords from "./pages/doctor/patient-records";
import ChatList from "./pages/chat/list";
import ChatThread from "./pages/chat/thread";
import NotFound from "./pages/not-found";
import { RoleGate, SignedInOnly } from "./components/layout/role-gate";
import { useGetMyProfile } from "@workspace/api-client-react";

const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
const clerkProxyUrl = import.meta.env.VITE_CLERK_PROXY_URL;
const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

if (!clerkPubKey) {
  throw new Error("Missing VITE_CLERK_PUBLISHABLE_KEY");
}

function stripBase(path: string): string {
  return basePath && path.startsWith(basePath)
    ? path.slice(basePath.length) || "/"
    : path;
}

const clerkAppearance = {
  variables: {
    colorPrimary: "#b35136",
    colorForeground: "#3d3633",
    colorMutedForeground: "#6b6159",
    colorBackground: "#ffffff",
    colorInput: "#faf7f3",
    colorInputForeground: "#3d3633",
    colorDanger: "#dc2626",
    colorNeutral: "#d6c9ba",
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    borderRadius: "0.75rem",
  },
  elements: {
    rootBox: "w-full",
    cardBox: "bg-white rounded-2xl w-[440px] max-w-full overflow-hidden shadow-sm border border-border",
    card: "!shadow-none !border-0 !bg-transparent !rounded-none",
    footer: "!shadow-none !border-0 !bg-transparent",
    headerTitle: "text-2xl font-semibold text-foreground",
    headerSubtitle: "text-muted-foreground",
    formButtonPrimary:
      "bg-primary hover:bg-primary/90 text-primary-foreground normal-case font-medium",
    formFieldLabel: "text-foreground font-medium",
    formFieldInput:
      "bg-muted border-border text-foreground",
    footerActionText: "text-muted-foreground",
    footerActionLink: "text-primary hover:text-primary/80 font-medium",
  },
};

function ClerkQueryClientCacheInvalidator() {
  const { addListener } = useClerk();
  const queryClient = useQueryClient();
  const prevUserIdRef = useRef<string | null | undefined>(undefined);
  useEffect(() => {
    const unsubscribe = addListener(({ user }) => {
      const userId = user?.id ?? null;
      if (
        prevUserIdRef.current !== undefined &&
        prevUserIdRef.current !== userId
      ) {
        queryClient.clear();
      }
      prevUserIdRef.current = userId;
    });
    return unsubscribe;
  }, [addListener, queryClient]);
  return null;
}

function HomeRedirect() {
  return (
    <>
      <Show when="signed-in">
        <HomeRoleRedirect />
      </Show>
      <Show when="signed-out">
        <AppShell>
          <Landing />
        </AppShell>
      </Show>
    </>
  );
}

function HomeRoleRedirect() {
  const { data: profile, isLoading } = useGetMyProfile();
  if (isLoading || !profile) return null;
  if (profile.role === "doctor") return <Redirect to="/doctor" />;
  if (profile.role === "patient") return <Redirect to="/patient" />;
  return <Redirect to="/role-select" />;
}

function LangSync() {
  useSyncLanguageWithProfile();
  return null;
}

function Routes() {
  return (
    <Switch>
      <Route path="/" component={HomeRedirect} />
      <Route path="/sign-in/*?" component={SignInPage} />
      <Route path="/sign-up/*?" component={SignUpPage} />
      <Route path="/role-select" component={RoleSelect} />

      <Route path="/patient">
        <RoleGate role="patient">
          <AppShell>
            <PatientDashboard />
          </AppShell>
        </RoleGate>
      </Route>
      <Route path="/patient/book">
        <RoleGate role="patient">
          <AppShell>
            <BookAppointment />
          </AppShell>
        </RoleGate>
      </Route>
      <Route path="/patient/appointments">
        <RoleGate role="patient">
          <AppShell>
            <PatientAppointments />
          </AppShell>
        </RoleGate>
      </Route>
      <Route path="/patient/documents">
        <RoleGate role="patient">
          <AppShell>
            <PatientDocuments />
          </AppShell>
        </RoleGate>
      </Route>
      <Route path="/patient/symptoms">
        <RoleGate role="patient">
          <AppShell>
            <SymptomChecker />
          </AppShell>
        </RoleGate>
      </Route>
      <Route path="/patient/emergency">
        <RoleGate role="patient">
          <AppShell>
            <EmergencyPage />
          </AppShell>
        </RoleGate>
      </Route>

      <Route path="/doctor">
        <RoleGate role="doctor">
          <AppShell>
            <DoctorDashboard />
          </AppShell>
        </RoleGate>
      </Route>
      <Route path="/doctor/appointments">
        <RoleGate role="doctor">
          <AppShell>
            <DoctorAppointments />
          </AppShell>
        </RoleGate>
      </Route>
      <Route path="/doctor/patients/:patientId/records">
        <RoleGate role="doctor">
          <AppShell>
            <PatientRecords />
          </AppShell>
        </RoleGate>
      </Route>

      <Route path="/chat">
        <SignedInOnly>
          <AppShell>
            <ChatList />
          </AppShell>
        </SignedInOnly>
      </Route>
      <Route path="/chat/:otherUserId">
        <SignedInOnly>
          <AppShell>
            <ChatThread />
          </AppShell>
        </SignedInOnly>
      </Route>

      <Route>
        <NotFound />
      </Route>
    </Switch>
  );
}

function ClerkProviderWithRoutes() {
  const [, setLocation] = useLocation();
  return (
    <ClerkProvider
      publishableKey={clerkPubKey}
      proxyUrl={clerkProxyUrl}
      appearance={clerkAppearance}
      signInUrl={`${basePath}/sign-in`}
      signUpUrl={`${basePath}/sign-up`}
      routerPush={(to) => setLocation(stripBase(to))}
      routerReplace={(to) => setLocation(stripBase(to), { replace: true })}
    >
      <QueryClientProvider client={queryClient}>
        <ClerkQueryClientCacheInvalidator />
        <Show when="signed-in">
          <LangSync />
        </Show>
        <Routes />
        <Toaster richColors position="top-center" />
      </QueryClientProvider>
    </ClerkProvider>
  );
}

function App() {
  return (
    <WouterRouter base={basePath}>
      <ClerkProviderWithRoutes />
    </WouterRouter>
  );
}

export default App;
