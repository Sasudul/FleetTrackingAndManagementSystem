package com.fleet.tracking.controllers;

import com.fleet.tracking.models.Location;
import com.fleet.tracking.services.LocationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/locations")
@CrossOrigin(origins = "*")
public class LocationController {

    private final LocationService locationService;

    public LocationController(LocationService locationService) {
        this.locationService = locationService;
    }

    // IoT devices or Mobile App calls this endpoint to send GPS coordinates
    @PostMapping("/{vehicleId}")
    public ResponseEntity<Location> receiveLocationPing(@PathVariable UUID vehicleId, @RequestBody Map<String, Object> payload) {
        Double lat = (Double) payload.get("lat");
        Double lng = (Double) payload.get("lng");
        Double speedVal = (Double) payload.get("speed");
        BigDecimal speed = speedVal != null ? BigDecimal.valueOf(speedVal) : BigDecimal.ZERO;

        Location location = locationService.recordLocation(vehicleId, lat, lng, speed);
        return ResponseEntity.ok(location);
    }

    @GetMapping("/history/trip/{tripId}")
    public ResponseEntity<List<Location>> getTripHistory(@PathVariable UUID tripId) {
        return ResponseEntity.ok(locationService.getTripHistory(tripId));
    }

    @GetMapping("/latest/{vehicleId}")
    public ResponseEntity<Location> getLastKnownLocation(@PathVariable UUID vehicleId) {
        return ResponseEntity.ok(locationService.getLastKnownLocation(vehicleId));
    }
}