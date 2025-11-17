import { Link, Routes, Route } from 'react-router-dom';

import Home from './pages/Home.jsx';
import Orbit from './pages/Orbit.jsx';
import Contacts from './pages/Contacts.jsx';
import Notes from './pages/Notes.jsx';
import Reminders from './pages/Reminders.jsx';
import Insights from './pages/Insights.jsx';
import Profile from './pages/Profile.jsx';

function App() {
  return (
    <div style={{ fontFamily: 'system-ui, sans-serif' }}>
      <header
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0.75rem 1.5rem',
          borderBottom: '1px solid #eee',
          background: '#fff',
          position: 'sticky',
          top: 0,
          zIndex: 10,
        }}
      >
        <div style={{ fontWeight: 700 }}>ReKindle</div>
        <nav style={{ display: 'flex', gap: '1rem' }}>
          <Link to="/">Home</Link>
          <Link to="/orbit">Orbit</Link>
          <Link to="/contacts">Contacts</Link>
          <Link to="/notes">Notes</Link>
          <Link to="/reminders">Reminders</Link>
          <Link to="/insights">Insights</Link>
          <Link to="/profile">Profile</Link>
        </nav>
      </header>

      <main style={{ padding: '1.5rem' }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/orbit" element={<Orbit />} />
          <Route path="/contacts" element={<Contacts />} />
          <Route path="/notes" element={<Notes />} />
          <Route path="/reminders" element={<Reminders />} />
          <Route path="/insights" element={<Insights />} />
          <Route path="/profile" element={<Profile />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
