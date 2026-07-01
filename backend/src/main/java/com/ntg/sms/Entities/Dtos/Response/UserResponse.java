package com.ntg.sms.Entities.Dtos.Response;

import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

/**
 * DTO for {@link com.ntg.sms.Entities.User}
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class UserResponse {
    Long id;
    @NotNull
    String firstName;
    @NotNull
    String lastName;
    @NotNull
    String email;
    String address;
    String firstNameInArabic;
    String lastNameInArabic;
    Boolean isDeleted;
    LocalDateTime createdAt;
    LocalDateTime lastLogin;
    Character gender;
    String nationality;
    LocalDate birthDate;
    String religion;
    Long nationalNumber;
    List<Long> phoneNumbers;
}