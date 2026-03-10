package com.eduplatform.service;

import com.eduplatform.dto.*;
import com.eduplatform.entity.User;
import com.eduplatform.exception.BadRequestException;
import com.eduplatform.exception.ResourceNotFoundException;
import com.eduplatform.repository.EnrollmentRepository;
import com.eduplatform.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final PasswordEncoder passwordEncoder;

    private static final DateTimeFormatter FORMATTER = DateTimeFormatter.ofPattern("dd/MM/yyyy");

    public UserResponse getProfile(User user) {
        long coursesEnrolled = enrollmentRepository.countByUserId(user.getId());

        return UserResponse.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .avatar(user.getAvatar())
                .role(user.getRole().name().toLowerCase())
                .status(user.getStatus().name().toLowerCase())
                .joinDate(user.getJoinDate() != null ? user.getJoinDate().format(FORMATTER) : "")
                .coursesEnrolled(coursesEnrolled)
                .bio(user.getBio())
                .displayName(user.getDisplayName())
                .build();
    }

    @Transactional
    public void updateProfile(User user, UpdateProfileRequest request) {
        if (request.getName() != null) user.setName(request.getName());
        if (request.getDisplayName() != null) user.setDisplayName(request.getDisplayName());
        if (request.getBio() != null) user.setBio(request.getBio());
        if (request.getPhone() != null) user.setPhone(request.getPhone());
        userRepository.save(user);
    }

    @Transactional
    public void changePassword(User user, ChangePasswordRequest request) {
        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            throw new BadRequestException("Mật khẩu hiện tại không đúng");
        }
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
    }

    // === Admin: Student Management ===

    public List<UserResponse> getAllStudents(String search, String status) {
        List<User> students;

        if (search != null && !search.isBlank()) {
            students = userRepository.findByNameContainingIgnoreCaseOrEmailContainingIgnoreCase(search, search);
            students = students.stream().filter(u -> u.getRole() == User.Role.STUDENT).toList();
        } else if (status != null && !status.isBlank()) {
            students = userRepository.findByRoleAndStatus(User.Role.STUDENT, User.Status.valueOf(status.toUpperCase()));
        } else {
            students = userRepository.findByRole(User.Role.STUDENT);
        }

        return students.stream().map(this::toResponse).toList();
    }

    public UserResponse getStudentById(Long id) {
        User user = userRepository.findById(id)
                .filter(u -> u.getRole() == User.Role.STUDENT)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy sinh viên với id: " + id));
        return toResponse(user);
    }

    @Transactional
    public UserResponse createStudent(String name, String email, String phone) {
        if (userRepository.existsByEmail(email)) {
            throw new BadRequestException("Email đã tồn tại");
        }

        User user = User.builder()
                .name(name)
                .email(email)
                .password(passwordEncoder.encode("123456"))
                .phone(phone != null ? phone : "")
                .role(User.Role.STUDENT)
                .status(User.Status.ACTIVE)
                .avatar("https://picsum.photos/seed/" + email + "/100/100")
                .build();

        userRepository.save(user);
        return toResponse(user);
    }

    @Transactional
    public UserResponse updateStudent(Long id, String name, String email, String phone) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy sinh viên với id: " + id));

        if (name != null) user.setName(name);
        if (email != null) user.setEmail(email);
        if (phone != null) user.setPhone(phone);
        userRepository.save(user);
        return toResponse(user);
    }

    @Transactional
    public String toggleLock(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy người dùng với id: " + id));

        if (user.getStatus() == User.Status.LOCKED) {
            user.setStatus(User.Status.ACTIVE);
        } else {
            user.setStatus(User.Status.LOCKED);
        }
        userRepository.save(user);

        return user.getStatus() == User.Status.LOCKED ? "Đã khóa tài khoản" : "Đã mở khóa tài khoản";
    }

    public String getStatusString(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy người dùng với id: " + id));
        return user.getStatus().name().toLowerCase();
    }

    public UserResponse toResponse(User user) {
        long coursesEnrolled = enrollmentRepository.countByUserId(user.getId());

        return UserResponse.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .avatar(user.getAvatar())
                .role(user.getRole().name().toLowerCase())
                .status(user.getStatus().name().toLowerCase())
                .joinDate(user.getJoinDate() != null ? user.getJoinDate().format(FORMATTER) : "")
                .coursesEnrolled(coursesEnrolled)
                .build();
    }
}
