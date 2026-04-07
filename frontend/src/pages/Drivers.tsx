import { Search, UserCheck, UserX, X, Users as UsersIcon } from 'lucide-react';
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

  return (
    <div className="space-y-12">
      <div className="flex flex-col sm:flex-row sm:justify-between items-start sm:items-center gap-6">
        <div>
          <h1 className="text-[52px] leading-[1.1] font-bold font-display tracking-tight text-uberBlack mb-2">Drivers</h1>
          <p className="text-bodyGray text-[18px]">{drivers.length} operator{drivers.length !== 1 ? 's' : ''} in the system</p>
        </div>
        <button onClick={openModal}
          className="flex items-center bg-uberBlack text-pureWhite px-[16px] py-[12px] sm:py-[14px] rounded-pill hover:bg-bodyGray transition-colors text-[16px] font-medium whitespace-nowrap">
          Onboard driver
        </button>
      </div>

      <div className="relative max-w-xl">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-uberBlack" />
        <input type="text" placeholder="Search by name or license number"
          className="w-full pl-12 pr-4 py-[14px] rounded-standard border border-borderBlack bg-pureWhite text-[16px] text-uberBlack placeholder:text-mutedGray focus:ring-[2px] focus:ring-uberBlack focus:outline-none transition-all"
          value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => <div key={i} className="h-44 bg-chipGray rounded-standard animate-pulse"></div>)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-pureWhite rounded-featured shadow-level-1 p-16 text-center">
          <div className="mx-auto w-20 h-20 bg-chipGray rounded-circle flex items-center justify-center mb-6">
            <UsersIcon className="h-10 w-10 text-bodyGray" />
          </div>
          <h3 className="text-[32px] font-bold text-uberBlack font-display mb-2">No drivers found</h3>
          <p className="text-bodyGray text-[18px]">{searchTerm ? 'No drivers match your search.' : 'Onboard a driver to get started.'}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((driver) => (
            <div key={driver.id} className="bg-pureWhite rounded-standard shadow-level-1 p-6 hover:shadow-level-2 transition-shadow flex flex-col">
              <div className="flex items-start justify-between mb-6 gap-3">
                <div className="flex items-center min-w-0 flex-1">
                  <div className="h-12 w-12 rounded-circle bg-uberBlack flex flex-shrink-0 items-center justify-center text-pureWhite font-bold text-[18px] mr-4">
                    {driver.user?.fullName?.charAt(0) || 'D'}
                  </div>
                  <div className="min-w-0 flex-1 pr-2">
                    <h3 className="font-semibold text-uberBlack text-[18px] leading-tight truncate">{driver.user?.fullName || 'Unknown'}</h3>
                    <p className="text-[14px] text-bodyGray mt-0.5 truncate">{driver.user?.email}</p>
                  </div>
                </div>
                <span className={`flex-shrink-0 px-3 py-1 text-[12px] font-semibold tracking-wider rounded-pill flex items-center gap-1.5 ${driver.available ? 'bg-pureWhite border border-borderBlack text-uberBlack' : 'bg-chipGray text-uberBlack'}`}>
                  {driver.available ? <><UserCheck className="h-3 w-3" /> Available</> : <><UserX className="h-3 w-3" /> Busy</>}
                </span>
              </div>
              <div className="space-y-3 text-[14px] border-t border-chipGray pt-4 mt-auto">
                <div className="flex justify-between"><span className="text-bodyGray">License</span><span className="font-medium text-uberBlack">{driver.licenseNumber}</span></div>
                <div className="flex justify-between"><span className="text-bodyGray">Expires</span><span className="font-medium text-uberBlack">{driver.licenseExpiryDate}</span></div>
                <div className="flex justify-between"><span className="text-bodyGray">Experience</span><span className="font-medium text-uberBlack">{driver.yearsExperience} years</span></div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-uberBlack/60 backdrop-blur-sm p-4" onClick={() => setShowModal(false)}>
          <div className="bg-pureWhite rounded-featured shadow-level-2 w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-8 py-6 border-b border-chipGray sticky top-0 bg-pureWhite z-10">
              <h3 className="text-[32px] font-bold font-display text-uberBlack leading-none">Onboard driver</h3>
              <button onClick={() => setShowModal(false)} className="p-2 rounded-circle hover:bg-chipGray transition-colors"><X className="h-6 w-6 text-uberBlack" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              {formError && <div className="rounded-standard bg-[#f9e5e5] p-4 text-[14px] text-[#cc0000] font-medium">{formError}</div>}
              <div>
                <label className="block text-[14px] font-medium text-uberBlack mb-2">Select user account *</label>
                {driverUsers.length === 0 ? (
                  <p className="text-[14px] text-bodyGray italic bg-chipGray p-4 rounded-standard">No DRIVER-role users found in the system. Register one first.</p>
                ) : (
                  <select required className="w-full rounded-standard border border-borderBlack px-4 py-[14px] text-[16px] text-uberBlack focus:ring-[2px] focus:ring-uberBlack focus:outline-none bg-pureWhite appearance-none"
                    value={selectedUserId} onChange={(e) => setSelectedUserId(e.target.value)}>
                    <option value="">-- Select a user --</option>
                    {driverUsers.map((u) => <option key={u.id} value={u.id}>{u.fullName} ({u.email})</option>)}
                  </select>
                )}
              </div>
              <div>
                <label className="block text-[14px] font-medium text-uberBlack mb-2">License number *</label>
                <input type="text" required placeholder="Ex: DL-2024-001234"
                  className="w-full rounded-standard border border-borderBlack px-4 py-[14px] text-[16px] text-uberBlack placeholder:text-mutedGray focus:ring-[2px] focus:ring-uberBlack focus:outline-none"
                  value={form.licenseNumber} onChange={(e) => setForm({ ...form, licenseNumber: e.target.value })} />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[14px] font-medium text-uberBlack mb-2">License expiry date *</label>
                  <input type="date" required className="w-full rounded-standard border border-borderBlack px-4 py-[14px] text-[16px] text-uberBlack focus:ring-[2px] focus:ring-uberBlack focus:outline-none"
                    value={form.licenseExpiryDate} onChange={(e) => setForm({ ...form, licenseExpiryDate: e.target.value })} />
                </div>
                <div>
                  <label className="block text-[14px] font-medium text-uberBlack mb-2">Years of experience</label>
                  <input type="number" min="0" max="50" className="w-full rounded-standard border border-borderBlack px-4 py-[14px] text-[16px] text-uberBlack focus:ring-[2px] focus:ring-uberBlack focus:outline-none"
                    value={form.yearsExperience} onChange={(e) => setForm({ ...form, yearsExperience: parseInt(e.target.value) || 0 })} />
                </div>
              </div>
              <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-8 mt-4 border-t border-chipGray">
                <button type="button" onClick={() => setShowModal(false)} className="px-[20px] py-[14px] text-[16px] font-medium text-uberBlack bg-chipGray rounded-pill hover:bg-hoverGray transition-colors">Cancel</button>
                <button type="submit" disabled={saving || driverUsers.length === 0}
                  className="px-[24px] py-[14px] text-[16px] font-medium text-pureWhite bg-uberBlack rounded-pill hover:bg-bodyGray disabled:opacity-50 transition-colors flex items-center justify-center gap-2">
                  {saving ? 'Onboarding...' : 'Onboard driver'}
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
