import { lazy, Suspense, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { Layout } from './components/Layout';
import ScrollToTop from './components/ScrollToTop';
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

// Vorta's pages are full-bleed too, and lazy for the same reason: the
// landing page's canvas demo, and the fonts both pages share, load only on
// /vorta. The legal pages never load the demo.
const VortaPage = lazy(() => import('./vorta/VortaPage').then((m) => ({ default: m.VortaPage })));
const VortaLegalPage = lazy(() =>
  import('./vorta/legal/VortaLegalPage').then((m) => ({ default: m.VortaLegalPage })),
);

// The Py Digital home page is full-bleed as well, and lazy like the others:
// its fonts, its stylesheet and the scenes it runs, Vorta's engine among
// them, load only on /. Diggle's and Vorta's entries never fetch any of it.
const PyDigitalPage = lazy(() => import('./pydigital/PyDigitalPage').then((m) => ({ default: m.PyDigitalPage })));

const DIGGLE_LEGAL_TYPES = ['privacy', 'terms', 'license', 'copyright'] as const;
type DiggleLegalType = (typeof DIGGLE_LEGAL_TYPES)[number];

const VORTA_LEGAL_TYPES = ['privacy', 'terms', 'license', 'copyright'] as const;

const diggleFallback = <div style={{ minHeight: '100vh', background: '#0b0b14' }} />;

const digglePage = (
  <Suspense fallback={diggleFallback}>
    <DigglePage />
  </Suspense>
);

const vortaFallback = <div style={{ minHeight: '100vh', background: '#05040f' }} />;

const vortaPage = (
  <Suspense fallback={vortaFallback}>
    <VortaPage />
  </Suspense>
);

const pydigitalPage = (
  <Suspense fallback={<div style={{ minHeight: '100vh', background: '#0b0908' }} />}>
    <PyDigitalPage />
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
    <Route path="/" element={pydigitalPage} />

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

    {/* Explicit paths outrank /:appId and /:appId/privacy etc. below, which
        would put Vorta's pages inside the hub's Layout. */}
    <Route path="/vorta" element={vortaPage} />
    {VORTA_LEGAL_TYPES.map((type) => (
      <Route
        key={`/vorta/${type}`}
        path={`/vorta/${type}`}
        element={
          <Suspense fallback={vortaFallback}>
            <VortaLegalPage type={type} />
          </Suspense>
        }
      />
    ))}

    <Route
      element={
        <Layout>
          <Outlet />
        </Layout>
      }
    >
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
