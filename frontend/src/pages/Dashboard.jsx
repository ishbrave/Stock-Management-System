import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import Navbar from "../components/Navbar";

const API_URL = 'http://localhost:5000/api';

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalSpareParts: 0,
    totalStockValue: 0,
    stockInCount: 0,
    stockOutCount: 0,
    lowStockItems: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        console.log('Fetching dashboard stats with token:', token ? 'Present' : 'Missing');
        
        const response = await fetch(`${API_URL}/stock/dashboard/stats`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        console.log('Dashboard stats response status:', response.status);

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || `HTTP Error ${response.status}: Failed to fetch stats`);
        }

        const data = await response.json();
        console.log('Dashboard stats received:', data);
        setStats(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching dashboard stats:', err);
        setError(err.message || 'Failed to fetch statistics');
      } finally {
        setLoading(false);
      }
    };

    // Only fetch if user is logged in
    if (user) {
      fetchStats();
    }
  }, [user]);

  const StatCard = ({ icon, label, value /* color unused now */ }) => (
    <div className="bg-white border border-gray-300 rounded-lg shadow-lg p-6 text-black">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm opacity-90">{label}</p>
          <p className="text-3xl font-bold">{typeof value === 'number' ? value.toLocaleString() : value}</p>
        </div>
        <div className="text-4xl">{icon}</div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-white text-black">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-black mb-2">Welcome, {user?.username}! </h1>
          <p className="text-gray-600">Here's an overview of your stock management system</p>
        </div>

        {/* Stats Grid */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="text-lg text-gray-600">Loading statistics...</div>
          </div>
        ) : error ? (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            Error loading stats: {error}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
            <StatCard 
              icon="📦" 
              label="Total Spare Parts" 
              value={stats.totalSpareParts}
              color="from-blue-500 to-blue-600"
            />
            <StatCard 
              icon="💰" 
              label="Total Stock Value"
              value={` ${stats.totalStockValue.toFixed(2)}Frw`}
              color="from-green-500 to-green-600"
            />
            <StatCard 
              icon="📥" 
              label="Stock In Records"
              value={stats.stockInCount}
              color="from-purple-500 to-purple-600"
            />
            <StatCard 
              icon="📤" 
              label="Stock Out Records"
              value={stats.stockOutCount}
              color="from-orange-500 to-orange-600"
            />
            <StatCard 
              icon="⚠️" 
              label="Low Stock Items"
              value={stats.lowStockItems}
              color="from-red-500 to-red-600"
            />
          </div>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <QuickActionCard
            title="Manage Spare Parts"
            description="Add, edit, or view all spare parts inventory"
            icon="📋"
            buttonText="Go to Spare Parts"
            onClick={() => navigate('/spare-parts')}
          />
          <QuickActionCard
            title="Record Stock In"
            description="Add new stock to your inventory"
            icon="📥"
            buttonText="Record Stock In"
            onClick={() => navigate('/stock-in')}
          />
          <QuickActionCard
            title="Record Stock Out"
            description="Issue spare parts from inventory"
            icon="📤"
            buttonText="Record Stock Out"
            onClick={() => navigate('/stock-out')}
          />
          <QuickActionCard
            title="View Reports"
            description="Check stock history and transactions"
            icon="📊"
            buttonText="View Reports"
            onClick={() => navigate('/reports')}
          />
        </div>
      </div>
    </div>
  );
};

const QuickActionCard = ({ title, description, icon, buttonText, onClick /* color unused */ }) => (
  <div className="bg-white border border-gray-300 rounded-lg shadow-md p-6 cursor-pointer transition duration-300 hover:bg-gray-100">
    <div className="text-3xl mb-3 text-black">{icon}</div>
    <h3 className="text-lg font-semibold text-black mb-2">{title}</h3>
    <p className="text-sm text-gray-600 mb-4">{description}</p>
    <button
      onClick={onClick}
      className="w-full bg-black hover:bg-gray-800 text-white font-medium py-2 rounded-lg transition duration-200"
    >
      {buttonText}
    </button>
  </div>
);

export default Dashboard;
