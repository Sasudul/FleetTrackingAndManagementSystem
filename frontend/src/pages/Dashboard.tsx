import React, { useEffect, useState } from 'react';
import api from '../services/api';

interface Stats {
  totalVehicles: number;
  activeTrips: number;
  maintenanceVehicles: number;
  availableDrivers: number;
}

const StatCard = ({ title, value, loading }: any) => (
  <div className="bg-pureWhite rounded-featured shadow-level-1 p-6 flex flex-col justify-center">
    <h3 className="text-bodyGray text-sm font-medium mb-3">{title}</h3>
    {loading ? (
      <div className="h-[38px] w-20 bg-chipGray rounded animate-pulse mt-1"></div>
    ) : (
      <p className="text-[32px] leading-tight font-bold font-display text-uberBlack">{value}</p>
    )}
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

  useEffect(() => { fetchStats(); }, []);

  const fetchStats = async () => {
    try {
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
    <div className="space-y-16">
      {/* Hero Section */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 pb-4">
        <div className="max-w-2xl">
          <h1 className="text-[52px] leading-[1.1] font-bold font-display tracking-tight text-uberBlack mb-4">Fleet overview</h1>
          <p className="text-bodyGray text-[18px] leading-relaxed">
            Monitor your fleet vehicles, track active trips, and manage operators from a central unified dashboard.
          </p>
        </div>
        <button
          onClick={() => { setLoading(true); fetchStats(); }}
          className="self-start md:self-auto bg-chipGray text-uberBlack hover:bg-hoverGray px-[16px] py-[14px] rounded-pill font-medium text-[16px] transition-colors shadow-none tracking-normal"
        >
          Refresh metrics
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Vehicles" value={stats.totalVehicles} loading={loading} />
        <StatCard title="Active Trips" value={stats.activeTrips} loading={loading} />
        <StatCard title="In Maintenance" value={stats.maintenanceVehicles} loading={loading} />
        <StatCard title="Available Drivers" value={stats.availableDrivers} loading={loading} />
      </div>

      {/* Quick Info */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-pureWhite rounded-featured shadow-level-1 p-8 md:p-10">
          <h2 className="text-[32px] leading-[1.25] font-bold font-display text-uberBlack mb-8">Status</h2>
          {loading ? (
            <div className="space-y-6">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-4 bg-chipGray rounded animate-pulse" style={{width: `${80 - i * 15}%`}}></div>
              ))}
            </div>
          ) : stats.totalVehicles === 0 ? (
            <div className="text-bodyGray text-base">No vehicles registered yet. Add vehicles to see fleet status.</div>
          ) : (
            <div className="space-y-8">
              <div>
                <div className="flex justify-between items-center mb-3">
                  <span className="text-uberBlack text-base font-medium">Active Vehicles</span>
                  <span className="font-semibold text-uberBlack text-base">{stats.totalVehicles - stats.maintenanceVehicles}</span>
                </div>
                <div className="w-full bg-chipGray rounded-pill h-2 lg:h-3 overflow-hidden">
                  <div className="bg-uberBlack h-full transition-all duration-500 rounded-pill" style={{ width: `${stats.totalVehicles > 0 ? ((stats.totalVehicles - stats.maintenanceVehicles) / stats.totalVehicles) * 100 : 0}%` }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between items-center mb-3">
                  <span className="text-bodyGray text-base font-medium">In Maintenance</span>
                  <span className="font-semibold text-bodyGray text-base">{stats.maintenanceVehicles}</span>
                </div>
                <div className="w-full bg-chipGray rounded-pill h-2 lg:h-3 overflow-hidden">
                  <div className="bg-bodyGray h-full transition-all duration-500 rounded-pill" style={{ width: `${stats.totalVehicles > 0 ? (stats.maintenanceVehicles / stats.totalVehicles) * 100 : 0}%` }}></div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="bg-pureWhite rounded-featured shadow-level-1 p-8 md:p-10">
          <h2 className="text-[32px] leading-[1.25] font-bold font-display text-uberBlack mb-8">Activity</h2>
          <div className="text-bodyGray text-[16px] leading-relaxed">
            {loading ? (
              <div className="space-y-4">
                <div className="h-4 bg-chipGray rounded animate-pulse w-3/4"></div>
                <div className="h-4 bg-chipGray rounded animate-pulse w-1/2"></div>
              </div>
            ) : stats.activeTrips > 0
              ? `${stats.activeTrips} trip(s) currently in progress. Monitors are active and locations are being tracked.`
              : 'No recent trips or alerts recorded. Create a trip to begin tracking routes.'}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;