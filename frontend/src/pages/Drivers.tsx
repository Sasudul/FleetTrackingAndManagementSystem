import { Plus, Search, UserCheck, UserX, X, Users as UsersIcon } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import api from '../services/api';
import type { Driver, User } from '../types';

const Drivers: React.FC = () => {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [driverUsers, setDriverUsers] = useState<User[]>([]);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [form, setForm] = useState({ licenseNumber: '', licenseExpiryDate: '', yearsExperience: 0 });
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  useEffect(() => { fetchDrivers(); }, []);

  const fetchDrivers = async () => {
    try {
      const res = await api.get<Driver[]>('/drivers');
      setDrivers(res.data);
    } catch (err) { console.error('Failed to fetch drivers', err); }
    finally { setLoading(false); }
  };

  const openModal = async () => {
    setShowModal(true);
    setFormError('');
    setSelectedUserId('');
    setForm({ licenseNumber: '', licenseExpiryDate: '', yearsExperience: 0 });
    try {
      const res = await api.get<User[]>('/users');
      const driverRoleUsers = res.data.filter((u) => u.role === 'DRIVER');
      setDriverUsers(driverRoleUsers);
    } catch { setFormError('Failed to load users'); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    if (!selectedUserId) { setFormError('Please select a driver user'); return; }
    setSaving(true);
    try {
      await api.post(`/drivers/onboard/${selectedUserId}`, form);
      setShowModal(false);
      setLoading(true);
      fetchDrivers();
    } catch (err: any) {
      setFormError(err.response?.data?.message || 'Failed to onboard driver');
    } finally { setSaving(false); }
  };

  const filtered = drivers.filter((d) =>
    d.user?.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.licenseNumber?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-slate-200 rounded animate-pulse"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => <div key={i} className="h-44 bg-white rounded-xl shadow-sm animate-pulse"></div>)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Drivers</h1>
          <p className="text-slate-500 text-sm mt-1">{drivers.length} driver{drivers.length !== 1 ? 's' : ''} registered</p>
        </div>
        <button onClick={openModal}
          className="flex items-center bg-blue-600 text-white px-4 py-2.5 rounded-lg hover:bg-blue-700 shadow-sm transition-all text-sm font-medium">
          <Plus className="h-4 w-4 mr-2" />Onboard Driver
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
        <input type="text" placeholder="Search by name or license..."
          className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 bg-white text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all"
          value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-12 text-center">
          <div className="mx-auto w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
            <UsersIcon className="h-8 w-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-semibold text-slate-700 mb-1">No Drivers Found</h3>
          <p className="text-slate-500 text-sm">{searchTerm ? 'No drivers match your search.' : 'Onboard a driver to get started.'}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((driver) => (
            <div key={driver.id} className="bg-white rounded-xl shadow-sm border border-slate-100 p-5 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm mr-3">
                    {driver.user?.fullName?.charAt(0) || 'D'}
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-800">{driver.user?.fullName || 'Unknown'}</h3>
                    <p className="text-xs text-slate-500">{driver.user?.email}</p>
                  </div>
                </div>
                <span className={`px-2.5 py-1 text-xs font-medium rounded-full flex items-center gap-1 ${driver.available ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  {driver.available ? <><UserCheck className="h-3 w-3" /> Available</> : <><UserX className="h-3 w-3" /> Busy</>}
                </span>
              </div>
              <div className="space-y-1.5 text-sm border-t border-slate-100 pt-3">
                <div className="flex justify-between"><span className="text-slate-500">License</span><span className="font-medium text-slate-700">{driver.licenseNumber}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Expires</span><span className="font-medium text-slate-700">{driver.licenseExpiryDate}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Experience</span><span className="font-medium text-slate-700">{driver.yearsExperience} years</span></div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
              <h3 className="text-lg font-bold text-slate-800">Onboard New Driver</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600"><X className="h-5 w-5" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {formError && <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700 border border-red-200">{formError}</div>}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Select Driver User *</label>
                {driverUsers.length === 0 ? (
                  <p className="text-sm text-slate-500 italic">No DRIVER-role users found. Register one first.</p>
                ) : (
                  <select required className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none bg-white"
                    value={selectedUserId} onChange={(e) => setSelectedUserId(e.target.value)}>
                    <option value="">-- Select a user --</option>
                    {driverUsers.map((u) => <option key={u.id} value={u.id}>{u.fullName} ({u.email})</option>)}
                  </select>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">License Number *</label>
                <input type="text" required placeholder="DL-2024-001234"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                  value={form.licenseNumber} onChange={(e) => setForm({ ...form, licenseNumber: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">License Expiry *</label>
                  <input type="date" required className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                    value={form.licenseExpiryDate} onChange={(e) => setForm({ ...form, licenseExpiryDate: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Years Experience</label>
                  <input type="number" min="0" max="50" className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                    value={form.yearsExperience} onChange={(e) => setForm({ ...form, yearsExperience: parseInt(e.target.value) || 0 })} />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200">Cancel</button>
                <button type="submit" disabled={saving || driverUsers.length === 0}
                  className="px-5 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2">
                  {saving && <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>}
                  {saving ? 'Onboarding...' : 'Onboard Driver'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Drivers;
