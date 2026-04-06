package com.fleet.tracking.config;

import com.fleet.tracking.models.*;
import com.fleet.tracking.models.enums.*;
import com.fleet.tracking.repositories.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;

/**
 * Seeds the database with realistic demo data on first run.
 * Only runs when the users table is empty (idempotent).
 */
@Component
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final DriverRepository driverRepository;
    private final VehicleRepository vehicleRepository;
    private final TripRepository tripRepository;
    private final LocationRepository locationRepository;
    private final PasswordEncoder passwordEncoder;

    public DataSeeder(UserRepository userRepository,
                      DriverRepository driverRepository,
                      VehicleRepository vehicleRepository,
                      TripRepository tripRepository,
                      LocationRepository locationRepository,
                      PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.driverRepository = driverRepository;
        this.vehicleRepository = vehicleRepository;
        this.tripRepository = tripRepository;
        this.locationRepository = locationRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public void run(String... args) {
        // Only seed if no vehicles exist (safe to re-run even if a user was manually created)
        if (vehicleRepository.count() > 0) {
            System.out.println(">>> Database already seeded. Skipping.");
            return;
        }

        System.out.println(">>> Seeding database with demo data...");

        // ========== 1. USERS ==========
        String encodedPassword = passwordEncoder.encode("password123");

        // Admins
        User admin1 = createUser("sarah.khan@fleetsys.com", encodedPassword, "Sarah Khan", UserRole.ADMIN);
        User admin2 = createUser("james.wilson@fleetsys.com", encodedPassword, "James Wilson", UserRole.ADMIN);

        // Dispatchers
        User disp1 = createUser("amina.patel@fleetsys.com", encodedPassword, "Amina Patel", UserRole.DISPATCHER);
        User disp2 = createUser("robert.chen@fleetsys.com", encodedPassword, "Robert Chen", UserRole.DISPATCHER);
        User disp3 = createUser("lisa.martinez@fleetsys.com", encodedPassword, "Lisa Martinez", UserRole.DISPATCHER);

        // Drivers
        User driverUser1 = createUser("ahmed.rahman@fleetsys.com", encodedPassword, "Ahmed Rahman", UserRole.DRIVER);
        User driverUser2 = createUser("michael.brown@fleetsys.com", encodedPassword, "Michael Brown", UserRole.DRIVER);
        User driverUser3 = createUser("priya.sharma@fleetsys.com", encodedPassword, "Priya Sharma", UserRole.DRIVER);
        User driverUser4 = createUser("carlos.rivera@fleetsys.com", encodedPassword, "Carlos Rivera", UserRole.DRIVER);
        User driverUser5 = createUser("fatima.ali@fleetsys.com", encodedPassword, "Fatima Ali", UserRole.DRIVER);
        User driverUser6 = createUser("david.johnson@fleetsys.com", encodedPassword, "David Johnson", UserRole.DRIVER);
        User driverUser7 = createUser("nadia.begum@fleetsys.com", encodedPassword, "Nadia Begum", UserRole.DRIVER);
        User driverUser8 = createUser("tom.scott@fleetsys.com", encodedPassword, "Tom Scott", UserRole.DRIVER);

        userRepository.saveAll(List.of(
                admin1, admin2, disp1, disp2, disp3,
                driverUser1, driverUser2, driverUser3, driverUser4,
                driverUser5, driverUser6, driverUser7, driverUser8
        ));

        System.out.println("   ✓ 13 users created (2 admins, 3 dispatchers, 8 drivers)");

        // ========== 2. DRIVERS (profiles linked to driver users) ==========
        Driver d1 = createDriver(driverUser1, "DL-2024-001234", LocalDate.of(2028, 6, 15), 8, true);
        Driver d2 = createDriver(driverUser2, "DL-2023-005678", LocalDate.of(2027, 3, 22), 12, true);
        Driver d3 = createDriver(driverUser3, "DL-2024-009012", LocalDate.of(2029, 1, 10), 5, true);
        Driver d4 = createDriver(driverUser4, "DL-2022-003456", LocalDate.of(2027, 11, 30), 15, false); // on a trip
        Driver d5 = createDriver(driverUser5, "DL-2024-007890", LocalDate.of(2028, 8, 5), 3, true);
        Driver d6 = createDriver(driverUser6, "DL-2021-002345", LocalDate.of(2026, 12, 20), 20, false); // on a trip
        Driver d7 = createDriver(driverUser7, "DL-2025-006789", LocalDate.of(2030, 4, 18), 2, true);
        Driver d8 = createDriver(driverUser8, "DL-2023-004567", LocalDate.of(2028, 9, 1), 7, true);

        driverRepository.saveAll(List.of(d1, d2, d3, d4, d5, d6, d7, d8));
        System.out.println("   ✓ 8 driver profiles created");

        // ========== 3. VEHICLES ==========
        Vehicle v1  = createVehicle("KA-01-AB-1234", "1HGCM82633A004352", "Toyota", "Hilux", 2023, "Diesel", VehicleStatus.ACTIVE, 12.9716, 77.5946);
        Vehicle v2  = createVehicle("KA-02-CD-5678", "2T1BURHE5JC073584", "Tata", "Ace", 2022, "Diesel", VehicleStatus.ACTIVE, 12.9352, 77.6245);
        Vehicle v3  = createVehicle("MH-01-EF-9012", "JN1TBNT30Z0000001", "Mahindra", "Bolero Pickup", 2024, "Diesel", VehicleStatus.ACTIVE, 19.0760, 72.8777);
        Vehicle v4  = createVehicle("DL-03-GH-3456", "WVWZZZ3CZWE000001", "Ashok Leyland", "Dost", 2021, "Diesel", VehicleStatus.ACTIVE, 28.6139, 77.2090);
        Vehicle v5  = createVehicle("KA-03-IJ-7890", "1FTFW1ET5DFC10312", "Eicher", "Pro 2049", 2023, "Diesel", VehicleStatus.ACTIVE, 12.2958, 76.6394);
        Vehicle v6  = createVehicle("TN-01-KL-2345", "1GCGG25K571163742", "BharatBenz", "1217C", 2022, "Diesel", VehicleStatus.MAINTENANCE, null, null);
        Vehicle v7  = createVehicle("MH-02-MN-6789", "3N1AB7AP5GY234567", "Tata", "Ultra T.7", 2024, "Diesel", VehicleStatus.ACTIVE, 18.5204, 73.8567);
        Vehicle v8  = createVehicle("KA-04-OP-0123", "1FMCU0GX4DUA12345", "Mahindra", "Furio 7", 2023, "Diesel", VehicleStatus.ACTIVE, 15.3647, 75.1240);
        Vehicle v9  = createVehicle("DL-05-QR-4567", "5YJSA1DG9DFP14555", "Tata", "Intra V30", 2021, "CNG", VehicleStatus.ACTIVE, 28.7041, 77.1025);
        Vehicle v10 = createVehicle("GJ-01-ST-8901", "WBAPH5C51BA271053", "Ashok Leyland", "Partner", 2020, "Diesel", VehicleStatus.RETIRED, null, null);
        Vehicle v11 = createVehicle("RJ-14-UV-2345", "1G1YY22G965104378", "Toyota", "Dyna", 2024, "Diesel", VehicleStatus.ACTIVE, 26.9124, 75.7873);
        Vehicle v12 = createVehicle("KA-05-WX-6789", "JTEBU5JR5D5012345", "Eicher", "Pro 3015", 2023, "Diesel", VehicleStatus.MAINTENANCE, null, null);

        vehicleRepository.saveAll(List.of(v1, v2, v3, v4, v5, v6, v7, v8, v9, v10, v11, v12));
        System.out.println("   ✓ 12 vehicles created (9 active, 2 maintenance, 1 retired)");

        // ========== 4. TRIPS ==========
        // Active trips (IN_PROGRESS)
        Trip trip1 = createTrip(d4, v1, "Bangalore Warehouse A", "Chennai Distribution Hub",
                TripStatus.IN_PROGRESS, LocalDateTime.now().minusHours(3), null, null);
        Trip trip2 = createTrip(d6, v3, "Mumbai Central Depot", "Pune Logistics Park",
                TripStatus.IN_PROGRESS, LocalDateTime.now().minusHours(1), null, null);

        // Scheduled trips
        Trip trip3 = createTrip(d1, v4, "Delhi Freight Terminal", "Jaipur Warehouse",
                TripStatus.SCHEDULED, null, null, null);
        Trip trip4 = createTrip(d2, v5, "Mysore Depot", "Bangalore Distribution Center",
                TripStatus.SCHEDULED, null, null, null);

        // Completed trips
        Trip trip5 = createTrip(d3, v2, "Bangalore Hub", "Hyderabad Central",
                TripStatus.COMPLETED,
                LocalDateTime.now().minusDays(1).minusHours(6),
                LocalDateTime.now().minusDays(1),
                BigDecimal.valueOf(560.5));
        Trip trip6 = createTrip(d5, v7, "Pune Distribution", "Mumbai Port",
                TripStatus.COMPLETED,
                LocalDateTime.now().minusDays(2).minusHours(4),
                LocalDateTime.now().minusDays(2).minusHours(1),
                BigDecimal.valueOf(155.2));
        Trip trip7 = createTrip(d1, v9, "Delhi NCR Hub", "Agra Warehouse",
                TripStatus.COMPLETED,
                LocalDateTime.now().minusDays(3).minusHours(5),
                LocalDateTime.now().minusDays(3).minusHours(2),
                BigDecimal.valueOf(230.0));
        Trip trip8 = createTrip(d7, v8, "Hubli Depot", "Belgaum Distribution",
                TripStatus.COMPLETED,
                LocalDateTime.now().minusDays(4).minusHours(3),
                LocalDateTime.now().minusDays(4),
                BigDecimal.valueOf(190.8));

        // Cancelled trip
        Trip trip9 = createTrip(d8, v11, "Jaipur Warehouse", "Udaipur Depot",
                TripStatus.CANCELLED, null, null, null);

        tripRepository.saveAll(List.of(trip1, trip2, trip3, trip4, trip5, trip6, trip7, trip8, trip9));
        System.out.println("   ✓ 9 trips created (2 active, 2 scheduled, 4 completed, 1 cancelled)");

        // ========== 5. LOCATION HISTORY (GPS pings for active trips) ==========
        // Simulate GPS trail for trip1: Bangalore → Chennai
        seedLocationHistory(v1, trip1, new double[][]{
                {12.9716, 77.5946}, {12.9200, 77.6500}, {12.8400, 77.7200},
                {12.7500, 77.8100}, {12.6800, 77.9000}, {12.5900, 78.0200},
                {12.5000, 78.1500}, {12.4200, 78.3000}, {12.3500, 78.4500},
                {12.3000, 78.6000}
        });

        // Simulate GPS trail for trip2: Mumbai → Pune
        seedLocationHistory(v3, trip2, new double[][]{
                {19.0760, 72.8777}, {19.0200, 72.9500}, {18.9500, 73.0300},
                {18.8800, 73.1200}, {18.7500, 73.2500}, {18.6200, 73.4000}
        });

        System.out.println("   ✓ 16 GPS location pings seeded for active trips");
        System.out.println(">>> Database seeding complete!");
        System.out.println(">>> Login with any email above + password: password123");
    }

    // ===================== Helper Methods =====================

    private User createUser(String email, String encodedPassword, String fullName, UserRole role) {
        User user = new User();
        user.setEmail(email);
        user.setPasswordHash(encodedPassword);
        user.setFullName(fullName);
        user.setRole(role);
        user.setActive(true);
        return user;
    }

    private Driver createDriver(User user, String licenseNumber, LocalDate expiryDate, int yearsExp, boolean available) {
        Driver driver = new Driver();
        driver.setUser(user);
        driver.setLicenseNumber(licenseNumber);
        driver.setLicenseExpiryDate(expiryDate);
        driver.setYearsExperience(yearsExp);
        driver.setAvailable(available);
        return driver;
    }

    private Vehicle createVehicle(String plate, String vin, String make, String model, int year,
                                   String fuelType, VehicleStatus status, Double lat, Double lng) {
        Vehicle vehicle = new Vehicle();
        vehicle.setLicensePlate(plate);
        vehicle.setVin(vin);
        vehicle.setMake(make);
        vehicle.setModel(model);
        vehicle.setYear(year);
        vehicle.setFuelType(fuelType);
        vehicle.setStatus(status);
        vehicle.setCurrentLat(lat);
        vehicle.setCurrentLng(lng);
        return vehicle;
    }

    private Trip createTrip(Driver driver, Vehicle vehicle, String start, String end,
                             TripStatus status, LocalDateTime startTime, LocalDateTime endTime, BigDecimal distance) {
        Trip trip = new Trip();
        trip.setDriver(driver);
        trip.setVehicle(vehicle);
        trip.setStartLocation(start);
        trip.setEndLocation(end);
        trip.setStatus(status);
        trip.setStartTime(startTime);
        trip.setEndTime(endTime);
        trip.setDistanceKm(distance);
        return trip;
    }

    private void seedLocationHistory(Vehicle vehicle, Trip trip, double[][] coords) {
        List<Location> locations = new ArrayList<>();
        for (int i = 0; i < coords.length; i++) {
            Location loc = new Location();
            loc.setVehicle(vehicle);
            loc.setTrip(trip);
            loc.setLat(coords[i][0]);
            loc.setLng(coords[i][1]);
            loc.setSpeedKmh(BigDecimal.valueOf(50 + Math.random() * 40)); // 50-90 km/h
            locations.add(loc);
        }
        locationRepository.saveAll(locations);

        // Update vehicle current position to the latest coordinate
        vehicle.setCurrentLat(coords[coords.length - 1][0]);
        vehicle.setCurrentLng(coords[coords.length - 1][1]);
        vehicleRepository.save(vehicle);
    }
}
