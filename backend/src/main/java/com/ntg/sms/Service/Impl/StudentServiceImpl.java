package com.ntg.sms.Service.Impl;

import com.ntg.sms.Entities.*;
import com.ntg.sms.Dtos.Request.StudentRequest;
import com.ntg.sms.Exceptions.BadRequestException;
import com.ntg.sms.Exceptions.ConflictException;
import com.ntg.sms.Repositories.*;
import com.ntg.sms.Service.StudentsService;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.apache.commons.text.RandomStringGenerator;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.*;

@Service
@RequiredArgsConstructor
public class StudentServiceImpl implements StudentsService {

    @PersistenceContext
    private final EntityManager entityManager;
    private final StudentRepository studentRepository;
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final StudentMedicalHistoryRepository studentMedicalHistoryRepository;
    private final ParentRepository parentRepository;
    private final StudentsParentRepository studentsParentRepository;
    private final UserPhoneNumberRepository userPhoneNumberRepository;
    private final PasswordEncoder passwordEncoder;


    @Override
    public long gettotalstudents() {

        return studentRepository.count();
    }

    @Override
    public List<Student> getAllStudents() {
        return studentRepository.findAllWhereNotIsDeleted();
    }

    @Override
    @Transactional
    public Student addStudent(StudentRequest request) {
        String username = "SYSTEM"; // Fallback for DataSeeder

        var authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.isAuthenticated()) {
            username = authentication.getName();
        }

        // CALL THE BUILT-IN ORACLE REGISTER (No special privileges required!)
        entityManager.createNativeQuery("BEGIN DBMS_APPLICATION_INFO.SET_CLIENT_INFO(:user); END;")
                .setParameter("user", username)
                .executeUpdate();


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

        Parent father = getOrCreateParent(request.getFather(), parentRole);
        Parent mother = getOrCreateParent(request.getMother(), parentRole);

        linkParent(savedStudent, father, "FATHER", request.getGuardianType() == StudentRequest.GuardianType.FATHER);
        linkParent(savedStudent, mother, "MOTHER", request.getGuardianType() == StudentRequest.GuardianType.MOTHER);

