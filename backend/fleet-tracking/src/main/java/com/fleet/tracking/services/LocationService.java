package com.fleet.tracking.services;

import com.fleet.tracking.models.Location;
import com.fleet.tracking.models.Vehicle;
import com.fleet.tracking.repositories.LocationRepository;
import com.fleet.tracking.repositories.VehicleRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
public class LocationService {

    private final LocationRepository locationRepository;
    private final VehicleRepository vehicleRepository;

    public LocationService(LocationRepository locationRepository, VehicleRepository vehicleRepository) {
        this.locationRepository = locationRepository;
        this.vehicleRepository = vehicleRepository;
    }

    /**
     * Records a new GPS ping.
     * This updates the History table AND the Vehicle's current position.
     */
    @Transactional
    public Location recordLocation(UUID vehicleId, Double lat, Double lng, java.math.BigDecimal speed) {
        Vehicle vehicle = vehicleRepository.findById(vehicleId)
                .orElseThrow(() -> new RuntimeException("Vehicle not found"));

        // 1. Save to History
        Location location = new Location();
        location.setVehicle(vehicle);
        location.setLat(lat);
        location.setLng(lng);
        location.setSpeedKmh(speed);
        // If there is an active trip, you might set it here by querying TripService

        Location savedLocation = locationRepository.save(location);

        // 2. Update Vehicle Current State
        vehicle.setCurrentLat(lat);
        vehicle.setCurrentLng(lng);
        vehicleRepository.save(vehicle);

        return savedLocation;
    }

    public List<Location> getTripHistory(UUID tripId) {
        return locationRepository.findByTripIdOrderByRecordedAtAsc(tripId);
    }

    public Location getLastKnownLocation(UUID vehicleId) {
        return locationRepository.findTopByVehicleIdOrderByRecordedAtDesc(vehicleId);
    }
}
