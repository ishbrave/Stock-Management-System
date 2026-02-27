import { Routes, Route, Navigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "./context/AuthContext";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import SpareParts from "./pages/SpareParts";
import StockIn from "./pages/StockIn";
import StockOut from "./pages/StockOut";

function App() {
  const { user, loading } = useContext(AuthContext);

  console.log('App rendering - User:', user ? user.username : 'Not logged in', 'Loading:', loading);

  // Check if user is authenticated by checking both user and token
  const isAuthenticated = user && localStorage.getItem('token');

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-indigo-500 to-purple-600">
        <div className="text-center">
          <div className="inline-block">
            <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin mb-4"></div>
          </div>
          <p className="text-lg text-white font-semibold">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/" element={isAuthenticated ? <Dashboard /> : <Navigate to="/login" replace />} />
      <Route path="/login" element={isAuthenticated ? <Navigate to="/" replace /> : <Login />} />
      <Route path="/register" element={isAuthenticated ? <Navigate to="/" replace /> : <Register />} />
      <Route path="/spare-parts" element={isAuthenticated ? <SpareParts /> : <Navigate to="/login" replace />} />
      <Route path="/stock-in" element={isAuthenticated ? <StockIn /> : <Navigate to="/login" replace />} />
      <Route path="/stock-out" element={isAuthenticated ? <StockOut /> : <Navigate to="/login" replace />} />
    </Routes>
  );
}

export default App;
