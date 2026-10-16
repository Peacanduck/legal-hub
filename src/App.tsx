import { lazy, Suspense, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { Layout } from './components/Layout';
import ScrollToTop from './components/ScrollToTop';
import { Home } from './pages/Home';
import { AppHome } from './pages/AppHome';
import { LegalDoc } from './pages/LegalDoc';
import { DIGGLE_ORIGIN, ON_DIGGLE_HOST, ON_HUB_HOST } from './diggle/site';

// Diggle has its own full-bleed pages: the landing page with the on-chain
// mint, and its legal documents in the same theme. Both are lazy, and only
// the landing page loads the Solana/Metaplex code, so the rest of the site
// never pays for either.
const DigglePage = lazy(() => import('./diggle/DigglePage').then((m) => ({ default: m.DigglePage })));
const DiggleLegalPage = lazy(() =>
  import('./diggle/legal/DiggleLegalPage').then((m) => ({ default: m.DiggleLegalPage })),
);

const DIGGLE_LEGAL_TYPES = ['privacy', 'terms', 'license', 'copyright'] as const;
type DiggleLegalType = (typeof DIGGLE_LEGAL_TYPES)[number];

const diggleFallback = <div style={{ minHeight: '100vh', background: '#0b0b14' }} />;

const digglePage = (
  <Suspense fallback={diggleFallback}>
    <DigglePage />
  </Suspense>
);

const diggleLegalPage = (type: DiggleLegalType) => (
  <Suspense fallback={diggleFallback}>
    <DiggleLegalPage type={type} />
  </Suspense>
);

/** A full-page move to another origin, for in-app links that lead there. */
const LeaveFor = ({ url }: { url: string }) => {
  useEffect(() => {
    window.location.replace(url);
  }, [url]);
  return diggleFallback;
};

/** diggle.pydigital.xyz: the Diggle site at the root. Old /diggle paths fold into it. */
const DiggleSite = () => (
  <Routes>
    <Route path="/" element={digglePage} />
    {DIGGLE_LEGAL_TYPES.map((type) => (
      <Route key={type} path={`/${type}`} element={diggleLegalPage(type)} />
    ))}
    <Route path="/diggle" element={<Navigate to="/" replace />} />
    {DIGGLE_LEGAL_TYPES.map((type) => (
      <Route key={`/diggle/${type}`} path={`/diggle/${type}`} element={<Navigate to={`/${type}`} replace />} />
    ))}
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
);

/** The Py Digital hub. On its production host, Diggle pages hand off to DIGGLE_ORIGIN
 *  (vercel.json redirects full page loads; this catches in-app links). */
const HubSite = () => (
  <Routes>
    <Route path="/diggle" element={ON_HUB_HOST ? <LeaveFor url={`${DIGGLE_ORIGIN}/`} /> : digglePage} />

    {/* Explicit paths: they outrank /:appId/privacy etc. below, where a
        single /diggle/:doc route would tie with them. */}
    {DIGGLE_LEGAL_TYPES.map((type) => (
      <Route
        key={type}
        path={`/diggle/${type}`}
        element={ON_HUB_HOST ? <LeaveFor url={`${DIGGLE_ORIGIN}/${type}`} /> : diggleLegalPage(type)}
      />
    ))}

    <Route
      element={
        <Layout>
          <Outlet />
        </Layout>
      }
    >
      {/* Home Page */}
      <Route path="/" element={<Home />} />

      {/* Dynamic App Routes */}
      <Route path="/:appId" element={<AppHome />} />
      <Route path="/:appId/privacy" element={<LegalDoc type="privacy" />} />
      <Route path="/:appId/terms" element={<LegalDoc type="terms" />} />
      <Route path="/:appId/license" element={<LegalDoc type="license" />} />
      <Route path="/:appId/copyright" element={<LegalDoc type="copyright" />} />

      {/* Catch all - Redirect to Home */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Route>
  </Routes>
);

function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      {ON_DIGGLE_HOST ? <DiggleSite /> : <HubSite />}
    </BrowserRouter>
  );
}

export default App;
