package com.fleet.tracking.services;

import com.fleet.tracking.models.Driver;
import com.fleet.tracking.models.Trip;
import com.fleet.tracking.models.Vehicle;
import com.fleet.tracking.models.enums.TripStatus;
import com.fleet.tracking.repositories.DriverRepository;
import com.fleet.tracking.repositories.TripRepository;
import com.fleet.tracking.repositories.VehicleRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
public class TripService {

    private final TripRepository tripRepository;
    private final DriverRepository driverRepository;
    private final VehicleRepository vehicleRepository;

    public TripService(TripRepository tripRepository, DriverRepository driverRepository, VehicleRepository vehicleRepository) {
        this.tripRepository = tripRepository;
        this.driverRepository = driverRepository;
        this.vehicleRepository = vehicleRepository;
    }

    @Transactional
    public Trip createTrip(Trip trip, UUID driverId, UUID vehicleId) {
        Driver driver = driverRepository.findById(driverId)
                .orElseThrow(() -> new RuntimeException("Driver not found"));

        Vehicle vehicle = vehicleRepository.findById(vehicleId)
                .orElseThrow(() -> new RuntimeException("Vehicle not found"));

        if (!driver.isAvailable()) {
            throw new RuntimeException("Driver is currently unavailable.");
        }

        // Check for conflicting trips if start/end times are provided
        if (trip.getStartTime() != null && trip.getEndTime() != null) {
            List<Trip> conflicts = tripRepository.findConflictingTrips(driverId, trip.getStartTime(), trip.getEndTime());
            if (!conflicts.isEmpty()) {
                throw new RuntimeException("Driver has a conflicting trip during this time.");
            }
        }

        trip.setDriver(driver);
        trip.setVehicle(vehicle);
        trip.setStatus(TripStatus.SCHEDULED);

        // Mark driver as busy implicitly if needed, or handle via status
        driver.setAvailable(false);
        driverRepository.save(driver);

        return tripRepository.save(trip);
    }

    @Transactional
    public Trip startTrip(UUID tripId) {
        Trip trip = tripRepository.findById(tripId)
                .orElseThrow(() -> new RuntimeException("Trip not found"));

        if (trip.getStatus() != TripStatus.SCHEDULED) {
            throw new RuntimeException("Only SCHEDULED trips can be started.");
        }

        trip.setStatus(TripStatus.IN_PROGRESS);
        trip.setStartTime(LocalDateTime.now());

        return tripRepository.save(trip);
    }

    @Transactional
    public Trip cancelTrip(UUID tripId) {
        Trip trip = tripRepository.findById(tripId)
                .orElseThrow(() -> new RuntimeException("Trip not found"));

        if (trip.getStatus() == TripStatus.COMPLETED) {
            throw new RuntimeException("Cannot cancel a completed trip.");
        }

        trip.setStatus(TripStatus.CANCELLED);
        trip.setEndTime(LocalDateTime.now());

        Driver driver = trip.getDriver();
        driver.setAvailable(true);
        driverRepository.save(driver);

        return tripRepository.save(trip);
    }

    @Transactional
    public Trip completeTrip(UUID tripId, Double finalDistanceKm) {
        Trip trip = tripRepository.findById(tripId)
                .orElseThrow(() -> new RuntimeException("Trip not found"));

        trip.setStatus(TripStatus.COMPLETED);
        trip.setEndTime(LocalDateTime.now());
        if (finalDistanceKm != null) {
            trip.setDistanceKm(java.math.BigDecimal.valueOf(finalDistanceKm));
        }

        // Release driver
        Driver driver = trip.getDriver();
        driver.setAvailable(true);
        driverRepository.save(driver);

        return tripRepository.save(trip);
    }

    public List<Trip> getActiveTrips() {
        return tripRepository.findByStatus(TripStatus.IN_PROGRESS);
    }

    public List<Trip> getAllTrips() {
        return tripRepository.findAll();
    }
}