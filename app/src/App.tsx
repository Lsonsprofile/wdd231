import { Routes, Route } from 'react-router-dom';
import { AppProvider } from '@/context/AppContext';
import { Layout } from '@/components/Layout';
import { Dashboard } from '@/pages/Dashboard';
import { Activities } from '@/pages/Activities';
import { AddActivity } from '@/pages/AddActivity';
import { Calendar } from '@/pages/Calendar';
import { Reminders } from '@/pages/Reminders';
import { Statistics } from '@/pages/Statistics';
import { Profile } from '@/pages/Profile';
import { Settings } from '@/pages/Settings';

function App() {
  return (
    <AppProvider>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/activities" element={<Activities />} />
          <Route path="/add" element={<AddActivity />} />
          <Route path="/calendar" element={<Calendar />} />
          <Route path="/reminders" element={<Reminders />} />
          <Route path="/statistics" element={<Statistics />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </Layout>
    </AppProvider>
  );
}

export default App;
