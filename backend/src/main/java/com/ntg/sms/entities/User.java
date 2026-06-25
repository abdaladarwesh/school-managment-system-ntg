package com.ntg.sms.entities;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

import java.time.LocalDate;

@Getter
@Setter
@Entity
@Table(name = "USERS")
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE)
    @Column(name = "USER_ID", nullable = false)
    private Long id;

    @Size(max = 150)
    @NotNull
    @Column(name = "FIRST_NAME", nullable = false, length = 150)
    private String firstName;

    @Size(max = 150)
    @NotNull
    @Column(name = "LAST_NAME", nullable = false, length = 150)
    private String lastName;

    @Size(max = 150)
    @NotNull
    @Column(name = "EMAIL", nullable = false, length = 150)
    private String email;

    @Size(max = 150)
    @Column(name = "ADDRESS", length = 150)
    private String address;

    @Size(max = 150)
    @Column(name = "FIRST_NAME_IN_ARABIC", length = 150)
    private String firstNameInArabic;

    @Size(max = 150)
    @Column(name = "LAST_NAME_IN_ARABIC", length = 150)
    private String lastNameInArabic;

    @Size(max = 150)
    @NotNull
    @Column(name = "PASSWORD", nullable = false, length = 150)
    private String password;

    @Column(name = "ISDELETED")
    private Boolean isdeleted;

    @Size(max = 50)
    @Column(name = "CREATED_AT", length = 50)
    private String createdAt;

    @Column(name = "LAST_LOGIN")
    private LocalDate lastLogin;

    @Column(name = "GENDER")
    private Character gender;

    @Size(max = 100)
    @Column(name = "NATIONALITY", length = 100)
    private String nationality;

    @Column(name = "BIRTH_DATE")
    private LocalDate birthDate;

    @Size(max = 90)
    @Column(name = "RELIGION", length = 90)
    private String religion;

    @Column(name = "NATIONAL_NUMBER")
    private Long nationalNumber;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @OnDelete(action = OnDeleteAction.RESTRICT)
    @JoinColumn(name = "ROLE_ID", nullable = false)
    private Role role;


}