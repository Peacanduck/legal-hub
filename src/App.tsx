import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { Layout } from './components/Layout';
import ScrollToTop from './components/ScrollToTop';
import { Home } from './pages/Home';
import { AppHome } from './pages/AppHome';
import { LegalDoc } from './pages/LegalDoc';

// Diggle has its own full-bleed pages: the landing page with the on-chain
// mint, and its legal documents in the same theme. Both are lazy, and only
// the landing page loads the Solana/Metaplex code, so the rest of the site
// never pays for either.
const DigglePage = lazy(() => import('./diggle/DigglePage').then((m) => ({ default: m.DigglePage })));
const DiggleLegalPage = lazy(() =>
  import('./diggle/legal/DiggleLegalPage').then((m) => ({ default: m.DiggleLegalPage })),
);

const DIGGLE_LEGAL_TYPES = ['privacy', 'terms', 'license', 'copyright'] as const;

const diggleFallback = <div style={{ minHeight: '100vh', background: '#0b0b14' }} />;

function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        <Route
          path="/diggle"
          element={
            <Suspense fallback={diggleFallback}>
              <DigglePage />
            </Suspense>
          }
        />

        {/* Explicit paths: they outrank /:appId/privacy etc. below, where a
            single /diggle/:doc route would tie with them. */}
        {DIGGLE_LEGAL_TYPES.map((type) => (
          <Route
            key={type}
            path={`/diggle/${type}`}
            element={
              <Suspense fallback={diggleFallback}>
                <DiggleLegalPage type={type} />
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
    </BrowserRouter>
  );
}

export default App;
