export interface User {
  id: string;
  email: string;
  fullName: string;
  role: 'ADMIN' | 'DISPATCHER' | 'DRIVER';
}

export interface LoginResponse {
  token: string;
  type: string;
  id: string;
  email: string;
  role: string;
  fullName: string;
}

export interface RegisterRequest {
  email: string;
  passwordHash: string; // Backend expects this field name (gets BCrypted server-side)
  fullName: string;
  role: 'ADMIN' | 'DISPATCHER' | 'DRIVER';
}

export interface Vehicle {
  id: string;
  licensePlate: string;
  vin: string;
  make: string;
  model: string;
  year: number;
  status: 'ACTIVE' | 'MAINTENANCE' | 'RETIRED';
  fuelType: string;
  currentLat?: number;
  currentLng?: number;
}

export interface Driver {
  id: string;
  user: User;
  licenseNumber: string;
  licenseExpiryDate: string;
  yearsExperience: number;
  available: boolean;
}

export interface Trip {
  id: string;
  driver: Driver;
  vehicle: Vehicle;
  startLocation: string;
  endLocation: string;
  startTime?: string;
  endTime?: string;
  distanceKm?: number;
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
}