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

export interface Vehicle {
  id: string;
  licensePlate: string;
  make: string;
  model: string;
  status: 'ACTIVE' | 'MAINTENANCE' | 'RETIRED';
  fuelType: string;
  currentLat?: number;
  currentLng?: number;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}