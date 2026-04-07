import { MapPin, Clock, CheckCircle, XCircle, Play, X } from 'lucide-react';
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
    SCHEDULED: { bg: 'bg-chipGray text-uberBlack', icon: <Clock className="h-3 w-3" /> },
    IN_PROGRESS: { bg: 'bg-uberBlack text-pureWhite', icon: <Play className="h-3 w-3" /> },
    COMPLETED: { bg: 'bg-pureWhite border border-borderBlack text-uberBlack', icon: <CheckCircle className="h-3 w-3" /> },
    CANCELLED: { bg: 'bg-hoverGray text-bodyGray', icon: <XCircle className="h-3 w-3" /> },
  };

  return (
    <div className="space-y-12">
      <div className="flex flex-col sm:flex-row sm:justify-between items-start sm:items-center gap-6">
        <div>
          <h1 className="text-[52px] leading-[1.1] font-bold font-display tracking-tight text-uberBlack mb-2">Trips</h1>
          <p className="text-bodyGray text-[18px]">{trips.length} trip{trips.length !== 1 ? 's' : ''} total</p>
        </div>
        <button onClick={openModal}
          className="flex items-center bg-uberBlack text-pureWhite px-[16px] py-[12px] sm:py-[14px] rounded-pill hover:bg-bodyGray transition-colors text-[16px] font-medium whitespace-nowrap">
          Create trip
        </button>
      </div>

      {loading ? (
        <div className="space-y-6">
          {[1, 2, 3].map(i => <div key={i} className="h-[120px] bg-chipGray rounded-standard animate-pulse"></div>)}
        </div>
      ) : trips.length === 0 ? (
        <div className="bg-pureWhite rounded-featured shadow-level-1 p-16 text-center">
          <div className="mx-auto w-20 h-20 bg-chipGray rounded-circle flex items-center justify-center mb-6"><MapPin className="h-10 w-10 text-bodyGray" /></div>
          <h3 className="text-[32px] font-bold text-uberBlack font-display mb-2">No trips yet</h3>
          <p className="text-bodyGray text-[18px]">Create your first trip to start tracking routes.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {trips.map((trip) => {
            const style = statusStyles[trip.status] || statusStyles.SCHEDULED;
            return (
              <div key={trip.id} className="bg-pureWhite rounded-standard shadow-level-1 p-6 hover:shadow-level-2 transition-shadow">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-4">
                      <span className={`px-4 py-1.5 text-[12px] font-semibold tracking-wider rounded-pill flex items-center gap-1.5 ${style.bg}`}>
                        {style.icon} {trip.status}
                      </span>
                      {trip.distanceKm && <span className="text-[14px] text-bodyGray font-medium">{trip.distanceKm} km</span>}
                    </div>
                    
                    <div className="flex items-center gap-4 text-[18px] mb-4">
                      <div className="flex flex-col items-center gap-1">
                        <div className="w-3 h-3 bg-uberBlack rounded-circle"></div>
                        <div className="w-[1px] h-6 bg-borderBlack"></div>
                        <div className="w-3 h-3 bg-pureWhite border-[2px] border-uberBlack rounded-circle"></div>
                      </div>
                      <div className="flex flex-col gap-3">
                        <span className="font-semibold text-uberBlack">{trip.startLocation}</span>
                        <span className="font-semibold text-uberBlack">{trip.endLocation}</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-x-6 gap-y-2 mt-4 text-[14px] text-bodyGray border-t border-chipGray pt-4">
                      <span>Driver: <span className="font-medium text-uberBlack">{trip.driver?.user?.fullName || 'Unknown'}</span></span>
                      <span>Vehicle: <span className="font-medium text-uberBlack">{trip.vehicle?.make} {trip.vehicle?.model} ({trip.vehicle?.licensePlate})</span></span>
                    </div>
                  </div>
                  <div className="flex gap-3 self-start md:self-center">
                    {trip.status === 'SCHEDULED' && (
                      <button onClick={() => startTrip(trip.id)} className="px-[20px] py-[12px] text-[14px] font-medium bg-uberBlack text-pureWhite rounded-pill hover:bg-bodyGray transition-colors flex items-center gap-2">
                        Start trip
                      </button>
                    )}
                    {trip.status === 'IN_PROGRESS' && (
                      <button onClick={() => completeTrip(trip.id)} className="px-[20px] py-[12px] text-[14px] font-medium bg-pureWhite border border-borderBlack text-uberBlack rounded-pill hover:bg-chipGray transition-colors flex items-center gap-2">
                        Complete trip
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
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-uberBlack/60 backdrop-blur-sm p-4" onClick={() => setShowModal(false)}>
          <div className="bg-pureWhite rounded-featured shadow-level-2 w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-8 py-6 border-b border-chipGray sticky top-0 bg-pureWhite z-10">
              <h3 className="text-[32px] font-bold font-display text-uberBlack leading-none">Create trip</h3>
              <button onClick={() => setShowModal(false)} className="p-2 rounded-circle hover:bg-chipGray transition-colors"><X className="h-6 w-6 text-uberBlack" /></button>
            </div>
            <form onSubmit={handleCreate} className="p-8 space-y-6">
              {formError && <div className="rounded-standard bg-[#f9e5e5] p-4 text-[14px] text-[#cc0000] font-medium">{formError}</div>}
              <div>
                <label className="block text-[14px] font-medium text-uberBlack mb-2">Driver *</label>
                {drivers.length === 0 ? <p className="text-[14px] text-bodyGray italic bg-chipGray p-4 rounded-standard">No available drivers right now.</p> : (
                  <select required className="w-full rounded-standard border border-borderBlack px-4 py-[14px] text-[16px] text-uberBlack focus:ring-[2px] focus:ring-uberBlack focus:outline-none bg-pureWhite appearance-none"
                    value={form.driverId} onChange={(e) => setForm({ ...form, driverId: e.target.value })}>
                    <option value="">-- Select driver --</option>
                    {drivers.map((d) => <option key={d.id} value={d.id}>{d.user?.fullName} — {d.licenseNumber}</option>)}
                  </select>
                )}
              </div>
              <div>
                <label className="block text-[14px] font-medium text-uberBlack mb-2">Vehicle *</label>
                {vehicles.length === 0 ? <p className="text-[14px] text-bodyGray italic bg-chipGray p-4 rounded-standard">No active vehicles available.</p> : (
                  <select required className="w-full rounded-standard border border-borderBlack px-4 py-[14px] text-[16px] text-uberBlack focus:ring-[2px] focus:ring-uberBlack focus:outline-none bg-pureWhite appearance-none"
                    value={form.vehicleId} onChange={(e) => setForm({ ...form, vehicleId: e.target.value })}>
                    <option value="">-- Select vehicle --</option>
                    {vehicles.map((v) => <option key={v.id} value={v.id}>{v.make} {v.model} — {v.licensePlate}</option>)}
                  </select>
                )}
              </div>
              <div>
                <label className="block text-[14px] font-medium text-uberBlack mb-2">Start location *</label>
                <input type="text" required placeholder="Ex: Central Hub"
                  className="w-full rounded-standard border border-borderBlack px-4 py-[14px] text-[16px] text-uberBlack placeholder:text-mutedGray focus:ring-[2px] focus:ring-uberBlack focus:outline-none"
                  value={form.startLocation} onChange={(e) => setForm({ ...form, startLocation: e.target.value })} />
              </div>
              <div>
                <label className="block text-[14px] font-medium text-uberBlack mb-2">End location *</label>
                <input type="text" required placeholder="Ex: North Warehouse"
                  className="w-full rounded-standard border border-borderBlack px-4 py-[14px] text-[16px] text-uberBlack placeholder:text-mutedGray focus:ring-[2px] focus:ring-uberBlack focus:outline-none"
                  value={form.endLocation} onChange={(e) => setForm({ ...form, endLocation: e.target.value })} />
              </div>
              <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-8 mt-4 border-t border-chipGray">
                <button type="button" onClick={() => setShowModal(false)} className="px-[20px] py-[14px] text-[16px] font-medium text-uberBlack bg-chipGray rounded-pill hover:bg-hoverGray transition-colors">Cancel</button>
                <button type="submit" disabled={saving || drivers.length === 0 || vehicles.length === 0}
                  className="px-[24px] py-[14px] text-[16px] font-medium text-pureWhite bg-uberBlack rounded-pill hover:bg-bodyGray disabled:opacity-50 transition-colors flex items-center justify-center gap-2">
                  {saving ? 'Creating...' : 'Create trip'}
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
