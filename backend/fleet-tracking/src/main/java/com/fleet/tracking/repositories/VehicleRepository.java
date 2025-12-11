package com.fleet.tracking.repositories;

import com.fleet.tracking.models.Vehicle;
import com.fleet.tracking.models.enums.VehicleStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface VehicleRepository extends JpaRepository<Vehicle, UUID> {

    // Find specific vehicle
    Optional<Vehicle> findByLicensePlate(String licensePlate);
    Optional<Vehicle> findByVin(String vin);

    // Get fleet status
    List<Vehicle> findByStatus(VehicleStatus status);

    // Get all active vehicles (not retired)
    List<Vehicle> findByStatusNot(VehicleStatus status);
}