import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import ScrollToTop from './components/ScrollToTop';
import { Home } from './pages/Home';
import { AppHome } from './pages/AppHome';
import { LegalDoc } from './pages/LegalDoc';

function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Layout>
        <Routes>
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
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;