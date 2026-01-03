import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { ModeProvider } from './context/ModeContext';
import { AuthProvider } from './context/AuthContext';
import Header from './components/Header';
import Chatbot from './components/Chatbot';
import HomePage from './pages/HomePage';
import SearchPage from './pages/SearchPage';
import PropertyDetailPage from './pages/PropertyDetailPage';
import SavedPage from './pages/SavedPage';
import MessagesPage from './pages/MessagesPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProfilePage from './pages/ProfilePage';
import ListPropertyPage from './pages/ListPropertyPage';
import MyListingsPage from './pages/MyListingsPage';
import EditListingPage from './pages/EditListingPage';

// Layout wrapper that conditionally shows header
function AppLayout({ children }) {
  const location = useLocation();
  const hideHeaderPaths = ['/login', '/register', '/list-property'];
  const showHeader = !hideHeaderPaths.includes(location.pathname);
  
  return (
    <div className="min-h-screen bg-slate-50">
      {showHeader && <Header />}
      {children}
    </div>
  );
}

function App() {
  return (
    <ModeProvider>
      <AuthProvider>
        <Router>
          <AppLayout>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/search" element={<SearchPage />} />
              <Route path="/property/:id" element={<PropertyDetailPage />} />
              <Route path="/saved" element={<SavedPage />} />
              <Route path="/messages" element={<MessagesPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/list-property" element={<ListPropertyPage />} />
              <Route path="/my-listings" element={<MyListingsPage />} />
              <Route path="/edit-listing/:id" element={<EditListingPage />} />
            </Routes>
            <Chatbot />
          </AppLayout>
        </Router>
      </AuthProvider>
    </ModeProvider>
  );
}

export default App;
