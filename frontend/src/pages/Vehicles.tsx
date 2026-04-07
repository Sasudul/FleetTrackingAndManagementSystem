import { Search, Truck, X } from 'lucide-react';
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

  return (
    <div className="space-y-12">
      <div className="flex flex-col sm:flex-row sm:justify-between items-start sm:items-center gap-6">
        <div>
          <h1 className="text-[52px] leading-[1.1] font-bold font-display tracking-tight text-uberBlack mb-2">Vehicles</h1>
          <p className="text-bodyGray text-[18px]">{vehicles.length} vehicle{vehicles.length !== 1 ? 's' : ''} in the fleet</p>
        </div>
        <button onClick={() => { setShowModal(true); setFormError(''); setForm(emptyForm); }}
          className="flex items-center bg-uberBlack text-pureWhite px-[16px] py-[12px] sm:py-[14px] rounded-pill hover:bg-bodyGray transition-colors text-[16px] font-medium whitespace-nowrap">
          Add vehicle
        </button>
      </div>

      <div className="relative max-w-xl">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-uberBlack" />
        <input type="text" placeholder="Search by plate, make, or model"
          className="w-full pl-12 pr-4 py-[14px] rounded-standard border border-borderBlack bg-pureWhite text-[16px] text-uberBlack placeholder:text-mutedGray focus:ring-[2px] focus:ring-uberBlack focus:outline-none transition-all"
          value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => <div key={i} className="h-20 bg-chipGray rounded-standard animate-pulse"></div>)}
        </div>
      ) : (
        <div className="bg-pureWhite rounded-featured shadow-level-1 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left">
              <thead>
                <tr className="border-b border-chipGray bg-pureWhite">
                  <th className="px-8 py-5 text-[16px] font-bold text-uberBlack font-display">Vehicle</th>
                  <th className="px-8 py-5 text-[16px] font-bold text-uberBlack font-display">License Plate</th>
                  <th className="px-8 py-5 text-[16px] font-bold text-uberBlack font-display">VIN</th>
                  <th className="px-8 py-5 text-[16px] font-bold text-uberBlack font-display">Status</th>
                  <th className="px-8 py-5 text-[16px] font-bold text-uberBlack font-display">Fuel</th>
                  <th className="px-8 py-5 text-[16px] font-bold text-uberBlack font-display">Year</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-chipGray text-[16px]">
                {filtered.map((v) => (
                  <tr key={v.id} className="hover:bg-hoverLight transition-colors">
                    <td className="px-8 py-6 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-12 w-12 bg-chipGray rounded-standard flex items-center justify-center mr-4"><Truck className="h-6 w-6 text-uberBlack" /></div>
                        <div><div className="font-semibold text-uberBlack text-[16px]">{v.make}</div><div className="text-[14px] text-bodyGray">{v.model}</div></div>
                      </div>
                    </td>
                    <td className="px-8 py-6 whitespace-nowrap"><span className="text-[14px] font-mono font-medium text-uberBlack bg-chipGray px-3 py-1.5 rounded-standard">{v.licensePlate}</span></td>
                    <td className="px-8 py-6 whitespace-nowrap text-[14px] text-bodyGray font-mono">{v.vin || '—'}</td>
                    <td className="px-8 py-6 whitespace-nowrap"><span className={`px-4 py-1.5 text-[12px] font-semibold tracking-wider rounded-pill ${v.status === 'ACTIVE' ? 'bg-uberBlack text-pureWhite' : 'bg-chipGray text-uberBlack'}`}>{v.status}</span></td>
                    <td className="px-8 py-6 whitespace-nowrap text-bodyGray text-[16px]">{v.fuelType || '—'}</td>
                    <td className="px-8 py-6 whitespace-nowrap text-bodyGray text-[16px]">{v.year || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filtered.length === 0 && (
            <div className="p-16 text-center">
              <div className="mx-auto w-20 h-20 bg-chipGray rounded-circle flex items-center justify-center mb-6"><Truck className="h-10 w-10 text-bodyGray" /></div>
              <h3 className="text-[32px] font-bold text-uberBlack font-display mb-2">No vehicles found</h3>
              <p className="text-bodyGray text-[18px]">{searchTerm ? 'No vehicles match your search.' : 'Add your first vehicle to get started.'}</p>
            </div>
          )}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-uberBlack/60 backdrop-blur-sm p-4" onClick={() => setShowModal(false)}>
          <div className="bg-pureWhite rounded-featured shadow-level-2 w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-8 py-6 border-b border-chipGray sticky top-0 bg-pureWhite z-10">
              <h3 className="text-[32px] font-bold font-display text-uberBlack leading-none">Add vehicle</h3>
              <button onClick={() => setShowModal(false)} className="p-2 rounded-circle hover:bg-chipGray transition-colors"><X className="h-6 w-6 text-uberBlack" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              {formError && <div className="rounded-standard bg-[#f9e5e5] p-4 text-[14px] text-[#cc0000] font-medium">{formError}</div>}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[14px] font-medium text-uberBlack mb-2">License plate *</label>
                  <input type="text" required placeholder="Ex: KA-01-AB-1234"
                    className="w-full rounded-standard border border-borderBlack px-4 py-[14px] text-[16px] text-uberBlack placeholder:text-mutedGray focus:ring-[2px] focus:ring-uberBlack focus:outline-none"
                    value={form.licensePlate} onChange={(e) => setForm({ ...form, licensePlate: e.target.value })} />
                </div>
                <div>
                  <label className="block text-[14px] font-medium text-uberBlack mb-2">VIN *</label>
                  <input type="text" required placeholder="Ex: 1HGCM82633A004..."
                    className="w-full rounded-standard border border-borderBlack px-4 py-[14px] text-[16px] text-uberBlack placeholder:text-mutedGray focus:ring-[2px] focus:ring-uberBlack focus:outline-none"
                    value={form.vin} onChange={(e) => setForm({ ...form, vin: e.target.value })} />
                </div>
                <div>
                  <label className="block text-[14px] font-medium text-uberBlack mb-2">Make *</label>
                  <input type="text" required placeholder="Ex: Toyota"
                    className="w-full rounded-standard border border-borderBlack px-4 py-[14px] text-[16px] text-uberBlack placeholder:text-mutedGray focus:ring-[2px] focus:ring-uberBlack focus:outline-none"
                    value={form.make} onChange={(e) => setForm({ ...form, make: e.target.value })} />
                </div>
                <div>
                  <label className="block text-[14px] font-medium text-uberBlack mb-2">Model *</label>
                  <input type="text" required placeholder="Ex: Hilux"
                    className="w-full rounded-standard border border-borderBlack px-4 py-[14px] text-[16px] text-uberBlack placeholder:text-mutedGray focus:ring-[2px] focus:ring-uberBlack focus:outline-none"
                    value={form.model} onChange={(e) => setForm({ ...form, model: e.target.value })} />
                </div>
                <div>
                  <label className="block text-[14px] font-medium text-uberBlack mb-2">Year *</label>
                  <input type="number" required min="1900" max={new Date().getFullYear() + 1}
                    className="w-full rounded-standard border border-borderBlack px-4 py-[14px] text-[16px] text-uberBlack placeholder:text-mutedGray focus:ring-[2px] focus:ring-uberBlack focus:outline-none"
                    value={form.year} onChange={(e) => setForm({ ...form, year: parseInt(e.target.value) })} />
                </div>
                <div>
                  <label className="block text-[14px] font-medium text-uberBlack mb-2">Fuel type</label>
                  <select className="w-full rounded-standard border border-borderBlack px-4 py-[14px] text-[16px] text-uberBlack focus:ring-[2px] focus:ring-uberBlack focus:outline-none bg-pureWhite appearance-none"
                    value={form.fuelType} onChange={(e) => setForm({ ...form, fuelType: e.target.value })}>
                    <option>Diesel</option><option>Petrol</option><option>CNG</option><option>Electric</option><option>Hybrid</option>
                  </select>
                </div>
              </div>
              <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-8 mt-4">
                <button type="button" onClick={() => setShowModal(false)} className="px-[20px] py-[14px] text-[16px] font-medium text-uberBlack bg-chipGray rounded-pill hover:bg-hoverGray transition-colors">Cancel</button>
                <button type="submit" disabled={saving}
                  className="px-[24px] py-[14px] text-[16px] font-medium text-pureWhite bg-uberBlack rounded-pill hover:bg-bodyGray disabled:opacity-50 transition-colors flex items-center justify-center gap-2">
                  {saving ? 'Adding vehicle...' : 'Add vehicle'}
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