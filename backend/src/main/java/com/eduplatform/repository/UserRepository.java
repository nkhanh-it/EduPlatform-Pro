package com.eduplatform.repository;

import com.eduplatform.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.Optional;
import java.util.List;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);

    List<User> findByRole(User.Role role);

    List<User> findByRoleAndStatus(User.Role role, User.Status status);

    List<User> findByNameContainingIgnoreCaseOrEmailContainingIgnoreCase(String name, String email);

    // Paginated queries
    Page<User> findByRole(User.Role role, Pageable pageable);

    Page<User> findByRoleAndStatus(User.Role role, User.Status status, Pageable pageable);

    // Combined search + status + date filter
    @Query("SELECT u FROM User u WHERE u.role = :role " +
            "AND (:status IS NULL OR u.status = :status) " +
            "AND (:search IS NULL OR LOWER(u.name) LIKE LOWER(CONCAT('%', :search, '%')) " +
            "     OR LOWER(u.email) LIKE LOWER(CONCAT('%', :search, '%')) " +
            "     OR LOWER(u.phone) LIKE LOWER(CONCAT('%', :search, '%'))) " +
            "AND (:startDate IS NULL OR u.joinDate >= :startDate) " +
            "AND (:endDate IS NULL OR u.joinDate <= :endDate)")
    Page<User> findStudentsFiltered(
            @Param("role") User.Role role,
            @Param("status") User.Status status,
            @Param("search") String search,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate,
            Pageable pageable);
}