        if (request.getGuardianType() == StudentRequest.GuardianType.OTHER) {
            Parent guardian = getOrCreateParent(request.getGuardian(), parentRole);
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

    private Parent getOrCreateParent(StudentRequest.ParentInfo requestInfo, Role parentRole) {
        if (requestInfo == null || requestInfo.getUser() == null) {
            return null;
        }

        StudentRequest.UserInfo userInfo = requestInfo.getUser();

        // 1. Check if Parent already exists by National Number (Recommended Primary Key for citizens)
        if (userInfo.getNationalNumber() != null) {
            User existingUser = userRepository.findByNationalNumber(userInfo.getNationalNumber()).orElse(null);
            if (existingUser != null) {
                return parentRepository.findByUserId(existingUser.getId())
                        .orElseThrow(() -> new ConflictException("User exists but is not registered as a PARENT."));
            }
        }

        // 2. Fallback: Check by Email
        if (userInfo.getEmail() != null && userRepository.existsByEmail(userInfo.getEmail())) {
            User existingUser = userRepository.findByEmail(userInfo.getEmail()).orElse(null);
            if (existingUser != null) {
                return parentRepository.findByUserId(existingUser.getId())
                        .orElseThrow(() -> new ConflictException("Email belongs to an account that is not a PARENT."));
            }
        }

        // 3. If parent does not exist at all, create them as new
        User newUser = createUser(userInfo, parentRole);

        Parent parent = new Parent();
        parent.setUser(newUser);
        parent.setJobName(requestInfo.getJobName());

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


        String username = "SYSTEM"; // Fallback for DataSeeder

        var authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.isAuthenticated()) {
            username = authentication.getName();
        }

        // CALL THE BUILT-IN ORACLE REGISTER (No special privileges required!)
        entityManager.createNativeQuery("BEGIN DBMS_APPLICATION_INFO.SET_CLIENT_INFO(:user); END;")
                .setParameter("user", username)
                .executeUpdate();

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

    @Override
    public String generatePassword(Long studentId) {
        Student student = studentRepository.findById(studentId).orElse(null);
        User user = userRepository.findById(student.getUser().getId()).orElse(null);
        SecureRandom secureRandom = new SecureRandom();
        RandomStringGenerator secureGenerator = new RandomStringGenerator.Builder()
                .withinRange('!', 'z') // Includes symbols, numbers, and uppercase/lowercase letters
                .usingRandom(secureRandom::nextInt) // Explicitly binds SecureRandom
                .get();
        String generatedPassword = secureGenerator.generate(16);
        user.setPassword(passwordEncoder.encode(generatedPassword));
        userRepository.saveAndFlush(user);
        return generatedPassword;
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
// Helper to fetch an existing Parent (or create if they don't exist) and link the relation
    private void updateParentRecord(Student student, String roleName, StudentRequest.ParentInfo requestInfo, boolean isGuardian) {
        if (requestInfo == null || requestInfo.getUser() == null) return;

        // 1. Get existing parent globally based on Email/National ID, or create a new one.
        // This does NOT overwrite their existing User profile data if they are found.
        Role parentRole = getOrCreateRole("PARENT");
        Parent targetParent = getOrCreateParent(requestInfo, parentRole);

        // 2. Find if this student already has a parent linked for this specific role
        StudentsParent existingLink = studentsParentRepository.findByStudentIdAndParentRole(student.getId(), roleName)
                .orElse(null);

        if (existingLink != null) {
            // 3. If a link exists, check if it points to the same parent
            if (!existingLink.getParent().getId().equals(targetParent.getId())) {
                // The parent has changed. Because StudentsParentId is a composite key
                // containing the parentId, we must delete the old relation and create a new one.
                studentsParentRepository.delete(existingLink);
                linkParent(student, targetParent, roleName, isGuardian);
            } else {
                // It is the same parent. Just update the guardian status if it changed.
                existingLink.setIsguardian(isGuardian ? 1L : 0L);
                studentsParentRepository.save(existingLink);
            }
        } else {
            // 4. No previous link existed for this role, create a new relation
            linkParent(student, targetParent, roleName, isGuardian);
        }
    }


    private void validateUniqueUsers(StudentRequest request) {
        Set<String> emailsInPayload = new HashSet<>();
        Set<Long> nationalNumbersInPayload = new HashSet<>();

        // 1. The Student MUST be strictly new
        validateStrictlyNewUser(request.getStudentUser(), emailsInPayload, nationalNumbersInPayload);

        // 2. For Parents, we only check for duplicates within the current request payload
        // (e.g., passing the exact same email for both Father and Mother in one request)
        validatePayloadDuplicatesOnly(request.getFather().getUser(), emailsInPayload, nationalNumbersInPayload);
        validatePayloadDuplicatesOnly(request.getMother().getUser(), emailsInPayload, nationalNumbersInPayload);

        if (request.getGuardianType() == StudentRequest.GuardianType.OTHER && request.getGuardian() != null) {
            validatePayloadDuplicatesOnly(request.getGuardian().getUser(), emailsInPayload, nationalNumbersInPayload);
        }
    }

    private void validateStrictlyNewUser(StudentRequest.UserInfo request, Set<String> emails, Set<Long> nationalNumbers) {
        validatePayloadDuplicatesOnly(request, emails, nationalNumbers);

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new ConflictException("User already exists with email: '" + request.getEmail() + "'");
        }
        if (request.getNationalNumber() != null && userRepository.existsByNationalNumber(request.getNationalNumber())) {
            throw new ConflictException("User already exists with national number: '" + request.getNationalNumber() + "'");
        }
    }

    private void validatePayloadDuplicatesOnly(StudentRequest.UserInfo request, Set<String> emails, Set<Long> nationalNumbers) {
        if (request == null) return;

        String email = request.getEmail().trim().toLowerCase();
        if (!emails.add(email)) {
            throw new ConflictException("Duplicate email submitted within the request payload: '" + request.getEmail() + "'");
        }

        if (request.getNationalNumber() != null && !nationalNumbers.add(request.getNationalNumber())) {
            throw new ConflictException("Duplicate national number submitted within the request payload: '" + request.getNationalNumber() + "'");
        }
    }


    private void validateUniqueUsersForUpdate(StudentRequest request, Student existingStudent) {
        Set<String> emailsInPayload = new HashSet<>();
        Set<Long> nationalNumbersInPayload = new HashSet<>();

        // 1. Validate Student User uniqueness against the database
        validateUserUniquenessForUpdate(
                request.getStudentUser(),
                existingStudent.getUser().getId(),
                emailsInPayload,
                nationalNumbersInPayload
        );

        // 2. For Parents, we only validate that there are no duplicate emails/IDs WITHIN the payload.
        // We DO NOT check the DB here, because we WANT to find and link existing parents in updateParentRecord.
        if (request.getFather() != null) {
            validatePayloadDuplicatesOnly(request.getFather().getUser(), emailsInPayload, nationalNumbersInPayload);
        }
        if (request.getMother() != null) {
            validatePayloadDuplicatesOnly(request.getMother().getUser(), emailsInPayload, nationalNumbersInPayload);
        }
        if (request.getGuardianType() == StudentRequest.GuardianType.OTHER && request.getGuardian() != null) {
            validatePayloadDuplicatesOnly(request.getGuardian().getUser(), emailsInPayload, nationalNumbersInPayload);
        }
    }


    private void validateUserUniquenessForUpdate(StudentRequest.UserInfo request, Long currentUserId, Set<String> emailsInPayload, Set<Long> nationalNumbersInPayload) {
        if (request == null) {
            return;
        }

        // 1. Check for duplicates submitted within the current JSON request payload
        validatePayloadDuplicatesOnly(request, emailsInPayload, nationalNumbersInPayload);

        // 2. Check Database duplicates (ensure email belongs to currentUserId if it exists in DB)
        if (request.getEmail() != null) {
            userRepository.findByEmail(request.getEmail().trim())
                    .ifPresent(existingUser -> {
                        if (!existingUser.getId().equals(currentUserId)) {
                            throw new ConflictException("Email is already in use by another account: '" + request.getEmail() + "'");
                        }
                    });
        }

        // 3. Check Database duplicates (ensure national number belongs to currentUserId if it exists in DB)
        if (request.getNationalNumber() != null) {
            userRepository.findByNationalNumber(request.getNationalNumber())
                    .ifPresent(existingUser -> {
                        if (!existingUser.getId().equals(currentUserId)) {
                            throw new ConflictException("National number is already in use by another account: '" + request.getNationalNumber() + "'");
                        }
                    });
        }
    }
}
