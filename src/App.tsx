import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { Layout } from './components/Layout';
import ScrollToTop from './components/ScrollToTop';
import { Home } from './pages/Home';
import { AppHome } from './pages/AppHome';
import { LegalDoc } from './pages/LegalDoc';

// Diggle has its own full-bleed page with an on-chain mint. It's lazy so
// the Solana/Metaplex bundle only loads for /diggle, never the rest of the
// site. Diggle's legal pages still use the shared routes below.
const DigglePage = lazy(() => import('./diggle/DigglePage').then((m) => ({ default: m.DigglePage })));

function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        <Route
          path="/diggle"
          element={
            <Suspense fallback={<div style={{ minHeight: '100vh', background: '#0b0b14' }} />}>
              <DigglePage />
            </Suspense>
          }
        />

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
