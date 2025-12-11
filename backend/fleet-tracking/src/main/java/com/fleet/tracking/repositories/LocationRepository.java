package com.fleet.tracking.repositories;

import com.fleet.tracking.models.Location;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface LocationRepository extends JpaRepository<Location, UUID> {

    // Get history for a specific trip, ordered by time (vital for drawing route lines)
    List<Location> findByTripIdOrderByRecordedAtAsc(UUID tripId);

    // Get history for a vehicle within a time range
    List<Location> findByVehicleIdAndRecordedAtBetweenOrderByRecordedAtAsc(
            UUID vehicleId,
            LocalDateTime start,
            LocalDateTime end
    );

    // Get the most recent location for a vehicle
    Location findTopByVehicleIdOrderByRecordedAtDesc(UUID vehicleId);
}