package com.ntg.sms.Service.Impl;

import com.ntg.sms.Entities.*;
import com.ntg.sms.Entities.Dtos.Request.StudentRequest;
import com.ntg.sms.Exceptions.BadRequestException;
import com.ntg.sms.Exceptions.ConflictException;
import com.ntg.sms.Repositories.*;
import com.ntg.sms.Service.StudentsService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class StudentServiceImpl  implements StudentsService {

    private final StudentRepository studentRepository;
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final StudentMedicalHistoryRepository studentMedicalHistoryRepository;
    private final ParentRepository parentRepository;
    private final StudentsParentRepository studentsParentRepository;
    private final UserPhoneNumberRepository userPhoneNumberRepository;


    @Override
    public long gettotalstudents() {

        return studentRepository.count();
    }

    @Override
    public List<Student> getAllStudents() {
        return studentRepository.findAll();
    }

    @Override
    @Transactional
    public Student addStudent(StudentRequest request) {
        validateGuardian(request);
        validateUniqueUsers(request);

        Role studentRole = getOrCreateRole("STUDENT");
        Role parentRole = getOrCreateRole("PARENT");

        User user = createUser(request.getStudentUser(), studentRole);

        Student student = new Student();
        student.setUser(user);
        student.setGovernorate(request.getStudent().getGovernorate());
        student.setAcademicScoreInMiddleSchool(request.getStudent().getAcademicScoreInMiddleSchool());
        student.setPlaceOfBirth(request.getStudent().getPlaceOfBirth());
        student.setMartialParentsStatus(request.getStudent().getMartialParentsStatus());

        Student savedStudent = studentRepository.saveAndFlush(student);

        if (request.getStudent().getMedicalHistory() != null) {
            request.getStudent().getMedicalHistory().forEach((m) -> {
                StudentMedicalHistoryId studentMedicalHistoryId = StudentMedicalHistoryId.builder()
                        .studentId(savedStudent.getId())
                        .medicalNote(m)
                        .build();
                StudentMedicalHistory studentMedicalHistory = StudentMedicalHistory.builder()
                        .id(studentMedicalHistoryId)
                        .student(savedStudent)
                        .build();
                studentMedicalHistoryRepository.saveAndFlush(studentMedicalHistory);
            });
        }

        Parent father = createParent(request.getFather(), parentRole);
        Parent mother = createParent(request.getMother(), parentRole);

        linkParent(savedStudent, father, "FATHER", request.getGuardianType() == StudentRequest.GuardianType.FATHER);
        linkParent(savedStudent, mother, "MOTHER", request.getGuardianType() == StudentRequest.GuardianType.MOTHER);

        if (request.getGuardianType() == StudentRequest.GuardianType.OTHER) {
            Parent guardian = createParent(request.getGuardian(), parentRole);
            linkParent(savedStudent, guardian, "GUARDIAN", true);
        }

        return studentRepository.findById(savedStudent.getId())
                .orElse(savedStudent);
    }

    private Role getOrCreateRole(String roleName) {
        return roleRepository.findByRoleName(roleName)
                .orElseGet(() -> roleRepository.save(Role.builder()
                        .roleName(roleName)
                        .build()));
    }

    private User createUser(StudentRequest.UserInfo request, Role role) {
        validateUserInfo(request);

        User user = User.builder()
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .email(request.getEmail())
                .address(request.getAddress())
                .firstNameInArabic(request.getFirstNameInArabic())
                .lastNameInArabic(request.getLastNameInArabic())
                .password(null)
                .isDeleted(false)
                .createdAt(LocalDateTime.now())
                .lastLogin(null)
                .gender(request.getGender())
                .nationality(request.getNationality())
                .birthDate(request.getBirthDate())
                .religion(request.getReligion())
                .nationalNumber(request.getNationalNumber())
                .role(role)
                .build();

        User savedUser = userRepository.saveAndFlush(user);
        savePhoneNumbers(savedUser, request.getPhoneNumbers());

        return savedUser;
    }

    private Parent createParent(StudentRequest.ParentInfo request, Role parentRole) {
        User user = createUser(request.getUser(), parentRole);

        if (parentRepository.existsByUserId(user.getId())) {
            throw new ConflictException("Parent already exists for user id: '" + user.getId() + "'");
        }

        Parent parent = new Parent();
        parent.setUser(user);
        parent.setJobName(request.getJobName());

        return parentRepository.saveAndFlush(parent);
    }

    private void linkParent(Student student, Parent parent, String parentRole, boolean isGuardian) {
        StudentsParentId id = new StudentsParentId();
        id.setStudentId(student.getId());
        id.setParentId(parent.getId());

        StudentsParent studentsParent = new StudentsParent();
        studentsParent.setId(id);
        studentsParent.setStudent(student);
        studentsParent.setParent(parent);
        studentsParent.setParentRole(parentRole);
        studentsParent.setIsguardian(isGuardian ? 1L : 0L);

        studentsParentRepository.save(studentsParent);
    }

    private void savePhoneNumbers(User user, List<Long> phoneNumbers) {
        if (phoneNumbers == null || phoneNumbers.isEmpty()) {
            return;
        }

        Set<Long> uniquePhoneNumbers = new HashSet<>();

        for (Long phoneNumber : phoneNumbers) {
            if (phoneNumber == null) {
                throw new BadRequestException("Phone number cannot be null.");
            }

            if (!uniquePhoneNumbers.add(phoneNumber)) {
                throw new ConflictException("Duplicate phone number in request: '" + phoneNumber + "'");
            }

            UserPhoneNumberId id = new UserPhoneNumberId();
            id.setUserId(user.getId());
            id.setPhoneNumber(phoneNumber);

            UserPhoneNumber userPhoneNumber = new UserPhoneNumber();
            userPhoneNumber.setId(id);
            userPhoneNumber.setUser(user);

            userPhoneNumberRepository.save(userPhoneNumber);
        }
    }

    private void validateGuardian(StudentRequest request) {
        if (request.getGuardianType() == StudentRequest.GuardianType.OTHER && request.getGuardian() == null) {
            throw new BadRequestException("Guardian info is required when guardian type is OTHER.");
        }
    }

    private void validateUniqueUsers(StudentRequest request) {
        Set<String> emails = new HashSet<>();
        Set<Long> nationalNumbers = new HashSet<>();

        validateUniqueUser(request.getStudentUser(), emails, nationalNumbers);
        validateUniqueUser(request.getFather().getUser(), emails, nationalNumbers);
        validateUniqueUser(request.getMother().getUser(), emails, nationalNumbers);

        if (request.getGuardianType() == StudentRequest.GuardianType.OTHER) {
            validateUniqueUser(request.getGuardian().getUser(), emails, nationalNumbers);
        }
    }

    private void validateUniqueUser(StudentRequest.UserInfo request, Set<String> emails, Set<Long> nationalNumbers) {
        String email = request.getEmail().trim().toLowerCase();
        if (!emails.add(email)) {
            throw new ConflictException("Duplicate email in request: '" + request.getEmail() + "'");
        }

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new ConflictException("User already exists with email: '" + request.getEmail() + "'");
        }

        if (request.getNationalNumber() != null) {
            if (!nationalNumbers.add(request.getNationalNumber())) {
                throw new ConflictException("Duplicate national number in request: '" + request.getNationalNumber() + "'");
            }

            if (userRepository.existsByNationalNumber(request.getNationalNumber())) {
                throw new ConflictException("User already exists with national number: '" + request.getNationalNumber() + "'");
            }
        }
    }

    private void validateUserInfo(StudentRequest.UserInfo request) {
        if (request.getGender() != 'M' && request.getGender() != 'F') {
            throw new BadRequestException("Gender must be 'M' or 'F'.");
        }
    }

}
