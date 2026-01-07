import { AlertTriangle, CheckCircle, MapPin, Truck } from 'lucide-react';
import React from 'react';

const StatCard = ({ title, value, icon: Icon, color }: any) => (
  <div className="bg-white rounded-xl shadow-sm p-6 flex items-center">
    <div className={`p-4 rounded-full ${color} bg-opacity-10 mr-4`}>
      <Icon className={`h-6 w-6 ${color.replace('bg-', 'text-')}`} />
    </div>
    <div>
      <h3 className="text-slate-500 text-sm font-medium">{title}</h3>
      <p className="text-2xl font-bold text-slate-800">{value}</p>
    </div>
  </div>
);

const Dashboard: React.FC = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-800">Dashboard</h1>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Vehicles" value="12" icon={Truck} color="bg-blue-500" />
        <StatCard title="Active Trips" value="5" icon={MapPin} color="bg-green-500" />
        <StatCard title="Maintenance" value="2" icon={AlertTriangle} color="bg-orange-500" />
        <StatCard title="Available Drivers" value="8" icon={CheckCircle} color="bg-purple-500" />
      </div>

      {/* Recent Activity Placeholder */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-bold text-slate-800 mb-4">Recent Activity</h2>
        <div className="text-slate-500 italic">No recent alerts or trips recorded.</div>
      </div>
    </div>
  );
};

export default Dashboard;