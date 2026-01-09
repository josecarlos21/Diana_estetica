import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Home } from './pages/Home';
import { Booking } from './pages/Booking';
import { AiConsultant } from './pages/AiConsultant';
import { History } from './pages/History';

const App: React.FC = () => {
  return (
    <HashRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/booking" element={<Booking />} />
          <Route path="/ai-consultant" element={<AiConsultant />} />
          <Route path="/history" element={<History />} />
        </Routes>
      </Layout>
    </HashRouter>
  );
};

export default App;