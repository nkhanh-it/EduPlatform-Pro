package com.example.app.dto;

import com.example.app.entity.Role;
import com.example.app.entity.User;
import com.example.app.entity.UserStatus;

import java.time.LocalDate;
import java.util.UUID;

public class UserDto {

    private UUID id;
    private String userCode;
    private String fullName;
    private String displayName;
    private String email;
    private String avatarUrl;
    private String phone;
    private Role role;
    private UserStatus status;
    private LocalDate joinDate;
    private String bio;
    private Integer coursesEnrolled;

    public static UserDto fromEntity(User user) {
        return fromEntity(user, null);
    }

    public static UserDto fromEntity(User user, Integer coursesEnrolled) {
        UserDto dto = new UserDto();
        dto.id = user.getId();
        dto.userCode = user.getUserCode();
        dto.fullName = user.getFullName();
        dto.displayName = user.getDisplayName();
        dto.email = user.getEmail();
        dto.avatarUrl = user.getAvatarUrl();
        dto.phone = user.getPhone();
        dto.role = user.getRole();
        dto.status = user.getStatus();
        dto.joinDate = user.getJoinDate();
        dto.bio = user.getBio();
        dto.coursesEnrolled = coursesEnrolled;
        return dto;
    }

    public UUID getId() {
        return id;
    }

    public String getFullName() {
        return fullName;
    }

    public String getUserCode() {
        return userCode;
    }

    public String getDisplayName() {
        return displayName;
    }

    public String getEmail() {
        return email;
    }

    public String getAvatarUrl() {
        return avatarUrl;
    }

    public String getPhone() {
        return phone;
    }

    public Role getRole() {
        return role;
    }

    public UserStatus getStatus() {
        return status;
    }

    public LocalDate getJoinDate() {
        return joinDate;
    }

    public String getBio() {
        return bio;
    }

    public Integer getCoursesEnrolled() {
        return coursesEnrolled;
    }
}
