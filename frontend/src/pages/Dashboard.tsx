import { AlertTriangle, CheckCircle, MapPin, Truck, TrendingUp, Activity } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import api from '../services/api';

interface Stats {
  totalVehicles: number;
  activeTrips: number;
  maintenanceVehicles: number;
  availableDrivers: number;
}

const StatCard = ({ title, value, icon: Icon, color, loading }: any) => (
  <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 flex items-center hover:shadow-md transition-shadow duration-200">
    <div className={`p-4 rounded-2xl ${color} bg-opacity-10 mr-4`}>
      <Icon className={`h-6 w-6 ${color.replace('bg-', 'text-')}`} />
    </div>
    <div>
      <h3 className="text-slate-500 text-sm font-medium">{title}</h3>
      {loading ? (
        <div className="h-8 w-16 bg-slate-200 rounded animate-pulse mt-1"></div>
      ) : (
        <p className="text-2xl font-bold text-slate-800">{value}</p>
      )}
    </div>
  </div>
);

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<Stats>({
    totalVehicles: 0,
    activeTrips: 0,
    maintenanceVehicles: 0,
    availableDrivers: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      // Fetch real data from API endpoints
      const [vehiclesRes, tripsRes, driversRes] = await Promise.allSettled([
        api.get('/vehicles'),
        api.get('/trips/active'),
        api.get('/drivers/available'),
      ]);

      const vehicles = vehiclesRes.status === 'fulfilled' ? vehiclesRes.value.data : [];
      const activeTrips = tripsRes.status === 'fulfilled' ? tripsRes.value.data : [];
      const availableDrivers = driversRes.status === 'fulfilled' ? driversRes.value.data : [];

      setStats({
        totalVehicles: vehicles.length,
        activeTrips: activeTrips.length,
        maintenanceVehicles: vehicles.filter((v: any) => v.status === 'MAINTENANCE').length,
        availableDrivers: availableDrivers.length,
      });
    } catch (error) {
      console.error('Failed to fetch stats', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Dashboard</h1>
          <p className="text-slate-500 text-sm mt-1">Fleet overview and key metrics</p>
        </div>
        <button
          onClick={() => { setLoading(true); fetchStats(); }}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
        >
          <Activity className="h-4 w-4" />
          Refresh
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Vehicles" value={stats.totalVehicles} icon={Truck} color="bg-blue-500" loading={loading} />
        <StatCard title="Active Trips" value={stats.activeTrips} icon={MapPin} color="bg-green-500" loading={loading} />
        <StatCard title="In Maintenance" value={stats.maintenanceVehicles} icon={AlertTriangle} color="bg-orange-500" loading={loading} />
        <StatCard title="Available Drivers" value={stats.availableDrivers} icon={CheckCircle} color="bg-purple-500" loading={loading} />
      </div>

      {/* Quick Info */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-slate-800">Fleet Status</h2>
            <TrendingUp className="h-5 w-5 text-green-500" />
          </div>
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-4 bg-slate-100 rounded animate-pulse" style={{width: `${80 - i * 15}%`}}></div>
              ))}
            </div>
          ) : stats.totalVehicles === 0 ? (
            <div className="text-slate-400 italic text-sm py-4">No vehicles registered yet. Add vehicles to see fleet status.</div>
          ) : (
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-600">Active Vehicles</span>
                <span className="text-sm font-semibold text-green-600">
                  {stats.totalVehicles - stats.maintenanceVehicles}
                </span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2">
                <div
                  className="bg-green-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${stats.totalVehicles > 0 ? ((stats.totalVehicles - stats.maintenanceVehicles) / stats.totalVehicles) * 100 : 0}%` }}
                ></div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-600">In Maintenance</span>
                <span className="text-sm font-semibold text-orange-600">{stats.maintenanceVehicles}</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2">
                <div
                  className="bg-orange-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${stats.totalVehicles > 0 ? (stats.maintenanceVehicles / stats.totalVehicles) * 100 : 0}%` }}
                ></div>
              </div>
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
          <h2 className="text-lg font-bold text-slate-800 mb-4">Recent Activity</h2>
          <div className="text-slate-400 italic text-sm py-4">
            {stats.activeTrips > 0
              ? `${stats.activeTrips} trip(s) currently in progress.`
              : 'No recent trips or alerts recorded. Create a trip to start tracking.'}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;