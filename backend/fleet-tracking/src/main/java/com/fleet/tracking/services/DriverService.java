package com.fleet.tracking.services;

import com.fleet.tracking.models.Driver;
import com.fleet.tracking.models.User;
import com.fleet.tracking.models.enums.UserRole;
import com.fleet.tracking.repositories.DriverRepository;
import com.fleet.tracking.repositories.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
public class DriverService {

    private final DriverRepository driverRepository;
    private final UserRepository userRepository;

    public DriverService(DriverRepository driverRepository, UserRepository userRepository) {
        this.driverRepository = driverRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public Driver onboardDriver(Driver driver, UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (user.getRole() != UserRole.DRIVER) {
            throw new RuntimeException("User must have DRIVER role to be onboarded.");
        }

        if (driverRepository.findByUserId(userId).isPresent()) {
            throw new RuntimeException("Driver profile already exists for this user.");
        }

        driver.setUser(user);
        return driverRepository.save(driver);
    }

    public Driver getDriver(UUID id) {
        return driverRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Driver not found"));
    }

    public List<Driver> getAvailableDrivers() {
        return driverRepository.findByAvailableTrue();
    }

    @Transactional
    public void setAvailability(UUID driverId, boolean isAvailable) {
        Driver driver = getDriver(driverId);
        driver.setAvailable(isAvailable);
        driverRepository.save(driver);
    }
}