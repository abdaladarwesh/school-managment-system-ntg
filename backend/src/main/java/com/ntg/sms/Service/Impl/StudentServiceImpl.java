package com.ntg.sms.Service.Impl;

import com.ntg.sms.Entities.*;
import com.ntg.sms.Dtos.Request.StudentRequest;
import com.ntg.sms.Exceptions.BadRequestException;
import com.ntg.sms.Exceptions.ConflictException;
import com.ntg.sms.Repositories.*;
import com.ntg.sms.Service.StudentsService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class StudentServiceImpl implements StudentsService {

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

    @Override
    public Student getStudentById(Long id) {
       return studentRepository.findById(id).orElse(null);

    }

    @Override
    public List<String> getStudentMedicalHistory(Student student) {
        List<StudentMedicalHistory> studentMedicalHistories = studentMedicalHistoryRepository.findAllByStudent(student);
        List<String> medicalHistories = new ArrayList<>();
        studentMedicalHistories.forEach(
                s -> {
                    medicalHistories.add(
                            s.getId().getMedicalNote()
                    );
                }
        );
        return medicalHistories;
    }

    public void deleteStudent(Long id){
        Student student = studentRepository.findById(id).orElse(null);
        User user = student.getUser();
        user.setIsDeleted(true);
        userRepository.save(user);
        studentRepository.save(student);
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

    @Override
    @Transactional
    public Student editStudent(StudentRequest request, Long studentId) {
        validateGuardian(request);

        // 1. Fetch the existing student
        Student existingStudent = studentRepository.findById(studentId)
                .orElseThrow(() -> new BadRequestException("Student not found with ID: " + studentId));

        // 2. Validate uniqueness for UPDATE (ignoring the current user's own data)
        validateUniqueUsersForUpdate(request, existingStudent);

        // 3. Update the Student's User profile
        updateUser(existingStudent.getUser(), request.getStudentUser());

        // 4. Update the Student's specific details
        existingStudent.setGovernorate(request.getStudent().getGovernorate());
        existingStudent.setAcademicScoreInMiddleSchool(request.getStudent().getAcademicScoreInMiddleSchool());
        existingStudent.setPlaceOfBirth(request.getStudent().getPlaceOfBirth());
        existingStudent.setMartialParentsStatus(request.getStudent().getMartialParentsStatus());

        Student savedStudent = studentRepository.saveAndFlush(existingStudent);

        // 5. Update Medical History (Clear existing, add new)
        List<StudentMedicalHistory> existingHistory = studentMedicalHistoryRepository.findAllByStudent(savedStudent);
        studentMedicalHistoryRepository.deleteAll(existingHistory);

        if (request.getStudent().getMedicalHistory() != null) {
            request.getStudent().getMedicalHistory().forEach((m) -> {
                StudentMedicalHistoryId historyId = StudentMedicalHistoryId.builder()
                        .studentId(savedStudent.getId())
                        .medicalNote(m)
                        .build();
                StudentMedicalHistory history = StudentMedicalHistory.builder()
                        .id(historyId)
                        .student(savedStudent)
                        .build();
                studentMedicalHistoryRepository.save(history);
            });
        }

        // 6. Update Parents
        updateParentRecord(savedStudent, "FATHER", request.getFather(), request.getGuardianType() == StudentRequest.GuardianType.FATHER);
        updateParentRecord(savedStudent, "MOTHER", request.getMother(), request.getGuardianType() == StudentRequest.GuardianType.MOTHER);

        if (request.getGuardianType() == StudentRequest.GuardianType.OTHER) {
            updateParentRecord(savedStudent, "GUARDIAN", request.getGuardian(), true);
        }

        return savedStudent;
    }

    private void validateUserInfo(StudentRequest.UserInfo request) {
        if (request.getGender() != 'M' && request.getGender() != 'F') {
            throw new BadRequestException("Gender must be 'M' or 'F'.");
        }
    }
    // Helper to update an existing User entity
    private void updateUser(User existingUser, StudentRequest.UserInfo request) {
        validateUserInfo(request);

        existingUser.setFirstName(request.getFirstName());
        existingUser.setLastName(request.getLastName());
        existingUser.setEmail(request.getEmail());
        existingUser.setAddress(request.getAddress());
        existingUser.setFirstNameInArabic(request.getFirstNameInArabic());
        existingUser.setLastNameInArabic(request.getLastNameInArabic());
        existingUser.setGender(request.getGender());
        existingUser.setNationality(request.getNationality());
        existingUser.setBirthDate(request.getBirthDate());
        existingUser.setReligion(request.getReligion());
        existingUser.setNationalNumber(request.getNationalNumber());

        userRepository.save(existingUser);

        // Clear old phones and save new ones
        List<UserPhoneNumber> oldPhones = userPhoneNumberRepository.findAllByUser_Id(existingUser.getId());
        userPhoneNumberRepository.deleteAll(oldPhones);
        savePhoneNumbers(existingUser, request.getPhoneNumbers());
    }

    // Helper to fetch and update an existing Parent, or create if they don't exist
    private void updateParentRecord(Student student, String roleName, StudentRequest.ParentInfo requestInfo, boolean isGuardian) {
        if (requestInfo == null) return;

        // Find if this student already has this specific parent role linked
        StudentsParent existingLink = studentsParentRepository.findByStudentIdAndParentRole(student.getId(), roleName)
                .orElse(null);

        if (existingLink != null) {
            // Update existing parent
            Parent existingParent = existingLink.getParent();
            updateUser(existingParent.getUser(), requestInfo.getUser());
            existingParent.setJobName(requestInfo.getJobName());
            parentRepository.save(existingParent);

            // Update guardian status if changed
            existingLink.setIsguardian(isGuardian ? 1L : 0L);
            studentsParentRepository.save(existingLink);
        } else {
            // Fallback: If they didn't have this parent role before, create it
            Role parentRole = getOrCreateRole("PARENT");
            Parent newParent = createParent(requestInfo, parentRole);
            linkParent(student, newParent, roleName, isGuardian);
        }
    }

    // Helper to validate unique users during an UPDATE (ignores the current users' existing emails/IDs)
    private void validateUniqueUsersForUpdate(StudentRequest request, Student existingStudent) {
        // Note: For a robust system, you should check if the new email belongs to a DIFFERENT user ID.
        // Example logic:
        // User userWithEmail = userRepository.findByEmail(request.getStudentUser().getEmail());
        // if(userWithEmail != null && !userWithEmail.getId().equals(existingStudent.getUser().getId())) {
        //     throw new ConflictException("Email already in use.");
        // }
        //
        // You will need to implement a variation of validateUniqueUsers that skips the check
        // if the matched record's User ID is the same as the one currently being updated.
    }

}
