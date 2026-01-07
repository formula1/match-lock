import { Routes, Route, Outlet } from 'react-router-dom';
import { UserProvider } from './globals/user';

function Home() {
  return (
    <div style={{ padding: '2rem', fontFamily: 'system-ui, sans-serif' }}>
      <h1>Relay Room Client</h1>
      <p>React client for the relay server.</p>
    </div>
  );
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<UserProvider><Outlet /></UserProvider>} >
        <Route index element={<Home />} />
      </Route>
    </Routes>
  );
}

export default App;

