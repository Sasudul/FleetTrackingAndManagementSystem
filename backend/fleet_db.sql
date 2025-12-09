
-- 1. Create Database (run as a superuser / postgres)
CREATE DATABASE fleet_db
    WITH
    OWNER = postgres
    ENCODING = 'UTF8'
    LC_COLLATE = 'English_United States.1252'
    LC_CTYPE = 'English_United States.1252'
    LOCALE_PROVIDER = 'libc'
    TABLESPACE = pg_default
    CONNECTION LIMIT = -1
    IS_TEMPLATE = False;

-- Connect to fleet_db before running the remainder of the script.
-- \c fleet_db

-- 2. Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =======================================================
-- 3. ENUMS
-- =======================================================
CREATE TYPE user_role AS ENUM ('ADMIN', 'DISPATCHER', 'DRIVER');
CREATE TYPE vehicle_status AS ENUM ('ACTIVE', 'MAINTENANCE', 'RETIRED');
CREATE TYPE trip_status AS ENUM ('SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');
CREATE TYPE alert_severity AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- =======================================================
-- 4. Utility: timestamp update trigger function
-- =======================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =======================================================
-- 5. TABLES
-- =======================================================

-- 5.1 USERS (authentication & base user data)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL, -- BCrypt/Argon2 encoded
    full_name VARCHAR(100) NOT NULL,
    role user_role NOT NULL,
    phone_number VARCHAR(20),
    is_active BOOLEAN DEFAULT TRUE,
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
-- Partial index for active (non-deleted) users for faster lookups
CREATE INDEX idx_users_email_active ON users(email) WHERE deleted_at IS NULL;

CREATE TRIGGER trg_users_updated_at
BEFORE UPDATE ON users
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 5.2 VEHICLES
CREATE TABLE vehicles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    license_plate VARCHAR(20) UNIQUE NOT NULL,
    vin VARCHAR(50) UNIQUE NOT NULL,
    make VARCHAR(50) NOT NULL,
    model VARCHAR(50) NOT NULL,
    year INT NOT NULL CHECK (year > 1900 AND year <= EXTRACT(YEAR FROM CURRENT_DATE) + 1),
    fuel_type VARCHAR(20),
    status vehicle_status DEFAULT 'ACTIVE',
    current_lat DOUBLE PRECISION,
    current_lng DOUBLE PRECISION,
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_vehicles_license ON vehicles(license_plate);
CREATE INDEX idx_vehicles_status ON vehicles(status);
CREATE INDEX idx_vehicles_active ON vehicles(id) WHERE deleted_at IS NULL;

CREATE TRIGGER trg_vehicles_updated_at
BEFORE UPDATE ON vehicles
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 5.3 DRIVERS (extends users)
CREATE TABLE drivers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    license_number VARCHAR(50) UNIQUE NOT NULL,
    license_expiry_date DATE NOT NULL,
    years_experience INT,
    available BOOLEAN DEFAULT TRUE,
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_drivers_userid ON drivers(user_id);
CREATE INDEX idx_drivers_available ON drivers(available);
CREATE INDEX idx_drivers_active ON drivers(id) WHERE deleted_at IS NULL;

CREATE TRIGGER trg_drivers_updated_at
BEFORE UPDATE ON drivers
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 5.4 TRIPS (core operational unit)
-- NOTE: Using RESTRICT on driver/vehicle to avoid accidental deletion of assets with historical trips.
CREATE TABLE trips (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    driver_id UUID NOT NULL REFERENCES drivers(id) ON DELETE RESTRICT,
    vehicle_id UUID NOT NULL REFERENCES vehicles(id) ON DELETE RESTRICT,
    start_location VARCHAR(255) NOT NULL,
    end_location VARCHAR(255) NOT NULL,
    start_time TIMESTAMP WITH TIME ZONE,
    end_time TIMESTAMP WITH TIME ZONE,
    distance_km DECIMAL(10, 2),
    status trip_status DEFAULT 'SCHEDULED',
    route_data JSONB, -- path, waypoints, polyline, etc.
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_trips_driver ON trips(driver_id);
CREATE INDEX idx_trips_vehicle ON trips(vehicle_id);
CREATE INDEX idx_trips_status ON trips(status);
CREATE INDEX idx_trips_active ON trips(id) WHERE deleted_at IS NULL;

CREATE TRIGGER trg_trips_updated_at
BEFORE UPDATE ON trips
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 5.5 ALERTS & VIOLATIONS
CREATE TABLE alerts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    trip_id UUID REFERENCES trips(id) ON DELETE SET NULL,
    vehicle_id UUID REFERENCES vehicles(id) ON DELETE SET NULL,
    alert_type VARCHAR(50) NOT NULL, -- e.g., 'SPEEDING', 'GEOFENCE_EXIT'
    severity alert_severity DEFAULT 'MEDIUM',
    lat DOUBLE PRECISION,
    lng DOUBLE PRECISION,
    details TEXT,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_alerts_vehicle ON alerts(vehicle_id);
CREATE INDEX idx_alerts_type ON alerts(alert_type);
CREATE INDEX idx_alerts_time ON alerts(timestamp);

-- 5.6 MAINTENANCE LOGS
CREATE TABLE maintenance_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vehicle_id UUID NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    cost DECIMAL(10, 2),
    service_date DATE NOT NULL,
    performed_by VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_maintenance_vehicle ON maintenance_logs(vehicle_id);
CREATE INDEX idx_maintenance_date ON maintenance_logs(service_date);

-- 5.7 LOCATION HISTORY (critical for replay, analytics)
CREATE TABLE location_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vehicle_id UUID NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
    trip_id UUID REFERENCES trips(id) ON DELETE SET NULL,
    lat DOUBLE PRECISION NOT NULL,
    lng DOUBLE PRECISION NOT NULL,
    speed_kmh DECIMAL(10,2),
    heading_angle DECIMAL(10,2),
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Composite index for quick retrieval of chronological route for a vehicle/trip
CREATE INDEX idx_location_vehicle_time ON location_history(vehicle_id, recorded_at DESC);
CREATE INDEX idx_location_trip_time ON location_history(trip_id, recorded_at DESC);

-- 5.8 FUEL LOGS
CREATE TABLE fuel_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vehicle_id UUID NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
    volume_liters DECIMAL(10,2) NOT NULL,
    cost DECIMAL(10,2),
    filled_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    station_name VARCHAR(100),
    odometer_km DECIMAL(12,2)
);

