package com.eduplatform.controller;

import com.eduplatform.dto.ChangePasswordRequest;
import com.eduplatform.dto.UpdateProfileRequest;
import com.eduplatform.dto.UserResponse;
import com.eduplatform.entity.User;
import com.eduplatform.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/user")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping("/profile")
    public ResponseEntity<UserResponse> getProfile(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(userService.getProfile(user));
    }

    @PutMapping("/profile")
    public ResponseEntity<Map<String, String>> updateProfile(@AuthenticationPrincipal User user,
                                                              @RequestBody UpdateProfileRequest request) {
        userService.updateProfile(user, request);
        return ResponseEntity.ok(Map.of("message", "Cập nhật thông tin thành công"));
    }

    @PutMapping("/password")
    public ResponseEntity<Map<String, String>> changePassword(@AuthenticationPrincipal User user,
                                                               @RequestBody ChangePasswordRequest request) {
        userService.changePassword(user, request);
        return ResponseEntity.ok(Map.of("message", "Đổi mật khẩu thành công"));
    }
}
