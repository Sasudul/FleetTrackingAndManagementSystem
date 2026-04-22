import { MapPin, Clock, CheckCircle, XCircle, Play, X } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useJsApiLoader, Autocomplete, GoogleMap, Marker, DirectionsRenderer } from '@react-google-maps/api';
import api from '../services/api';
import type { Trip, Driver, Vehicle } from '../types';

const libraries: ("places")[] = ["places"];

const mapContainerStyle = {
  width: '100%',
  height: '250px',
  borderRadius: '12px',
  marginTop: '16px'
};

const center = {
  lat: 20.5937,
  lng: 78.9629 // Center of India Default
};

const Trips: React.FC = () => {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [form, setForm] = useState({ driverId: '', vehicleId: '', startLocation: '', endLocation: '' });
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  // Map & Autocomplete states
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string || '',
    libraries,
  });

  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [startAutocomplete, setStartAutocomplete] = useState<google.maps.places.Autocomplete | null>(null);
  const [endAutocomplete, setEndAutocomplete] = useState<google.maps.places.Autocomplete | null>(null);
  const [directionsResponse, setDirectionsResponse] = useState<google.maps.DirectionsResult | null>(null);
  
  // Temporary coordinates just to visualize on map during creation
  const [startCoords, setStartCoords] = useState<google.maps.LatLng | null>(null);
  const [endCoords, setEndCoords] = useState<google.maps.LatLng | null>(null);

  // Map picking mode
  const [pickingMode, setPickingMode] = useState<'start' | 'end' | null>(null);

  // View Trip state
  const [viewingTrip, setViewingTrip] = useState<Trip | null>(null);
  const [viewMapDirections, setViewMapDirections] = useState<google.maps.DirectionsResult | null>(null);

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
    setDirectionsResponse(null);
    setStartCoords(null);
    setEndCoords(null);
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
    if (!form.startLocation || !form.endLocation) { setFormError('Please search and select valid locations via the autocomplete'); return; }
    
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

  const cancelTrip = async (id: string) => {
    if (!confirm('Are you sure you want to cancel this trip?')) return;
    try { await api.patch(`/trips/${id}/cancel`); setLoading(true); fetchTrips(); }
    catch (err: any) { alert(err.response?.data?.message || 'Failed to cancel trip'); }
  };

  const completeTrip = async (trip: Trip) => {
    setLoading(true);
    try {
      let finalDistance = 0;
      if (window.google) {
        const service = new window.google.maps.DistanceMatrixService();
        const response = await service.getDistanceMatrix({
          origins: [trip.startLocation],
          destinations: [trip.endLocation],
          travelMode: window.google.maps.TravelMode.DRIVING,
        }).catch(() => null);

        if (response && response.rows[0]?.elements[0]?.status === "OK") {
          finalDistance = +(response.rows[0].elements[0].distance.value / 1000).toFixed(1);
        }
      }
      
      await api.patch(`/trips/${trip.id}/complete`, { distanceKm: finalDistance || null });
      fetchTrips();
    } catch (err: any) { 
      alert(err.response?.data?.message || 'Failed to complete trip'); 
      setLoading(false);
    }
  };

  const openViewModal = (trip: Trip) => {
    setViewingTrip(trip);
    setViewMapDirections(null);
    if (window.google) {
      const ds = new window.google.maps.DirectionsService();
      ds.route({
        origin: trip.startLocation,
        destination: trip.endLocation,
        travelMode: window.google.maps.TravelMode.DRIVING,
      }, (res, status) => {
        if (status === 'OK') setViewMapDirections(res);
      });
    }
  };

  const statusStyles: Record<string, { bg: string; icon: React.ReactNode }> = {
    SCHEDULED: { bg: 'bg-chipGray text-uberBlack', icon: <Clock className="h-3 w-3" /> },
    IN_PROGRESS: { bg: 'bg-uberBlack text-pureWhite', icon: <Play className="h-3 w-3" /> },
    COMPLETED: { bg: 'bg-pureWhite border border-borderBlack text-uberBlack', icon: <CheckCircle className="h-3 w-3" /> },
    CANCELLED: { bg: 'bg-hoverGray text-bodyGray', icon: <XCircle className="h-3 w-3" /> },
  };

  // Maps handlers
  const onStartPlaceChanged = () => {
    if (startAutocomplete !== null) {
      const place = startAutocomplete.getPlace();
      const locName = place.formatted_address || place.name || '';
      
      setForm(f => ({ ...f, startLocation: locName }));
      
      if (place.geometry?.location) {
        setStartCoords(place.geometry.location);
        if (map) map.panTo(place.geometry.location);
      }
    }
  };

  const onEndPlaceChanged = () => {
    if (endAutocomplete !== null) {
      const place = endAutocomplete.getPlace();
      const locName = place.formatted_address || place.name || '';
      
      setForm(f => ({ ...f, endLocation: locName }));
      
      if (place.geometry?.location) {
        setEndCoords(place.geometry.location);
        if (map && !startCoords) map.panTo(place.geometry.location);
      }
    }
  };

  const handleMapClick = (e: google.maps.MapMouseEvent) => {
    if (!pickingMode || !e.latLng || !window.google) return;
    
    const latLng = e.latLng;
    const geocoder = new window.google.maps.Geocoder();
    
    geocoder.geocode({ location: latLng }, (results, status) => {
      if (status === 'OK' && results && results[0]) {
        const address = results[0].formatted_address;
        
        if (pickingMode === 'start') {
          setStartCoords(latLng);
          setForm(f => ({ ...f, startLocation: address }));
        } else {
          setEndCoords(latLng);
          setForm(f => ({ ...f, endLocation: address }));
        }
        setPickingMode(null); // Exit picking mode after selection
      } else {
        alert('Could not determine the address at this location.');
      }
    });
  };
  
  // Calculate directions if both coords exist
  useEffect(() => {
    if (startCoords && endCoords && window.google) {
      const directionsService = new window.google.maps.DirectionsService();
      directionsService.route(
        {
          origin: startCoords,
          destination: endCoords,
          travelMode: window.google.maps.TravelMode.DRIVING,
        },
        (result, status) => {
          if (status === window.google.maps.DirectionsStatus.OK) {
            setDirectionsResponse(result);
          }
        }
      );
    }
  }, [startCoords, endCoords]);

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
                  <div className="flex flex-col gap-2 self-start md:self-center pr-2">
                    <button onClick={() => openViewModal(trip)} className="px-[20px] py-[10px] text-[14px] font-medium bg-chipGray text-uberBlack rounded-pill hover:bg-hoverGray transition-colors flex items-center justify-center gap-2 w-full">
                      View details
                    </button>
                    {trip.status === 'SCHEDULED' && (
                      <div className="flex gap-2 mt-2">
                        <button onClick={() => startTrip(trip.id)} className="px-[20px] py-[10px] text-[14px] font-medium bg-uberBlack text-pureWhite rounded-pill hover:bg-bodyGray transition-colors flex-1">
                          Start
                        </button>
                        <button onClick={() => cancelTrip(trip.id)} className="px-[20px] py-[10px] text-[14px] font-medium border border-chipGray text-uberBlack rounded-pill hover:bg-[#ffe5e5] hover:text-[#cc0000] hover:border-[#cc0000] transition-colors flex-1">
                          Cancel
                        </button>
                      </div>
                    )}
                    {trip.status === 'IN_PROGRESS' && (
                      <div className="flex gap-2 mt-2">
                        <button onClick={() => completeTrip(trip)} className="px-[20px] py-[10px] text-[14px] font-medium border-[2px] border-uberBlack text-uberBlack rounded-pill hover:bg-chipGray transition-colors flex-1">
                          Complete
                        </button>
                        <button onClick={() => cancelTrip(trip.id)} className="px-[20px] py-[10px] text-[14px] font-medium border border-chipGray text-uberBlack rounded-pill hover:bg-[#ffe5e5] hover:text-[#cc0000] hover:border-[#cc0000] transition-colors flex-1">
                          Cancel
                        </button>
                      </div>
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
              
              {isLoaded ? (
                <>
                  <div className="relative">
                    <label className="block text-[14px] font-medium text-uberBlack mb-2 flex justify-between">
                      Start location *
                      {pickingMode === 'start' && <span className="text-blue-600 text-[12px] font-bold animate-pulse">Click on the map to pick...</span>}
                    </label>
                    <div className="relative flex items-center">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <div className="w-2.5 h-2.5 bg-uberBlack rounded-circle"></div>
                      </div>
                      <Autocomplete
                        onLoad={setStartAutocomplete}
                        onPlaceChanged={onStartPlaceChanged}
                        className="w-full"
                      >
                        <input type="text" required placeholder="Search starting point (e.g., Central Hub)"
                          className={`w-full rounded-standard border ${pickingMode === 'start' ? 'border-blue-500 ring-2 ring-blue-200' : 'border-borderBlack'} pl-10 pr-12 py-[14px] text-[16px] text-uberBlack placeholder:text-mutedGray focus:ring-[2px] focus:ring-uberBlack focus:outline-none transition-all`}
                          value={form.startLocation} onChange={(e) => setForm({ ...form, startLocation: e.target.value })} 
                          onKeyDown={(e) => { e.key === 'Enter' && e.preventDefault() }}/>
                      </Autocomplete>
                      <button type="button" onClick={() => setPickingMode(pickingMode === 'start' ? null : 'start')}
                        title="Pick from map"
                        className={`absolute inset-y-0 right-0 pr-3 flex items-center transition-colors ${pickingMode === 'start' ? 'text-blue-600' : 'text-bodyGray hover:text-uberBlack'}`}>
                        <MapPin className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                  <div className="relative">
                    <label className="block text-[14px] font-medium text-uberBlack mb-2 flex justify-between">
                      End location *
                      {pickingMode === 'end' && <span className="text-blue-600 text-[12px] font-bold animate-pulse">Click on the map to pick...</span>}
                    </label>
                    <div className="relative flex items-center">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <div className="w-2.5 h-2.5 bg-pureWhite border-[2px] border-uberBlack rounded-circle"></div>
                      </div>
                      <Autocomplete
                        onLoad={setEndAutocomplete}
                        onPlaceChanged={onEndPlaceChanged}
                        className="w-full"
                      >
                        <input type="text" required placeholder="Search destination (e.g., North Warehouse)"
                          className={`w-full rounded-standard border ${pickingMode === 'end' ? 'border-blue-500 ring-2 ring-blue-200' : 'border-borderBlack'} pl-10 pr-12 py-[14px] text-[16px] text-uberBlack placeholder:text-mutedGray focus:ring-[2px] focus:ring-uberBlack focus:outline-none transition-all`}
                          value={form.endLocation} onChange={(e) => setForm({ ...form, endLocation: e.target.value })}
                          onKeyDown={(e) => { e.key === 'Enter' && e.preventDefault() }} />
                      </Autocomplete>
                      <button type="button" onClick={() => setPickingMode(pickingMode === 'end' ? null : 'end')}
                        title="Pick from map"
                        className={`absolute inset-y-0 right-0 pr-3 flex items-center transition-colors ${pickingMode === 'end' ? 'text-blue-600' : 'text-bodyGray hover:text-uberBlack'}`}>
                        <MapPin className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                  
                  <div className={`relative border rounded-xl overflow-hidden mt-6 transition-all ${pickingMode ? 'border-blue-500 ring-2 ring-blue-200' : 'border-chipGray'}`}>
                    <div className="absolute top-4 right-4 z-10 bg-pureWhite px-3 py-1.5 rounded-pill shadow-level-1 text-[12px] font-bold text-uberBlack border border-borderBlack">
                      {pickingMode ? 'Select a point' : 'Interactive Map'}
                    </div>
                    <GoogleMap
                      mapContainerStyle={{...mapContainerStyle, marginTop: 0, cursor: pickingMode ? 'crosshair' : 'default'}}
                      zoom={5}
                      center={center}
                      onLoad={map => setMap(map)}
                      onClick={handleMapClick}
                      options={{
                        disableDefaultUI: true,
                        zoomControl: true,
                        draggableCursor: pickingMode ? 'crosshair' : ''
                      }}
                    >
                      {directionsResponse && (
                        <DirectionsRenderer 
                          directions={directionsResponse}
                          options={{
                            polylineOptions: {
                              strokeColor: '#000000',
                              strokeWeight: 4
                            }
                          }}
                        />
                      )}
                      {!directionsResponse && startCoords && <Marker position={startCoords} />}
                      {!directionsResponse && endCoords && <Marker position={endCoords} />}
                    </GoogleMap>
                  </div>
                </>
              ) : (
                <div className="p-6 bg-chipGray rounded-standard text-center animate-pulse">
                  <p className="text-bodyGray text-sm">Loading visual maps integration...</p>
                </div>
              )}

              <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-8 mt-4 border-t border-chipGray">
                <button type="button" onClick={() => setShowModal(false)} className="px-[20px] py-[14px] text-[16px] font-medium text-uberBlack bg-chipGray rounded-pill hover:bg-hoverGray transition-colors">Cancel</button>
                <button type="submit" disabled={saving || drivers.length === 0 || vehicles.length === 0 || !form.startLocation || !form.endLocation}
                  className="px-[24px] py-[14px] text-[16px] font-medium text-pureWhite bg-uberBlack rounded-pill hover:bg-bodyGray disabled:opacity-50 transition-colors flex items-center justify-center gap-2">
                  {saving ? 'Creating...' : 'Create trip'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Trip Modal */}
      {viewingTrip && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-uberBlack/60 backdrop-blur-sm p-4" onClick={() => setViewingTrip(null)}>
          <div className="bg-pureWhite rounded-featured shadow-level-2 w-full max-w-3xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-8 py-6 border-b border-chipGray sticky top-0 bg-pureWhite z-10">
              <div className="flex items-center gap-3">
                <h3 className="text-[32px] font-bold font-display text-uberBlack leading-none">Trip Overview</h3>
                <span className={`px-3 py-1 text-[12px] font-bold tracking-wider rounded-pill ${statusStyles[viewingTrip.status]?.bg || 'bg-chipGray text-uberBlack'}`}>
                  {viewingTrip.status}
                </span>
              </div>
              <button onClick={() => setViewingTrip(null)} className="p-2 rounded-circle hover:bg-chipGray transition-colors"><X className="h-6 w-6 text-uberBlack" /></button>
            </div>
            
            <div className="p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div>
                    <p className="text-[14px] text-bodyGray font-medium mb-1">Route</p>
                    <div className="flex items-start gap-4 bg-chipGray/50 p-4 rounded-xl">
                      <div className="flex flex-col items-center gap-1 mt-1">
                        <div className="w-3 h-3 bg-uberBlack rounded-circle"></div>
                        <div className="w-[1px] h-8 bg-borderBlack"></div>
                        <div className="w-3 h-3 bg-pureWhite border-[2px] border-uberBlack rounded-circle"></div>
                      </div>
                      <div className="flex flex-col gap-4">
                        <span className="font-medium text-uberBlack">{viewingTrip.startLocation}</span>
                        <span className="font-medium text-uberBlack">{viewingTrip.endLocation}</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {(viewingTrip.startTime || viewingTrip.endTime) && (
                      <div className="bg-chipGray/50 p-4 rounded-xl">
                        {viewingTrip.startTime && (
                          <div className={viewingTrip.endTime ? 'mb-3' : ''}>
                            <p className="text-[12px] text-bodyGray font-semibold uppercase tracking-wider mb-1">Started</p>
                            <p className="text-[14px] font-medium text-uberBlack">
                              {new Date(viewingTrip.startTime).toLocaleString()}
                            </p>
                          </div>
                        )}
                        {viewingTrip.endTime && (
                          <div>
                            <p className="text-[12px] text-bodyGray font-semibold uppercase tracking-wider mb-1">Completed</p>
                            <p className="text-[14px] font-medium text-uberBlack">
                              {new Date(viewingTrip.endTime).toLocaleString()}
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-3 pt-4 border-t border-chipGray">
                    <div className="flex justify-between items-center">
                      <span className="text-bodyGray text-[14px]">Operator</span>
                      <span className="font-medium text-uberBlack">{viewingTrip.driver?.user?.fullName} ({viewingTrip.driver?.licenseNumber})</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-bodyGray text-[14px]">Vehicle assigned</span>
                      <span className="font-medium text-uberBlack">{viewingTrip.vehicle?.make} {viewingTrip.vehicle?.model} ({viewingTrip.vehicle?.licensePlate})</span>
                    </div>
                    {viewingTrip.distanceKm && (
                      <div className="flex justify-between items-center pt-2">
                        <span className="text-bodyGray text-[16px] font-medium">Logged Distance</span>
                        <span className="font-bold text-[18px] text-uberBlack">{viewingTrip.distanceKm} km</span>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="h-[400px] border border-chipGray rounded-xl overflow-hidden shadow-level-1 relative bg-chipGray flex justify-center items-center">
                  {!isLoaded ? (
                    <span className="text-bodyGray font-medium text-[14px]">Loading Map...</span>
                  ) : (
                    <GoogleMap
                      mapContainerStyle={{ width: '100%', height: '100%' }}
                      zoom={5}
                      center={center}
                      options={{ disableDefaultUI: true, zoomControl: true }}
                    >
                      {viewMapDirections && (
                        <DirectionsRenderer 
                          directions={viewMapDirections}
                          options={{ polylineOptions: { strokeColor: '#000000', strokeWeight: 5 } }}
                        />
                      )}
                    </GoogleMap>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Trips;
