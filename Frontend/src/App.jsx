import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { DateProvider } from './context/DateContext';
import MainLayout from './layouts/MainLayout';
import Dashboard from './pages/Dashboard';
import Users from './pages/Users';
import Properties from './pages/Properties';
import Listings from './pages/Listings';
import Inquiries from './pages/Inquiries';
import Complaints from './pages/Complaints';
import Services from './pages/Services';
import Security from './pages/Security';
import Notifications from './pages/Notifications';
import './App.css';

function App() {
  return (
    <DateProvider>
      <Router>
        <Routes>
          <Route path="/" element={<MainLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="users" element={<Users />} />
            <Route path="properties" element={<Properties />} />
            <Route path="listings" element={<Listings />} />
            <Route path="inquiries" element={<Inquiries />} />
            <Route path="complaints" element={<Complaints />} />
            <Route path="services" element={<Services />} />
            <Route path="security" element={<Security />} />
            <Route path="notifications" element={<Notifications />} />
          </Route>
        </Routes>
      </Router>
    </DateProvider>
  );
}

export default App;
