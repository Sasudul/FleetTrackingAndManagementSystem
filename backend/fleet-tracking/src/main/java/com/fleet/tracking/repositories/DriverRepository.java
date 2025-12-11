package com.fleet.tracking.repositories;

import com.fleet.tracking.models.Driver;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;
import java.util.List;

@Repository
public interface DriverRepository extends JpaRepository<Driver, UUID> {

    // Find driver by their User account ID
    Optional<Driver> findByUserId(UUID userId);

    // Find by license number
    Optional<Driver> findByLicenseNumber(String licenseNumber);

    // Find currently available drivers
    List<Driver> findByAvailableTrue();
}