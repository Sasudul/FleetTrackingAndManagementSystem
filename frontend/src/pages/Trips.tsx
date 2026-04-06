import { Plus, MapPin, Clock, CheckCircle, XCircle, Play, X } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import api from '../services/api';
import type { Trip, Driver, Vehicle } from '../types';

const Trips: React.FC = () => {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [form, setForm] = useState({ driverId: '', vehicleId: '', startLocation: '', endLocation: '' });
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  useEffect(() => { fetchTrips(); }, []);

  const fetchTrips = async () => {
    try { const res = await api.get<Trip[]>('/trips'); setTrips(res.data); }
    catch (err) { console.error('Failed to fetch trips', err); }
    finally { setLoading(false); }
  };

  const openModal = async () => {
    setShowModal(true);
    setFormError('');
    setForm({ driverId: '', vehicleId: '', startLocation: '', endLocation: '' });
    try {
      const [driversRes, vehiclesRes] = await Promise.all([
        api.get<Driver[]>('/drivers/available'),
        api.get<Vehicle[]>('/vehicles'),
      ]);
      setDrivers(driversRes.data);
      setVehicles(vehiclesRes.data.filter(v => v.status === 'ACTIVE'));
    } catch { setFormError('Failed to load drivers/vehicles'); }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    if (!form.driverId || !form.vehicleId) { setFormError('Select a driver and vehicle'); return; }
    setSaving(true);
    try {
      await api.post('/trips', form);
      setShowModal(false);
      setLoading(true);
      fetchTrips();
    } catch (err: any) {
      setFormError(err.response?.data?.message || 'Failed to create trip');
    } finally { setSaving(false); }
  };

  const startTrip = async (id: string) => {
    try { await api.patch(`/trips/${id}/start`); setLoading(true); fetchTrips(); }
    catch (err: any) { alert(err.response?.data?.message || 'Failed to start trip'); }
  };

  const completeTrip = async (id: string) => {
    const dist = prompt('Enter distance in km (optional):');
    try {
      await api.patch(`/trips/${id}/complete`, { distanceKm: dist ? parseFloat(dist) : null });
      setLoading(true);
      fetchTrips();
    } catch (err: any) { alert(err.response?.data?.message || 'Failed to complete trip'); }
  };

  const statusStyles: Record<string, { bg: string; icon: React.ReactNode }> = {
    SCHEDULED: { bg: 'bg-blue-100 text-blue-700', icon: <Clock className="h-3 w-3" /> },
    IN_PROGRESS: { bg: 'bg-green-100 text-green-700', icon: <Play className="h-3 w-3" /> },
    COMPLETED: { bg: 'bg-slate-100 text-slate-700', icon: <CheckCircle className="h-3 w-3" /> },
    CANCELLED: { bg: 'bg-red-100 text-red-700', icon: <XCircle className="h-3 w-3" /> },
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-slate-200 rounded animate-pulse"></div>
        <div className="space-y-4">{[1, 2, 3].map(i => <div key={i} className="h-24 bg-white rounded-xl shadow-sm animate-pulse"></div>)}</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Trips</h1>
          <p className="text-slate-500 text-sm mt-1">{trips.length} trip{trips.length !== 1 ? 's' : ''} total</p>
        </div>
        <button onClick={openModal}
          className="flex items-center bg-blue-600 text-white px-4 py-2.5 rounded-lg hover:bg-blue-700 shadow-sm transition-all text-sm font-medium">
          <Plus className="h-4 w-4 mr-2" />Create Trip
        </button>
      </div>

      {trips.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-12 text-center">
          <div className="mx-auto w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4"><MapPin className="h-8 w-8 text-slate-400" /></div>
          <h3 className="text-lg font-semibold text-slate-700 mb-1">No Trips Yet</h3>
          <p className="text-slate-500 text-sm">Create your first trip to start tracking.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {trips.map((trip) => {
            const style = statusStyles[trip.status] || statusStyles.SCHEDULED;
            return (
              <div key={trip.id} className="bg-white rounded-xl shadow-sm border border-slate-100 p-5 hover:shadow-md transition-shadow">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`px-2.5 py-1 text-xs font-semibold rounded-full flex items-center gap-1 ${style.bg}`}>
                        {style.icon} {trip.status}
                      </span>
                      {trip.distanceKm && <span className="text-xs text-slate-500">{trip.distanceKm} km</span>}
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-green-500 flex-shrink-0" />
                      <span className="font-medium text-slate-800">{trip.startLocation}</span>
                      <span className="text-slate-400">→</span>
                      <MapPin className="h-4 w-4 text-red-500 flex-shrink-0" />
                      <span className="font-medium text-slate-800">{trip.endLocation}</span>
                    </div>
                    <div className="flex gap-4 mt-2 text-xs text-slate-500">
                      <span>Driver: <span className="font-medium text-slate-700">{trip.driver?.user?.fullName || 'Unknown'}</span></span>
                      <span>Vehicle: <span className="font-medium text-slate-700">{trip.vehicle?.make} {trip.vehicle?.model} ({trip.vehicle?.licensePlate})</span></span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {trip.status === 'SCHEDULED' && (
                      <button onClick={() => startTrip(trip.id)} className="px-3 py-1.5 text-xs font-medium bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-1">
                        <Play className="h-3 w-3" /> Start
                      </button>
                    )}
                    {trip.status === 'IN_PROGRESS' && (
                      <button onClick={() => completeTrip(trip.id)} className="px-3 py-1.5 text-xs font-medium bg-slate-700 text-white rounded-lg hover:bg-slate-800 transition-colors flex items-center gap-1">
                        <CheckCircle className="h-3 w-3" /> Complete
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
              <h3 className="text-lg font-bold text-slate-800">Create New Trip</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600"><X className="h-5 w-5" /></button>
            </div>
            <form onSubmit={handleCreate} className="p-6 space-y-4">
              {formError && <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700 border border-red-200">{formError}</div>}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Driver *</label>
                {drivers.length === 0 ? <p className="text-sm text-slate-500 italic">No available drivers.</p> : (
                  <select required className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none bg-white"
                    value={form.driverId} onChange={(e) => setForm({ ...form, driverId: e.target.value })}>
                    <option value="">-- Select driver --</option>
                    {drivers.map((d) => <option key={d.id} value={d.id}>{d.user?.fullName} — {d.licenseNumber}</option>)}
                  </select>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Vehicle *</label>
                {vehicles.length === 0 ? <p className="text-sm text-slate-500 italic">No active vehicles.</p> : (
                  <select required className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none bg-white"
                    value={form.vehicleId} onChange={(e) => setForm({ ...form, vehicleId: e.target.value })}>
                    <option value="">-- Select vehicle --</option>
                    {vehicles.map((v) => <option key={v.id} value={v.id}>{v.make} {v.model} — {v.licensePlate}</option>)}
                  </select>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Start Location *</label>
                <input type="text" required placeholder="Bangalore Warehouse A"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                  value={form.startLocation} onChange={(e) => setForm({ ...form, startLocation: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">End Location *</label>
                <input type="text" required placeholder="Chennai Distribution Hub"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                  value={form.endLocation} onChange={(e) => setForm({ ...form, endLocation: e.target.value })} />
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200">Cancel</button>
                <button type="submit" disabled={saving || drivers.length === 0 || vehicles.length === 0}
                  className="px-5 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2">
                  {saving && <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>}
                  {saving ? 'Creating...' : 'Create Trip'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Trips;
