package com.fleet.tracking.controllers;

import com.fleet.tracking.models.Trip;
import com.fleet.tracking.services.TripService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/trips")
public class TripController {

    private final TripService tripService;

    public TripController(TripService tripService) {
        this.tripService = tripService;
    }

    @PostMapping
    public ResponseEntity<Trip> createTrip(@RequestBody Map<String, Object> payload) {
        String driverIdStr = (String) payload.get("driverId");
        String vehicleIdStr = (String) payload.get("vehicleId");

        Trip trip = new Trip();
        trip.setStartLocation((String) payload.get("startLocation"));
        trip.setEndLocation((String) payload.get("endLocation"));

        return ResponseEntity.ok(tripService.createTrip(trip, UUID.fromString(driverIdStr), UUID.fromString(vehicleIdStr)));
    }

    @GetMapping
    public ResponseEntity<List<Trip>> getAllTrips() {
        return ResponseEntity.ok(tripService.getAllTrips());
    }

    @GetMapping("/active")
    public ResponseEntity<List<Trip>> getActiveTrips() {
        return ResponseEntity.ok(tripService.getActiveTrips());
    }

    @PatchMapping("/{id}/start")
    public ResponseEntity<Trip> startTrip(@PathVariable UUID id) {
        return ResponseEntity.ok(tripService.startTrip(id));
    }

    @PatchMapping("/{id}/cancel")
    public ResponseEntity<Trip> cancelTrip(@PathVariable UUID id) {
        return ResponseEntity.ok(tripService.cancelTrip(id));
    }

    @PatchMapping("/{id}/complete")
    public ResponseEntity<Trip> completeTrip(@PathVariable UUID id, @RequestBody Map<String, Double> payload) {
        Double distance = payload.get("distanceKm");
        return ResponseEntity.ok(tripService.completeTrip(id, distance));
    }
}