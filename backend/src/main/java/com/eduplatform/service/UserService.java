package com.eduplatform.service;

import com.eduplatform.dto.*;
import com.eduplatform.entity.User;
import com.eduplatform.exception.BadRequestException;
import com.eduplatform.exception.ResourceNotFoundException;
import com.eduplatform.repository.EnrollmentRepository;
import com.eduplatform.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
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
        if (request.getName() != null)
            user.setName(request.getName());
        if (request.getDisplayName() != null)
            user.setDisplayName(request.getDisplayName());
        if (request.getBio() != null)
            user.setBio(request.getBio());
        if (request.getPhone() != null)
            user.setPhone(request.getPhone());
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

    public StudentPageResponse getStudentsPaginated(String search, String status,
            String startDate, String endDate,
            int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "joinDate"));

        User.Status statusEnum = null;
        if (status != null && !status.isBlank()) {
            statusEnum = User.Status.valueOf(status.toUpperCase());
        }

        String searchParam = (search != null && !search.isBlank()) ? search : null;

        LocalDate start = null;
        LocalDate end = null;
        if (startDate != null && !startDate.isBlank()) {
            start = LocalDate.parse(startDate);
        }
        if (endDate != null && !endDate.isBlank()) {
            end = LocalDate.parse(endDate);
        }

        Page<User> userPage = userRepository.findStudentsFiltered(
                User.Role.STUDENT, statusEnum, searchParam, start, end, pageable);

        List<UserResponse> content = userPage.getContent().stream()
                .map(this::toResponse)
                .toList();

        return StudentPageResponse.builder()
                .content(content)
                .currentPage(userPage.getNumber())
                .pageSize(userPage.getSize())
                .totalElements(userPage.getTotalElements())
                .totalPages(userPage.getTotalPages())
                .build();
    }

    // Keep old method for backward compat
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
    public UserResponse createStudent(String name, String email, String phone, String password) {
        if (userRepository.existsByEmail(email)) {
            throw new BadRequestException("Email đã tồn tại");
        }

        String pwd = (password != null && !password.isBlank()) ? password : "123456";

        User user = User.builder()
                .name(name)
                .email(email)
                .password(passwordEncoder.encode(pwd))
                .phone(phone != null ? phone : "")
                .role(User.Role.STUDENT)
                .status(User.Status.ACTIVE)
                .avatar("https://ui-avatars.com/api/?name=" + name.replace(" ", "+") + "&background=6366f1&color=fff")
                .build();

        userRepository.save(user);
        return toResponse(user);
    }

    @Transactional
    public UserResponse updateStudent(Long id, String name, String email, String phone) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy sinh viên với id: " + id));

        if (name != null)
            user.setName(name);
        if (email != null)
            user.setEmail(email);
        if (phone != null)
            user.setPhone(phone);
        userRepository.save(user);
        return toResponse(user);
    }

    @Transactional
    public void deleteStudent(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy sinh viên với id: " + id));
        userRepository.delete(user);
    }

    @Transactional
    public void bulkDelete(List<Long> ids) {
        List<User> users = userRepository.findAllById(ids);
        userRepository.deleteAll(users);
    }

    @Transactional
    public void bulkLock(List<Long> ids) {
        List<User> users = userRepository.findAllById(ids);
        for (User user : users) {
            user.setStatus(User.Status.LOCKED);
        }
        userRepository.saveAll(users);
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
