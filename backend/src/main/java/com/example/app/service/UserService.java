package com.example.app.service;

import com.example.app.dto.UpdateProfileRequest;
import com.example.app.dto.UserDto;
import com.example.app.entity.Role;
import com.example.app.entity.User;
import com.example.app.entity.UserStatus;
import com.example.app.exception.BadRequestException;
import com.example.app.exception.ResourceNotFoundException;
import com.example.app.repository.EnrollmentRepository;
import com.example.app.repository.UserRepository;
import com.example.app.security.SecurityUtils;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository,
                       EnrollmentRepository enrollmentRepository,
                       PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.enrollmentRepository = enrollmentRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public User getByEmail(String email) {
        return userRepository.findByEmail(email)
            .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    public UserDto getCurrentUser() {
        String email = SecurityUtils.getCurrentUserEmail();
        if (email == null) {
            throw new BadRequestException("Unauthenticated request");
        }
        return UserDto.fromEntity(getByEmail(email));
    }

    public UserDto updateProfile(UpdateProfileRequest request) {
        String email = SecurityUtils.getCurrentUserEmail();
        if (email == null) {
            throw new BadRequestException("Unauthenticated request");
        }
        User user = getByEmail(email);
        user.setFullName(request.getFullName());
        user.setDisplayName(request.getDisplayName());
        user.setAvatarUrl(request.getAvatarUrl());
        user.setPhone(request.getPhone());
        user.setBio(request.getBio());
        userRepository.save(user);
        return UserDto.fromEntity(user);
    }

    public void changePassword(String currentPassword, String newPassword) {
        String email = SecurityUtils.getCurrentUserEmail();
        if (email == null) {
            throw new BadRequestException("Unauthenticated request");
        }
        if (newPassword == null || newPassword.length() < 6) {
            throw new BadRequestException("New password must be at least 6 characters");
        }

        User user = getByEmail(email);
        if (!passwordEncoder.matches(currentPassword, user.getPasswordHash())) {
            throw new BadRequestException("Current password is incorrect");
        }

        user.setPasswordHash(passwordEncoder.encode(newPassword));
        userRepository.save(user);
    }

    public List<UserDto> listStudents(UserStatus status) {
        Map<UUID, Integer> enrolledCourseCountByUserId = enrollmentRepository.findAll().stream()
            .collect(Collectors.groupingBy(
                enrollment -> enrollment.getUser().getId(),
                Collectors.collectingAndThen(Collectors.counting(), Long::intValue)
            ));

        return userRepository.findAll().stream()
            .filter(user -> user.getRole() == Role.STUDENT)
            .filter(user -> status == null || user.getStatus() == status)
            .map(user -> UserDto.fromEntity(user, enrolledCourseCountByUserId.getOrDefault(user.getId(), 0)))
            .collect(Collectors.toList());
    }

    public UserDto updateStatus(UUID userId, UserStatus status) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        user.setStatus(status);
        userRepository.save(user);
        return UserDto.fromEntity(user);
    }

    public UserDto createStudent(String fullName, String email, String password, String phone) {
        String normalizedFullName = fullName == null ? null : fullName.trim();
        String normalizedEmail = email == null ? null : email.trim().toLowerCase();
        String normalizedPhone = phone == null || phone.isBlank() ? null : phone.trim();

        if (userRepository.existsByEmail(normalizedEmail)) {
            throw new BadRequestException("Email already registered");
        }
        User user = new User();
        user.setFullName(normalizedFullName);
        user.setEmail(normalizedEmail);
        user.setPasswordHash(passwordEncoder.encode(password.trim()));
        user.setRole(Role.STUDENT);
        user.setPhone(normalizedPhone);
        userRepository.save(user);
        return UserDto.fromEntity(user);
    }

    public UserDto updateStudent(UUID userId, String fullName, String email, String phone) {
        String normalizedFullName = fullName == null ? null : fullName.trim();
        String normalizedEmail = email == null ? null : email.trim().toLowerCase();
        String normalizedPhone = phone == null || phone.isBlank() ? null : phone.trim();

        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        userRepository.findByEmail(normalizedEmail)
            .filter(existing -> !existing.getId().equals(userId))
            .ifPresent(existing -> {
                throw new BadRequestException("Email already registered");
            });

        user.setFullName(normalizedFullName);
        user.setEmail(normalizedEmail);
        user.setPhone(normalizedPhone);
        userRepository.save(user);
        return UserDto.fromEntity(user);
    }
}
