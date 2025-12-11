package com.fleet.tracking.repositories;

import com.fleet.tracking.models.Trip;
import com.fleet.tracking.models.enums.TripStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface TripRepository extends JpaRepository<Trip, UUID> {

    // Find all trips for a specific driver
    List<Trip> findByDriverId(UUID driverId);

    // Find all trips for a specific vehicle
    List<Trip> findByVehicleId(UUID vehicleId);

    // Find trips by status (e.g., currently IN_PROGRESS)
    List<Trip> findByStatus(TripStatus status);

    // Find trips overlapping a specific time range (useful for scheduling conflicts)
    @Query("SELECT t FROM Trip t WHERE t.driver.id = :driverId AND " +
            "(t.startTime <= :endTime AND t.endTime >= :startTime)")
    List<Trip> findConflictingTrips(@Param("driverId") UUID driverId,
                                    @Param("startTime") LocalDateTime startTime,
                                    @Param("endTime") LocalDateTime endTime);
}