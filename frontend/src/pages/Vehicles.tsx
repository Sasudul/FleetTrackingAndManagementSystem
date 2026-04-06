import { Plus, Search, Truck, X } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import api from '../services/api';
import type { Vehicle } from '../types';

const emptyForm = { licensePlate: '', vin: '', make: '', model: '', year: new Date().getFullYear(), fuelType: 'Diesel' };

const Vehicles: React.FC = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  useEffect(() => { fetchVehicles(); }, []);

  const fetchVehicles = async () => {
    try { const res = await api.get<Vehicle[]>('/vehicles'); setVehicles(res.data); }
    catch (err) { console.error('Failed to fetch vehicles', err); }
    finally { setLoading(false); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setSaving(true);
    try {
      await api.post('/vehicles', form);
      setShowModal(false);
      setForm(emptyForm);
      setLoading(true);
      fetchVehicles();
    } catch (err: any) {
      setFormError(err.response?.data?.message || 'Failed to add vehicle');
    } finally { setSaving(false); }
  };

  const filtered = vehicles.filter((v) =>
    v.licensePlate?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.make?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.model?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const statusStyles: Record<string, string> = {
    ACTIVE: 'bg-green-100 text-green-700',
    MAINTENANCE: 'bg-amber-100 text-amber-700',
    RETIRED: 'bg-red-100 text-red-700',
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-slate-200 rounded animate-pulse"></div>
        <div className="bg-white rounded-xl shadow-sm p-6"><div className="space-y-4">
          {[1, 2, 3].map(i => <div key={i} className="h-12 bg-slate-100 rounded-lg animate-pulse"></div>)}
        </div></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Fleet Vehicles</h1>
          <p className="text-slate-500 text-sm mt-1">{vehicles.length} vehicle{vehicles.length !== 1 ? 's' : ''} registered</p>
        </div>
        <button onClick={() => { setShowModal(true); setFormError(''); setForm(emptyForm); }}
          className="flex items-center bg-blue-600 text-white px-4 py-2.5 rounded-lg hover:bg-blue-700 shadow-sm transition-all text-sm font-medium">
          <Plus className="h-4 w-4 mr-2" />Add Vehicle
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
        <input type="text" placeholder="Search by plate, make, or model..."
          className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 bg-white text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all"
          value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Vehicle</th>
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">License Plate</th>
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">VIN</th>
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Fuel</th>
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Year</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((v) => (
                <tr key={v.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-9 w-9 bg-blue-100 rounded-lg flex items-center justify-center mr-3"><Truck className="h-4 w-4 text-blue-600" /></div>
                      <div><div className="font-semibold text-slate-800">{v.make}</div><div className="text-xs text-slate-500">{v.model}</div></div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap"><span className="font-mono font-semibold text-slate-800 bg-slate-100 px-2 py-1 rounded">{v.licensePlate}</span></td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 font-mono">{v.vin || '—'}</td>
                  <td className="px-6 py-4 whitespace-nowrap"><span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${statusStyles[v.status] || 'bg-slate-100 text-slate-600'}`}>{v.status}</span></td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{v.fuelType || '—'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{v.year || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="p-12 text-center">
            <div className="mx-auto w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4"><Truck className="h-8 w-8 text-slate-400" /></div>
            <h3 className="text-lg font-semibold text-slate-700 mb-1">No Vehicles Found</h3>
            <p className="text-slate-500 text-sm">{searchTerm ? 'No vehicles match your search.' : 'Add your first vehicle to get started.'}</p>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
              <h3 className="text-lg font-bold text-slate-800">Add New Vehicle</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600"><X className="h-5 w-5" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {formError && <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700 border border-red-200">{formError}</div>}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">License Plate *</label>
                  <input type="text" required placeholder="KA-01-AB-1234"
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                    value={form.licensePlate} onChange={(e) => setForm({ ...form, licensePlate: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">VIN *</label>
                  <input type="text" required placeholder="Vehicle ID Number"
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                    value={form.vin} onChange={(e) => setForm({ ...form, vin: e.target.value })} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Make *</label>
                  <input type="text" required placeholder="Toyota"
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                    value={form.make} onChange={(e) => setForm({ ...form, make: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Model *</label>
                  <input type="text" required placeholder="Hilux"
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                    value={form.model} onChange={(e) => setForm({ ...form, model: e.target.value })} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Year *</label>
                  <input type="number" required min="1900" max={new Date().getFullYear() + 1}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                    value={form.year} onChange={(e) => setForm({ ...form, year: parseInt(e.target.value) })} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Fuel Type</label>
                  <select className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none bg-white"
                    value={form.fuelType} onChange={(e) => setForm({ ...form, fuelType: e.target.value })}>
                    <option>Diesel</option><option>Petrol</option><option>CNG</option><option>Electric</option><option>Hybrid</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200">Cancel</button>
                <button type="submit" disabled={saving}
                  className="px-5 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2">
                  {saving && <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>}
                  {saving ? 'Adding...' : 'Add Vehicle'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Vehicles;