import { useEffect, useRef } from "react";
import { Switch, Route, Router as WouterRouter, useLocation } from "wouter";
import { QueryClient, QueryClientProvider, useQueryClient } from "@tanstack/react-query";
import { ClerkProvider, Show, useClerk } from "@clerk/react";
import { captureFocoToken } from "@/lib/foco360";
import { ptBR } from "@clerk/localizations";
import { dark } from "@clerk/themes";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Home from "@/pages/home";
import SignInPage from "@/pages/sign-in";
import SignUpPage from "@/pages/sign-up";
import NotFound from "@/pages/not-found";

const queryClient = new QueryClient();
const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
const clerkProxyUrl = import.meta.env.VITE_CLERK_PROXY_URL;

function stripBase(path: string): string {
  return basePath && path.startsWith(basePath)
    ? path.slice(basePath.length) || "/"
    : path;
}

function ClerkQueryClientCacheInvalidator() {
  const { addListener } = useClerk();
  const qc = useQueryClient();
  const prevUserIdRef = useRef<string | null | undefined>(undefined);

  useEffect(() => {
    const unsubscribe = addListener(({ user }) => {
      const userId = user?.id ?? null;
      if (prevUserIdRef.current !== undefined && prevUserIdRef.current !== userId) {
        qc.clear();
      }
      prevUserIdRef.current = userId;
    });
    return unsubscribe;
  }, [addListener, qc]);

  return null;
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/sign-in/*?" component={SignInPage} />
      <Route path="/sign-up/*?" component={SignUpPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function ClerkProviderWithRoutes() {
  const [, setLocation] = useLocation();

  if (!clerkPubKey) {
    return (
      <div className="flex items-center justify-center min-h-screen text-red-500">
        VITE_CLERK_PUBLISHABLE_KEY não configurado.
      </div>
    );
  }

  return (
    <ClerkProvider
      publishableKey={clerkPubKey}
      proxyUrl={clerkProxyUrl}
      localization={ptBR}
      signInUrl={`${basePath}/sign-in`}
      signUpUrl={`${basePath}/sign-up`}
      afterSignOutUrl={`${basePath}/`}
      appearance={{
        baseTheme: dark,
        cssLayerName: "clerk",
        options: {
          logoPlacement: "inside" as const,
          logoLinkUrl: basePath || "/",
          logoImageUrl: `${window.location.origin}${basePath}/logo.svg`,
        },
        variables: {
          colorPrimary: "#d4a636",
          colorForeground: "#fafafa",
          colorMutedForeground: "#a1a1aa",
          colorBackground: "#09090b",
          colorInput: "#18181b",
          colorInputForeground: "#fafafa",
          colorNeutral: "#3f3f46",
          colorDanger: "#ef4444",
          borderRadius: "0.5rem",
          fontFamily: "DM Sans, sans-serif",
        },
        elements: {
          rootBox: "w-full flex justify-center",
          cardBox: "rounded-xl w-[440px] max-w-full overflow-hidden border border-zinc-800 bg-zinc-950",
          card: "!shadow-none !border-0 !bg-transparent !rounded-none",
          footer: "!shadow-none !border-0 !bg-transparent !rounded-none",
          headerTitle: "text-gold font-outfit",
          headerSubtitle: "text-zinc-400",
          socialButtonsBlockButtonText: "text-zinc-200",
          formFieldLabel: "text-zinc-300",
          footerActionLink: "text-gold hover:text-gold/80",
          footerActionText: "text-zinc-400",
          dividerText: "text-zinc-500",
          formButtonPrimary: "bg-gold hover:opacity-90 text-black font-semibold shadow-none",
          formFieldInput: "border-zinc-700",
          dividerLine: "bg-zinc-700",
          identityPreviewEditButton: "text-gold",
          alertText: "text-zinc-200",
          formFieldSuccessText: "text-green-400",
        },
      }}
      routerPush={(to) => setLocation(stripBase(to))}
      routerReplace={(to) => setLocation(stripBase(to), { replace: true })}
    >
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <ClerkQueryClientCacheInvalidator />
          <Router />
          <Toaster />
        </TooltipProvider>
      </QueryClientProvider>
    </ClerkProvider>
  );
}

function App() {
  useEffect(() => {
    captureFocoToken();
  }, []);

  return (
    <WouterRouter base={basePath}>
      <ClerkProviderWithRoutes />
    </WouterRouter>
  );
}

export default App;
