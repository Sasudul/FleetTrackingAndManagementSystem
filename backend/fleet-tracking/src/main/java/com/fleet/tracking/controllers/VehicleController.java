package com.fleet.tracking.controllers;

import com.fleet.tracking.models.Vehicle;
import com.fleet.tracking.models.enums.VehicleStatus;
import com.fleet.tracking.services.VehicleService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/vehicles")
@CrossOrigin(origins = "*")
public class VehicleController {

    private final VehicleService vehicleService;

    public VehicleController(VehicleService vehicleService) {
        this.vehicleService = vehicleService;
    }

    @PostMapping
    public ResponseEntity<Vehicle> createVehicle(@RequestBody Vehicle vehicle) {
        return ResponseEntity.ok(vehicleService.registerVehicle(vehicle));
    }

    @GetMapping
    public ResponseEntity<List<Vehicle>> getAllVehicles() {
        return ResponseEntity.ok(vehicleService.getAllVehicles());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Vehicle> getVehicle(@PathVariable UUID id) {
        return ResponseEntity.ok(vehicleService.getVehicle(id));
    }

    // Example: PATCH /api/vehicles/{id}/status?status=MAINTENANCE
    @PatchMapping("/{id}/status")
    public ResponseEntity<Vehicle> updateStatus(@PathVariable UUID id, @RequestParam VehicleStatus status) {
        return ResponseEntity.ok(vehicleService.updateVehicleStatus(id, status));
    }

    // Endpoint for manual location updates (if not using the LocationController stream)
    @PatchMapping("/{id}/location")
    public ResponseEntity<Void> updateLocation(@PathVariable UUID id, @RequestBody Map<String, Double> coords) {
        vehicleService.updateRealTimeLocation(id, coords.get("lat"), coords.get("lng"));
        return ResponseEntity.ok().build();
    }
}