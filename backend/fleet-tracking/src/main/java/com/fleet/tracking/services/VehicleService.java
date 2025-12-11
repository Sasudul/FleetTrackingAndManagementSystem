package com.fleet.tracking.services;

import com.fleet.tracking.models.Vehicle;
import com.fleet.tracking.models.enums.VehicleStatus;
import com.fleet.tracking.repositories.VehicleRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
public class VehicleService {

    private final VehicleRepository vehicleRepository;

    public VehicleService(VehicleRepository vehicleRepository) {
        this.vehicleRepository = vehicleRepository;
    }

    public Vehicle registerVehicle(Vehicle vehicle) {
        if (vehicleRepository.findByLicensePlate(vehicle.getLicensePlate()).isPresent()) {
            throw new RuntimeException("Vehicle with this license plate already exists.");
        }
        return vehicleRepository.save(vehicle);
    }

    public Vehicle getVehicle(UUID id) {
        return vehicleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Vehicle not found: " + id));
    }

    public List<Vehicle> getAllVehicles() {
        return vehicleRepository.findAll();
    }

    @Transactional
    public Vehicle updateVehicleStatus(UUID id, VehicleStatus status) {
        Vehicle vehicle = getVehicle(id);
        vehicle.setStatus(status);
        return vehicleRepository.save(vehicle);
    }

    @Transactional
    public void updateRealTimeLocation(UUID vehicleId, Double lat, Double lng) {
        Vehicle vehicle = getVehicle(vehicleId);
        vehicle.setCurrentLat(lat);
        vehicle.setCurrentLng(lng);
        vehicleRepository.save(vehicle);
    }
}
