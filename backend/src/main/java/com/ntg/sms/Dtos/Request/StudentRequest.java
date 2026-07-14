package com.ntg.sms.Dtos.Request;

import com.ntg.sms.Entities.EducationLevel;
import com.ntg.sms.Entities.Student;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class StudentRequest {

    @Valid
    @NotNull(message = "Student user info is required!")
    private UserInfo studentUser;

    @Valid
    @NotNull(message = "Student info is required!")
    private StudentInfo student;

    @Valid
    @NotNull(message = "Father info is required!")
    private ParentInfo father;

    @Valid
    @NotNull(message = "Mother info is required!")
    private ParentInfo mother;

    @NotNull(message = "Guardian type is required!")
    private GuardianType guardianType;

    @Valid
    private ParentInfo guardian;

    public enum GuardianType {
        FATHER,
        MOTHER,
        OTHER
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    @Builder
    public static class UserInfo {

        @NotBlank(message = "First name is required!")
        @Size(max = 150, message = "First name must not exceed 150 characters!")
        private String firstName;

        @NotBlank(message = "Last name is required!")
        @Size(max = 150, message = "Last name must not exceed 150 characters!")
        private String lastName;

        @NotBlank(message = "Email is required!")
        @Email(message = "Email must be valid!")
        @Size(max = 150, message = "Email must not exceed 150 characters!")
        private String email;

        @Size(max = 150, message = "Address must not exceed 150 characters!")
        private String address;

        @Size(max = 150, message = "First name in Arabic must not exceed 150 characters!")
        private String firstNameInArabic;

        @Size(max = 150, message = "Last name in Arabic must not exceed 150 characters!")
        private String lastNameInArabic;

        @NotNull(message = "Gender is required!")
        private Character gender;

        @Size(max = 100, message = "Nationality must not exceed 100 characters!")
        private String nationality;

        private LocalDate birthDate;

        @Size(max = 90, message = "Religion must not exceed 90 characters!")
        private String religion;

        private Long nationalNumber;

        private List<Long> phoneNumbers;

    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    @Builder
    public static class StudentInfo {

        @Size(max = 40, message = "Governorate must not exceed 40 characters!")
        private String governorate;

        private Long academicScoreInMiddleSchool;

        @Size(max = 90, message = "Place of birth must not exceed 90 characters!")
        private String placeOfBirth;

        private List<String> medicalHistory;


        @NotNull(message = "MartialParentsStatus is Required!")
        private Student.MartialParentsStatus martialParentsStatus;

        private Long ClassId;
    }


    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    @Builder
    public static class ParentInfo {

        @Valid
        @NotNull(message = "Parent user info is required!")
        private UserInfo user;

        @Size(max = 60, message = "Job name must not exceed 60 characters!")
        private String jobName;

        private EducationLevel educationLevel;
    }
}

