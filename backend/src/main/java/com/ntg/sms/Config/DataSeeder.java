package com.ntg.sms.Config;

import com.ntg.sms.Dtos.Request.StudentRequest;
import com.ntg.sms.Entities.*;
import com.ntg.sms.Entities.Class;
import com.ntg.sms.Repositories.*;
import com.ntg.sms.Service.StudentsService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.temporal.TemporalAdjusters;
import java.util.ArrayList;
import java.util.Collection;
import java.util.HashSet;
import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private final RoleRepository roleRepository;
    private final SessionRepository sessionRepository;
    private final CourseRepository courseRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final StudentRepository studentRepository;
    private final ClassRepository classRepository;
    private final GradeRepository gradeRepository;
    private final TermRepository termRepository;
    private final TeacherRepository teacherRepository;
    private final ComplaintsRepository complaintsRepository;

    // NEW: use the real business-logic path instead of touching Student/Parent/User repos directly
    private final StudentsService studentsService;

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        log.info("Starting database seeding process...");

        // 1. Seed Roles
        Role studentAffairsRole = getOrCreateRole("STUDENT_AFFAIRS");
        Role studentRole = getOrCreateRole("STUDENT");
        Role teacherRole = getOrCreateRole("TEACHER");
        getOrCreateRole("PARENT"); // still needed by StudentsService internally

        // 2. Seed Admin User
        if (userRepository.findByEmail("abdaladarwesh@gmail.com").isEmpty()) {
            User admin = User.builder()
                    .firstName("Ahmed")
                    .lastName("Ali")
                    .email("abdaladarwesh@gmail.com")
                    .address("Nasr City, Cairo")
                    .firstNameInArabic("أحمد")
                    .lastNameInArabic("علي")
                    .password(passwordEncoder.encode("abdullah2009"))
                    .isDeleted(false)
                    .createdAt(LocalDateTime.now())
                    .lastLogin(LocalDateTime.now())
                    .gender('M')
                    .nationality("Egyptian")
                    .birthDate(LocalDate.of(2008, 5, 10))
                    .religion("Muslim")
                    .nationalNumber(30805101234567L)
                    .role(studentAffairsRole)
                    .build();
            userRepository.save(admin);
        }

        // Global Guard: If students already exist, skip re-seeding school data to prevent duplicate constraints
        if (studentRepository.count() > 0) {
            log.info("Database already seeded with student records. Skipping data seeding.");
            return;
        }

        // 3. Seed Grades & Terms
        Grade grade10 = getOrCreateGrade("Grade 10");
        Grade grade11 = getOrCreateGrade("Grade 11");
        Grade grade12 = getOrCreateGrade("Grade 12");

        Term term = termRepository.findAll().stream()
                .filter(t -> t.getYear().equals(2026L) && t.getTerm().equals(1L))
                .findFirst()
                .orElseGet(() -> termRepository.save(Term.builder().year(2026L).term(1L).build()));

        term.setGrades(new java.util.HashSet<>(List.of(grade10, grade11, grade12)));
        grade10.setTerms(new HashSet<>(List.of(term)));
        grade11.setTerms(new HashSet<>(List.of(term)));
        grade12.setTerms(new HashSet<>(List.of(term)));
        termRepository.save(term);

        // 4. Seed Classes
        Class class1A = getOrCreateClass("1A", 20L, grade10);
        Class class1B = getOrCreateClass("1B", 20L, grade10);
        Class class2A = getOrCreateClass("2A", 20L, grade11);
        Class class2B = getOrCreateClass("2B", 20L, grade11);
        Class class3A = getOrCreateClass("3A", 20L, grade12);
        Class class3B = getOrCreateClass("3B", 20L, grade12);

        grade10.setClasses(new HashSet<>(List.of(class1A, class1B)));
        grade11.setClasses(new HashSet<>(List.of(class2A, class2B)));
        grade12.setClasses(new HashSet<>(List.of(class3A, class3B)));
        gradeRepository.saveAll(List.of(grade10, grade11, grade12));

        // 5. Define families (father + mother). Passing the SAME family to multiple
        // students is what makes siblings share a parent — StudentsService's internal
        // getOrCreateParent() matches existing parents by national number / email,
        // so no manual "reuse" bookkeeping is needed here anymore.
        Family family1 = new Family(
                new ParentSeed("Mohammed", "Darwesh", "محمد", "درويش", "mohammed.parent@example.com", 27501011234501L, 'M', "Engineer", List.of(201000000001L, 201100000001L)),
                new ParentSeed("Fatima", "Ali", "فاطمة", "علي", "fatima.parent@example.com", 27802021234502L, 'F', "Doctor", List.of(201200000002L))
        );
        Family family2 = new Family(
                new ParentSeed("Ahmed", "Ibrahim", "أحمد", "إبراهيم", "ahmed.parent@example.com", 27403031234503L, 'M', "Accountant", List.of(201000000003L)),
                new ParentSeed("Mona", "Sayed", "منى", "سيد", "mona.parent@example.com", 27704041234504L, 'F', "Teacher", List.of(201200000004L))
        );
        Family family3 = new Family(
                new ParentSeed("Fouad", "Hassan", "فؤاد", "حسن", "fouad.parent@example.com", 27205051234505L, 'M', "Lawyer", List.of(201000000005L)),
                new ParentSeed("Eman", "Mahmoud", "إيمان", "محمود", "eman.parent@example.com", 27606061234506L, 'F', "Housewife", List.of(201200000006L))
        );
        Family family4 = new Family(
                new ParentSeed("Samy", "Kamal", "سامي", "كمال", "samy.parent@example.com", 27307071234507L, 'M', "Consultant", List.of(201000000007L)),
                new ParentSeed("Heba", "Mostafa", "هبة", "مصطفى", "heba.parent@example.com", 27908081234508L, 'F', "Pharmacist", List.of(201200000008L))
        );
        Family family5 = new Family(
                new ParentSeed("Sherif", "Tarek", "شريف", "طارق", "sherif.parent@example.com", 27109091234509L, 'M', "Architect", List.of(201000000009L)),
                new ParentSeed("Rania", "Adel", "رانيا", "عادل", "rania.parent@example.com", 27510101234510L, 'F', "Professor", List.of(201200000010L))
        );

        // 6. Seed Students through StudentsService.addStudent(...)
        // SIBLINGS: Abdullah & Rodian share family1
        seedStudent("Abdullah", "Mohammed", "عبدالله", "محمد", "abdullah.mohammed@example.com", 30807151234561L, 'M', LocalDate.of(2008, 7, 15), class3A, family1);
        seedStudent("Rodian", "Mohammed", "روديان", "محمد", "rodian.mohammed@example.com", 30803101234562L, 'F', LocalDate.of(2008, 3, 10), class3A, family1);

        seedStudent("Jana", "Ahmed", "جنى", "أحمد", "jana.ahmed@example.com", 30809121234563L, 'F', LocalDate.of(2008, 9, 12), class3A, family2);
        seedStudent("Hager", "Fouad", "هاجر", "فؤاد", "hager.fouad@example.com", 30802221234564L, 'F', LocalDate.of(2008, 2, 22), class3A, family3);
        seedStudent("Ahmed", "Samy", "أحمد", "سامي", "ahmed.samy@example.com", 30805101234565L, 'M', LocalDate.of(2008, 5, 10), class3A, family4);

        // SIBLINGS: Adham (Class 1A) & Rana (Class 3B) share family5
        seedStudent("Adham", "Sherif", "أدهم", "شريف", "adham.sherif@example.com", 30901011234001L, 'M', LocalDate.of(2009, 1, 1), class1A, family5);
        seedStudent("Rana", "Sherif", "رانا", "شريف", "rana.sherif@example.com", 30702221234022L, 'F', LocalDate.of(2007, 2, 22), class3B, family5);

        seedStudent("Yahia", "Nabil", "يحيى", "نبيل", "yahia.nabil@example.com", 30902151234002L, 'M', LocalDate.of(2009, 2, 15), class1A, family2);
        seedStudent("Laila", "Fathy", "ليلى", "فتحي", "laila.fathy@example.com", 30903101234003L, 'F', LocalDate.of(2009, 3, 10), class1A, family3);
        seedStudent("Rahma", "Sayed", "رحمة", "سيد", "rahma.sayed@example.com", 30904121234004L, 'F', LocalDate.of(2009, 4, 12), class1A, family4);
        seedStudent("Tarek", "Maher", "طارق", "ماهر", "tarek.maher@example.com", 30905181234005L, 'M', LocalDate.of(2009, 5, 18), class1A, family1);

        seedStudent("Hassan", "Reda", "حسن", "رضا", "hassan.reda@example.com", 30906021234006L, 'M', LocalDate.of(2009, 6, 2), class1B, family2);
        seedStudent("Bassant", "Ashraf", "بسنت", "أشرف", "bassant.ashraf@example.com", 30907111234007L, 'F', LocalDate.of(2009, 7, 11), class1B, family3);
        seedStudent("Mina", "Nader", "مينا", "نادر", "mina.nader@example.com", 30908251234008L, 'M', LocalDate.of(2009, 8, 25), class1B, family4);
        seedStudent("Nada", "Fawzy", "ندى", "فوزي", "nada.fawzy@example.com", 30909191234009L, 'F', LocalDate.of(2009, 9, 19), class1B, family1);
        seedStudent("Sherif", "Emad", "شريف", "عماد", "sherif.emad@example.com", 30910231234010L, 'M', LocalDate.of(2009, 10, 23), class1B, family5);

        seedStudent("Islam", "Saad", "إسلام", "سعد", "islam.saad@example.com", 30801141234011L, 'M', LocalDate.of(2008, 1, 14), class2A, family2);
        seedStudent("Doaa", "Kamal", "دعاء", "كمال", "doaa.kamal@example.com", 30802211234012L, 'F', LocalDate.of(2008, 2, 21), class2A, family3);
        seedStudent("Yassin", "Lotfy", "ياسين", "لطفي", "yassin.lotfy@example.com", 30803161234013L, 'M', LocalDate.of(2008, 3, 16), class2A, family4);
        seedStudent("Nourhan", "Magdy", "نورهان", "مجدي", "nourhan.magdy@example.com", 30804241234014L, 'F', LocalDate.of(2008, 4, 24), class2A, family1);
        seedStudent("Hossam", "Galal", "حسام", "جلال", "hossam.galal@example.com", 30805291234015L, 'M', LocalDate.of(2008, 5, 29), class2A, family5);

        seedStudent("Belal", "Ragab", "بلال", "رجب", "belal.ragab@example.com", 30806111234016L, 'M', LocalDate.of(2008, 6, 11), class2B, family2);
        seedStudent("Aya", "Wael", "آية", "وائل", "aya.wael@example.com", 30807201234017L, 'F', LocalDate.of(2008, 7, 20), class2B, family3);
        seedStudent("Marwan", "Samir", "مروان", "سمير", "marwan.samir@example.com", 30808171234018L, 'M', LocalDate.of(2008, 8, 17), class2B, family4);
        seedStudent("Shaimaa", "Atef", "شيماء", "عاطف", "shaimaa.atef@example.com", 30809261234019L, 'F', LocalDate.of(2008, 9, 26), class2B, family1);
        seedStudent("Wael", "Shawky", "وائل", "شوقي", "wael.shawky@example.com", 30810151234020L, 'M', LocalDate.of(2008, 10, 15), class2B, family5);

        seedStudent("Mostafa", "Ehab", "مصطفى", "إيهاب", "mostafa.ehab@example.com", 30701181234021L, 'M', LocalDate.of(2007, 1, 18), class3B, family2);
        seedStudent("Youssef", "Hany", "يوسف", "هاني", "youssef.hany@example.com", 30703141234023L, 'M', LocalDate.of(2007, 3, 14), class3B, family4);
        seedStudent("Mariam", "Waheed", "مريم", "وحيد", "mariam.waheed@example.com", 30704261234024L, 'F', LocalDate.of(2007, 4, 26), class3B, family3);
        seedStudent("Ahmed", "Essam", "أحمد", "عصام", "ahmed.essam@example.com", 30705191234025L, 'M', LocalDate.of(2007, 5, 19), class3B, family1);

        // 7. Seed Teachers & Courses (unchanged — no TeachersService equivalent yet)
        Teacher mathTeacher = getOrCreateTeacher("Mohamed", "Hassan", "mohamed.hassan@school.com", 28801011234501L, teacherRole, "B.Sc Mathematics", 10L);
        Teacher physicsTeacher = getOrCreateTeacher("Ahmed", "Mahmoud", "ahmed.mahmoud@school.com", 28802021234502L, teacherRole, "B.Sc Physics", 8L);
        Teacher englishTeacher = getOrCreateTeacher("Sara", "Ali", "sara.ali@school.com", 28803031234503L, teacherRole, "B.A English", 6L);

        Course math = getOrCreateCourse("Mathematics", "CORE", "Mathematics", mathTeacher, term);
        Course physics = getOrCreateCourse("Physics", "CORE", "Physics", physicsTeacher, term);
        Course english = getOrCreateCourse("English", "CORE", "English", englishTeacher, term);

        // 8. Seed Class Sessions (Guarded against duplication)
        if (sessionRepository.count() == 0) {
            List<Class> classes = List.of(class1A, class1B, class2A, class2B, class3A, class3B);
            seedSessions(classes, math, physics, english);
        }

        log.info("Database seeding successfully finished.");
    }

    // ==========================================
    // Student/Parent seeding — now delegates to StudentsService.addStudent(...)
    // ==========================================

    /**
     * Small holder for a father/mother pair. Passing the same Family instance to
     * multiple seedStudent(...) calls is enough to make them siblings: the
     * StudentsService looks up parents by national number / email and reuses the
     * existing Parent record instead of creating a duplicate.
     */
    private record Family(ParentSeed father, ParentSeed mother) {}

    private record ParentSeed(String firstName, String lastName, String firstNameAr, String lastNameAr,
                              String email, long nationalNumber, char gender, String jobName,
                              List<Long> phoneNumbers) {}

    private void seedStudent(String firstName, String lastName, String firstNameAr, String lastNameAr,
                             String email, long nationalNumber, char gender, LocalDate birthDate,
                             Class studentClass, Family family) {

        // Guard: run() already short-circuits on studentRepository.count() > 0,
        // but this keeps seedStudent safe to call defensively / re-run in dev.
        if (userRepository.existsByEmail(email)) {
            log.info("Student '{}' already exists, skipping.", email);
            return;
        }

        StudentRequest request = new StudentRequest();

        request.setStudentUser(buildUserInfo(firstName, lastName, firstNameAr, lastNameAr, email,
                nationalNumber, gender, birthDate, "Cairo, Egypt", null));

        // NOTE: assumed nested type name — verify against your actual StudentRequest DTO.
        StudentRequest.StudentInfo studentInfo = new StudentRequest.StudentInfo();
        studentInfo.setGovernorate("Cairo");
        studentInfo.setPlaceOfBirth("Cairo");
        studentInfo.setAcademicScoreInMiddleSchool(380L);
        studentInfo.setMartialParentsStatus(Student.MartialParentsStatus.MARRIED);
        request.setStudent(studentInfo);

        request.setFather(buildParentInfo(family.father()));
        request.setMother(buildParentInfo(family.mother()));
        request.setGuardianType(StudentRequest.GuardianType.FATHER); // assumption: father is default guardian

        Student saved = studentsService.addStudent(request);

        // addStudent() doesn't assign a class, so do it here and persist.
        saved.setStudentClass(studentClass);
        studentRepository.save(saved);

        // Create one sample complaint the first time we seed a student, same as before.
        if (complaintsRepository.count() == 0) {
            Complaints complaint = Complaints.builder()
                    .user(saved.getUser())
                    .title("Initial Sample Complaint")
                    .description("System verification complaint entry.")
                    .status("Pending")
                    .category("General")
                    .response(null)
                    .submittedAt(LocalDateTime.now())
                    .build();
            complaintsRepository.save(complaint);
        }
    }

    private StudentRequest.UserInfo buildUserInfo(String firstName, String lastName, String firstNameAr,
                                                  String lastNameAr, String email, long nationalNumber,
                                                  char gender, LocalDate birthDate, String address,
                                                  List<Long> phoneNumbers) {
        StudentRequest.UserInfo userInfo = new StudentRequest.UserInfo();
        userInfo.setFirstName(firstName);
        userInfo.setLastName(lastName);
        userInfo.setFirstNameInArabic(firstNameAr);
        userInfo.setLastNameInArabic(lastNameAr);
        userInfo.setEmail(email);
        userInfo.setAddress(address);
        userInfo.setGender(gender);
        userInfo.setNationality("Egyptian");
        userInfo.setBirthDate(birthDate);
        userInfo.setReligion("Muslim");
        userInfo.setNationalNumber(nationalNumber);
        userInfo.setPhoneNumbers(phoneNumbers);
        return userInfo;
    }

    private StudentRequest.ParentInfo buildParentInfo(ParentSeed seed) {
        StudentRequest.ParentInfo parentInfo = new StudentRequest.ParentInfo();
        parentInfo.setUser(buildUserInfo(seed.firstName(), seed.lastName(), seed.firstNameAr(), seed.lastNameAr(),
                seed.email(), seed.nationalNumber(), seed.gender(), LocalDate.of(1978, 1, 1),
                "Cairo, Egypt", seed.phoneNumbers()));
        parentInfo.setJobName(seed.jobName());
        parentInfo.setEducationLevel(EducationLevel.ABOVE_INTERMEDIATE);
        return parentInfo;
    }

    // ==========================================
    // Helper Methods with Find-Or-Create Guarding (unchanged: roles/grades/classes/teachers/courses)
    // ==========================================

    private Role getOrCreateRole(String roleName) {
        return roleRepository.findByRoleName(roleName)
                .orElseGet(() -> roleRepository.save(Role.builder().roleName(roleName).build()));
    }

    private Grade getOrCreateGrade(String name) {
        return gradeRepository.findAll().stream()
                .filter(g -> g.getName().equalsIgnoreCase(name))
                .findFirst()
                .orElseGet(() -> gradeRepository.save(Grade.builder().name(name).build()));
    }

    private Class getOrCreateClass(String name, Long capacity, Grade grade) {
        return classRepository.findAll().stream()
                .filter(c -> c.getName().equalsIgnoreCase(name) && c.getGrade().equals(grade))
                .findFirst()
                .orElseGet(() -> classRepository.save(Class.builder().name(name).capacity(capacity).grade(grade).build()));
    }

    private Teacher getOrCreateTeacher(String firstName, String lastName, String email, long nationalNumber,
                                       Role teacherRole, String education, Long yearsExperience) {
        User user = userRepository.findByEmail(email).orElse(null);
        if (user == null) {
            user = User.builder()
                    .firstName(firstName)
                    .lastName(lastName)
                    .firstNameInArabic(firstName)
                    .lastNameInArabic(lastName)
                    .email(email)
                    .password(passwordEncoder.encode("123"))
                    .address("Cairo, Egypt")
                    .nationality("Egyptian")
                    .religion("Muslim")
                    .gender('M')
                    .birthDate(LocalDate.of(1988, 1, 1))
                    .nationalNumber(nationalNumber)
                    .createdAt(LocalDateTime.now())
                    .lastLogin(LocalDateTime.now())
                    .isDeleted(false)
                    .role(teacherRole)
                    .build();
            user = userRepository.save(user);
        }

        Long userId = user.getId();
        return teacherRepository.findAll().stream()
                .filter(t -> t.getUser().getId().equals(userId))
                .findFirst()
                .orElseGet(() -> {
                    Teacher teacher = new Teacher();
                    teacher.setUser(userRepository.findById(userId).orElseThrow());
                    teacher.setEducation(education);
                    teacher.setEmploymentHistory("NTG School");
                    teacher.setNumberOfYearsOfExperience(yearsExperience);
                    return teacherRepository.save(teacher);
                });
    }

    private Course getOrCreateCourse(String courseName, String courseType, String description, Teacher teacher, Term term) {
        return courseRepository.findAll().stream()
                .filter(c -> c.getCourseName().equalsIgnoreCase(courseName) && c.getTerm().equals(term))
                .findFirst()
                .orElseGet(() -> {
                    Course course = new Course();
                    course.setCourseName(courseName);
                    course.setCourseType(courseType);
                    course.setDescription(description);
                    course.setTeacher(teacher);
                    course.setTerm(term);
                    return courseRepository.save(course);
                });
    }

    private void seedSessions(List<Class> classes, Course math, Course physics, Course english) {

        List<Course> sunday = List.of(math, physics, english, math, physics, english, math);
        List<Course> monday = List.of(physics, english, math, physics, english, math, physics);
        List<Course> tuesday = List.of(english, math, physics, english, math, physics, english);
        List<Course> wednesday = List.of(math, english, physics, math, english, physics, math);
        List<Course> thursday = List.of(physics, math, english, physics, math, english, physics);

        List<List<Course>> week = List.of(
                sunday,
                monday,
                tuesday,
                wednesday,
                thursday
        );

        LocalDate sundayDate = LocalDate.now()
                .with(TemporalAdjusters.previousOrSame(DayOfWeek.SUNDAY));

        List<Session> sessions = new ArrayList<>();

        for (Class clazz : classes) {
            for (int day = 0; day < week.size(); day++) {

                List<Course> dailyCourses = week.get(day);
                LocalDate sessionDate = sundayDate.plusDays(day);

                LocalTime slotStart = LocalTime.of(8, 0);

                for (Course course : dailyCourses) {

                    Session session = new Session();
                    session.setClassField(clazz);
                    session.setCourse(course);
                    session.setDayOfWeek((long) sessionDate.getDayOfWeek().getValue());

                    session.setStartAt(LocalDateTime.of(sessionDate, slotStart));
                    session.setEndAt(LocalDateTime.of(sessionDate, slotStart.plusMinutes(90)));
                    session.setUpdatedAt(sessionDate);

                    sessions.add(session);

                    slotStart = slotStart.plusMinutes(90);
                }
            }
        }

        sessionRepository.saveAll(sessions);
    }
}