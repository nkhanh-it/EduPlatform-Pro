package com.eduplatform.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;

@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String password;

    private String phone;

    private String avatar;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private Role role;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private Status status;

    private LocalDate joinDate;

    private String bio;

    private String displayName;

    public enum Role {
        STUDENT, ADMIN
    }

    public enum Status {
        ACTIVE, INACTIVE, PENDING, LOCKED
    }

    @PrePersist
    protected void onCreate() {
        if (joinDate == null) {
            joinDate = LocalDate.now();
        }
        if (status == null) {
            status = Status.ACTIVE;
        }
    }
}
