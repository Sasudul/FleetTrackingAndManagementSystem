package com.fleet.tracking.controllers;

import com.fleet.tracking.models.Trip;
import com.fleet.tracking.services.TripService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/trips")
@CrossOrigin(origins = "*")
public class TripController {

    private final TripService tripService;

    public TripController(TripService tripService) {
        this.tripService = tripService;
    }

    // Create a new trip (Assign driver & vehicle)
    // Expects JSON: { "trip": {...}, "driverId": "...", "vehicleId": "..." }
    @PostMapping
    public ResponseEntity<Trip> createTrip(@RequestBody Map<String, Object> payload) {
        // Parsing the payload manually since we aren't using DTOs
        String driverIdStr = (String) payload.get("driverId");
        String vehicleIdStr = (String) payload.get("vehicleId");

        // Manually construct trip object from payload map or use a refined request
        // For simplicity in this example, we assume basic fields or extend this logic
        Trip trip = new Trip();
        trip.setStartLocation((String) payload.get("startLocation"));
        trip.setEndLocation((String) payload.get("endLocation"));
        // ... set other fields (startTime, etc)

        return ResponseEntity.ok(tripService.createTrip(trip, UUID.fromString(driverIdStr), UUID.fromString(vehicleIdStr)));
    }

    @GetMapping("/active")
    public ResponseEntity<List<Trip>> getActiveTrips() {
        return ResponseEntity.ok(tripService.getActiveTrips());
    }

    @PatchMapping("/{id}/start")
    public ResponseEntity<Trip> startTrip(@PathVariable UUID id) {
        return ResponseEntity.ok(tripService.startTrip(id));
    }

    @PatchMapping("/{id}/complete")
    public ResponseEntity<Trip> completeTrip(@PathVariable UUID id, @RequestBody Map<String, Double> payload) {
        Double distance = payload.get("distanceKm");
        return ResponseEntity.ok(tripService.completeTrip(id, distance));
    }
}