CREATE INDEX idx_fuel_vehicle ON fuel_logs(vehicle_id);
CREATE INDEX idx_fuel_date ON fuel_logs(filled_at);

-- 5.9 GEOFENCES (simple JSON polygon storage)
CREATE TABLE geofences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    polygon_coordinates JSONB NOT NULL, -- recommended format: GeoJSON or array of [lat,lng]
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_geofences_active ON geofences(active);

CREATE TRIGGER trg_geofences_updated_at
BEFORE UPDATE ON geofences
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 5.10 TRIP EVENTS (start, stop, arr, delays)
CREATE TABLE trip_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    trip_id UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
    event_type VARCHAR(50) NOT NULL, -- e.g., START, STOP, ARRIVED, DELAY, REROUTE
    lat DOUBLE PRECISION,
    lng DOUBLE PRECISION,
    event_time TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    details JSONB
);

CREATE INDEX idx_trip_events_trip_time ON trip_events(trip_id, event_time DESC);

-- 5.11 OPTIONAL: API Keys / Integrations table (if you store external API keys)
CREATE TABLE integration_keys (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    provider VARCHAR(100) NOT NULL, -- 'google_maps', 'thirdparty_gps', etc.
    name VARCHAR(100),
    api_key TEXT NOT NULL,
    encrypted BOOLEAN DEFAULT FALSE, -- if stored encrypted at rest
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TRIGGER trg_integration_keys_updated_at
BEFORE UPDATE ON integration_keys
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =======================================================
-- 6. ADDITIONAL TRIGGERS / MAINTENANCE
--    (If you want to auto-populate/maintain derived fields)
-- =======================================================

-- Example: keep vehicles.current_lat/current_lng in sync via a trigger on location_history insert
CREATE OR REPLACE FUNCTION vehicles_sync_last_location()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE vehicles
    SET current_lat = NEW.lat,
        current_lng = NEW.lng,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = NEW.vehicle_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_locationhistory_after_insert
AFTER INSERT ON location_history
FOR EACH ROW EXECUTE FUNCTION vehicles_sync_last_location();

-- =======================================================
-- 7. PARTIAL INDEXES / PERFORMANCE TUNING
-- =======================================================


-- =======================================================
-- 8. SAMPLE DATA (optional - uncomment to seed)
-- =======================================================
/*
INSERT INTO users (email, password_hash, full_name, role) VALUES
('admin@example.com', '<bcrypt_hash_here>', 'Admin User', 'ADMIN'),
('disp@example.com', '<bcrypt_hash_here>', 'Dispatcher User', 'DISPATCHER');

-- Create a driver user and associated driver
INSERT INTO users (email, password_hash, full_name, role) VALUES
('driver1@example.com', '<bcrypt_hash_here>', 'Driver One', 'DRIVER');

-- Then insert into drivers with the generated user id
*/

-- =======================================================
-- 9. SECURITY / CLEANUP NOTES
-- =======================================================
-- 1) Store password hashes using BCrypt or Argon2 (do not store plain text).
-- 2) Consider encrypting sensitive columns (e.g., api_key) or storing them in a secrets manager.
-- 3) If you plan to run spatial queries / efficient polygon checks (geofencing), consider installing PostGIS and storing geometries in geometry/geography columns and using GIST indexes.
-- 4) For high-ingest location_history, consider partitioning location_history by time (daily/monthly) or vehicle for scale.
-- 5) Create roles and GRANTs for your application user instead of using the postgres superuser in production.
-- 6) Regular vacuum/analyze and retention/archival strategy for old location_history rows (e.g., move to data-warehouse or cold storage).
-- =======================================================

-- End of script