package com.fleet.tracking.controllers;


import com.fleet.tracking.models.Driver;
import com.fleet.tracking.services.DriverService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/drivers")
public class DriverController {

    private final DriverService driverService;

    public DriverController(DriverService driverService) {
        this.driverService = driverService;
    }

    @PostMapping("/onboard/{userId}")
    public ResponseEntity<Driver> onboardDriver(@PathVariable UUID userId, @RequestBody Driver driver) {
        return ResponseEntity.ok(driverService.onboardDriver(driver, userId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Driver> getDriver(@PathVariable UUID id) {
        return ResponseEntity.ok(driverService.getDriver(id));
    }

    @GetMapping
    public ResponseEntity<List<Driver>> getAllDrivers() {
        return ResponseEntity.ok(driverService.getAllDrivers());
    }

    @GetMapping("/available")
    public ResponseEntity<List<Driver>> getAvailableDrivers() {
        return ResponseEntity.ok(driverService.getAvailableDrivers());
    }

    @PatchMapping("/{id}/availability")
    public ResponseEntity<Void> setAvailability(@PathVariable UUID id, @RequestBody Map<String, Boolean> payload) {
        driverService.setAvailability(id, payload.get("available"));
        return ResponseEntity.ok().build();
    }
}
