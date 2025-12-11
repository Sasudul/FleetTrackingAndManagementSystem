package com.fleet.tracking.repositories;

import com.fleet.tracking.models.User;
import com.fleet.tracking.models.enums.UserRole;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserRepository extends JpaRepository<User, UUID> {

    // Find user for login
    Optional<User> findByEmail(String email);

    // Check if email exists during registration
    boolean existsByEmail(String email);

    // Filter users by role (e.g., get all drivers)
    List<User> findByRole(UserRole role);

    // Find active users only
    List<User> findByIsActiveTrue();
}