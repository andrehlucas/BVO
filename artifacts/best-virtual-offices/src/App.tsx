import { type ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import {
  Route,
  Switch,
  useLocation,
  Router as WouterRouter,
} from 'wouter';

import { SiteHeader } from '@/components/layout/site-header';
import { SiteFooter } from '@/components/layout/site-footer';

import HomePage from '@/pages/home';
import FloridaPage from '@/pages/florida';
import CityPage from '@/pages/cities/city';
import ProvidersPage from '@/pages/providers';
import ProviderPage from '@/pages/providers/provider';
import GuidesPage from '@/pages/guides';
import GuidePage from '@/pages/guides/guide';
import MethodologyPage from '@/pages/methodology';
import AffiliateDisclosurePage from '@/pages/affiliate-disclosure';
import PrivacyPage from '@/pages/privacy';
import CorrectionsPage from '@/pages/corrections';
import GoPage from '@/pages/go';
import { JsonLd } from '@/components/seo/json-ld';
import { absoluteUrl } from '@/seo/site-url';
import { usePageMetadata } from '@/seo/use-page-metadata';

const queryClient = new QueryClient();

function Router() {
  usePageMetadata();

  return (
    <div className="site-shell">
      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: 'Best Virtual Offices',
        url: absoluteUrl('/'),
        inLanguage: 'en-US',
      }} />
      <a className="skip-link" href="#main-content">Skip to main content</a>
      <SiteHeader />
      <main className="site-frame site-main" id="main-content">
        <RoutedErrorBoundary>
          <Switch>
            <Route path="/" component={HomePage} />
            <Route path="/florida" component={FloridaPage} />
            <Route path="/cities/:city">
              {(params) => <CityPage params={params as any} />}
            </Route>
            <Route path="/providers" component={ProvidersPage} />
            <Route path="/providers/:slug">
              {(params) => <ProviderPage params={params as any} />}
            </Route>
            <Route path="/guides" component={GuidesPage} />
            <Route path="/guides/:slug">
              {(params) => <GuidePage params={params as any} />}
            </Route>
            <Route path="/methodology" component={MethodologyPage} />
            <Route path="/affiliate-disclosure" component={AffiliateDisclosurePage} />
            <Route path="/privacy" component={PrivacyPage} />
            <Route path="/corrections" component={CorrectionsPage} />
            <Route path="/go/:providerId" component={GoPage} />
            <Route component={NotFound} />
          </Switch>
        </RoutedErrorBoundary>
      </main>
      <SiteFooter />
    </div>
  );
}

function RoutedErrorBoundary({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  return <ErrorBoundary resetKey={location}>{children}</ErrorBoundary>;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
