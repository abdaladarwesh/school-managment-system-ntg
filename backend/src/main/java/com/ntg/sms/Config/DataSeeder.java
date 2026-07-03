package com.ntg.sms.Config;

import com.ntg.sms.Entities.*;
import com.ntg.sms.Entities.Class;
import com.ntg.sms.Repositories.*;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

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

    @Override
    public void run(String... args) throws Exception {
        Role studentAffairsRole = roleRepository.findByRoleName("STUDENT_AFFAIRS").orElseGet(
                () -> {
                    Role role = Role.builder().roleName("STUDENT_AFFAIRS").build();
                    return roleRepository.save(role);
                }
        );
        Role studentRole = roleRepository.findByRoleName("STUDENT").orElseGet(() -> {
            Role role = Role.builder()
                    .roleName("STUDENT")
                    .build();
            return roleRepository.save(role);
        });
        Role teacherRole = roleRepository.findByRoleName("TEACHER").orElseGet(() -> {
            Role role = Role.builder()
                    .roleName("TEACHER")
                    .build();
            return roleRepository.save(role);
        });

        if (userRepository.findByEmail("abdaladarwesh@gmail.com").isEmpty()) {
            User admin = User.builder()
                    .firstName("Ahmed")
                    .lastName("Ali")
                    .email("abdaladarwesh@gmail.com")
                    .address("Nasr City, Cairo")
                    .firstNameInArabic("أحمد")
                    .lastNameInArabic("علي")
                    .password(passwordEncoder.encode("123"))
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
        Grade grade10 = Grade.builder()
                .name("Grade 10")
                .build();

        Grade grade11 = Grade.builder()
                .name("Grade 11")
                .build();

        Grade grade12 = Grade.builder()
                .name("Grade 12")
                .build();

        gradeRepository.saveAll(List.of(grade10, grade11, grade12));

        Term term = Term.builder()
                .year(2026L)
                .term(1L)
                .build();

        term.setGrades(new HashSet<>(List.of(grade10, grade11, grade12)));

        grade10.setTerms(Set.of(term));
        grade11.setTerms(Set.of(term));
        grade12.setTerms(Set.of(term));

        termRepository.save(term);

        Class class1A = Class.builder()
                .name("1A")
                .capacity(20L)
                .grade(grade10)
                .build();

        Class class1B = Class.builder()
                .name("1B")
                .capacity(20L)
                .grade(grade10)
                .build();

        Class class2A = Class.builder()
                .name("2A")
                .capacity(20L)
                .grade(grade11)
                .build();

        Class class2B = Class.builder()
                .name("2B")
                .capacity(20L)
                .grade(grade11)
                .build();

        Class class3A = Class.builder()
                .name("3A")
                .capacity(20L)
                .grade(grade12)
                .build();

        Class class3B = Class.builder()
                .name("3B")
                .capacity(20L)
                .grade(grade12)
                .build();

        grade10.setClasses(Set.of(class1A, class1B));
        grade11.setClasses(Set.of(class2A, class2B));
        grade12.setClasses(Set.of(class3A, class3B));

        gradeRepository.saveAll(List.of(grade10, grade11, grade12));

        classRepository.saveAll(List.of(
                class1A, class1B,
                class2A, class2B,
                class3A, class3B
        ));

        // =======================
// Class 3A
// =======================

        createStudent(
                "Abdullah",
                "Mohammed",
                "عبدالله",
                "محمد",
                "abdullah.mohammed@example.com",
                30807151234561L,
                'M',
                LocalDate.of(2008, 7, 15),
                class3A,
                studentRole
        );

        createStudent(
                "Rodian",
                "Mohammed",
                "روديان",
                "محمد",
                "rodian.mohammed@example.com",
                30803101234562L,
                'F',
                LocalDate.of(2008, 3, 10),
                class3A,
                studentRole
        );

        createStudent(
                "Jana",
                "Ahmed",
                "جنى",
                "أحمد",
                "jana.ahmed@example.com",
                30809121234563L,
                'F',
                LocalDate.of(2008, 9, 12),
                class3A,
                studentRole
        );

        createStudent(
                "Hager",
                "Fouad",
                "هاجر",
                "فؤاد",
                "hager.fouad@example.com",
                30802221234564L,
                'F',
                LocalDate.of(2008, 2, 22),
                class3A,
                studentRole
        );

        createStudent(
                "Ahmed",
                "Samy",
                "أحمد",
                "سامي",
                "ahmed.samy@example.com",
                30805101234565L,
                'M',
                LocalDate.of(2008, 5, 10),
                class3A,
                studentRole
        );
        createStudent("Adham", "Sherif", "أدهم", "شريف",
                "adham.sherif@example.com", 30901011234001L, 'M',
                LocalDate.of(2009, 1, 1), class1A, studentRole);

        createStudent("Yahia", "Nabil", "يحيى", "نبيل",
                "yahia.nabil@example.com", 30902151234002L, 'M',
                LocalDate.of(2009, 2, 15), class1A, studentRole);

        createStudent("Laila", "Fathy", "ليلى", "فتحي",
                "laila.fathy@example.com", 30903101234003L, 'F',
                LocalDate.of(2009, 3, 10), class1A, studentRole);

        createStudent("Rahma", "Sayed", "رحمة", "سيد",
                "rahma.sayed@example.com", 30904121234004L, 'F',
                LocalDate.of(2009, 4, 12), class1A, studentRole);

        createStudent("Tarek", "Maher", "طارق", "ماهر",
                "tarek.maher@example.com", 30905181234005L, 'M',
                LocalDate.of(2009, 5, 18), class1A, studentRole);
        createStudent("Hassan", "Reda", "حسن", "رضا",
                "hassan.reda@example.com", 30906021234006L, 'M',
                LocalDate.of(2009, 6, 2), class1B, studentRole);

        createStudent("Bassant", "Ashraf", "بسنت", "أشرف",
                "bassant.ashraf@example.com", 30907111234007L, 'F',
                LocalDate.of(2009, 7, 11), class1B, studentRole);

        createStudent("Mina", "Nader", "مينا", "نادر",
                "mina.nader@example.com", 30908251234008L, 'M',
                LocalDate.of(2009, 8, 25), class1B, studentRole);

        createStudent("Nada", "Fawzy", "ندى", "فوزي",
                "nada.fawzy@example.com", 30909191234009L, 'F',
                LocalDate.of(2009, 9, 19), class1B, studentRole);

        createStudent("Sherif", "Emad", "شريف", "عماد",
                "sherif.emad@example.com", 30910231234010L, 'M',
                LocalDate.of(2009, 10, 23), class1B, studentRole);
        createStudent("Islam", "Saad", "إسلام", "سعد",
                "islam.saad@example.com", 30801141234011L, 'M',
                LocalDate.of(2008, 1, 14), class2A, studentRole);

        createStudent("Doaa", "Kamal", "دعاء", "كمال",
                "doaa.kamal@example.com", 30802211234012L, 'F',
                LocalDate.of(2008, 2, 21), class2A, studentRole);

        createStudent("Yassin", "Lotfy", "ياسين", "لطفي",
                "yassin.lotfy@example.com", 30803161234013L, 'M',
                LocalDate.of(2008, 3, 16), class2A, studentRole);

        createStudent("Nourhan", "Magdy", "نورهان", "مجدي",
                "nourhan.magdy@example.com", 30804241234014L, 'F',
                LocalDate.of(2008, 4, 24), class2A, studentRole);

        createStudent("Hossam", "Galal", "حسام", "جلال",
                "hossam.galal@example.com", 30805291234015L, 'M',
                LocalDate.of(2008, 5, 29), class2A, studentRole);
        createStudent("Belal", "Ragab", "بلال", "رجب",
                "belal.ragab@example.com", 30806111234016L, 'M',
                LocalDate.of(2008, 6, 11), class2B, studentRole);

        createStudent("Aya", "Wael", "آية", "وائل",
                "aya.wael@example.com", 30807201234017L, 'F',
                LocalDate.of(2008, 7, 20), class2B, studentRole);

        createStudent("Marwan", "Samir", "مروان", "سمير",
                "marwan.samir@example.com", 30808171234018L, 'M',
                LocalDate.of(2008, 8, 17), class2B, studentRole);

        createStudent("Shaimaa", "Atef", "شيماء", "عاطف",
                "shaimaa.atef@example.com", 30809261234019L, 'F',
                LocalDate.of(2008, 9, 26), class2B, studentRole);

        createStudent("Wael", "Shawky", "وائل", "شوقي",
                "wael.shawky@example.com", 30810151234020L, 'M',
                LocalDate.of(2008, 10, 15), class2B, studentRole);
        createStudent("Mostafa", "Ehab", "مصطفى", "إيهاب",
                "mostafa.ehab@example.com", 30701181234021L, 'M',
                LocalDate.of(2007, 1, 18), class3B, studentRole);

        createStudent("Rana", "Sherif", "رانا", "شريف",
                "rana.sherif@example.com", 30702221234022L, 'F',
                LocalDate.of(2007, 2, 22), class3B, studentRole);

        createStudent("Youssef", "Hany", "يوسف", "هاني",
                "youssef.hany@example.com", 30703141234023L, 'M',
                LocalDate.of(2007, 3, 14), class3B, studentRole);

        createStudent("Mariam", "Waheed", "مريم", "وحيد",
                "mariam.waheed@example.com", 30704261234024L, 'F',
                LocalDate.of(2007, 4, 26), class3B, studentRole);

        createStudent("Ahmed", "Essam", "أحمد", "عصام",
                "ahmed.essam@example.com", 30705191234025L, 'M',
                LocalDate.of(2007, 5, 19), class3B, studentRole);
        Teacher mathTeacher = createTeacher(
                "Mohamed",
                "Hassan",
                "mohamed.hassan@school.com",
                teacherRole,
                "B.Sc Mathematics",
                10L
        );

        Teacher physicsTeacher = createTeacher(
                "Ahmed",
                "Mahmoud",
                "ahmed.mahmoud@school.com",
                teacherRole,
                "B.Sc Physics",
                8L
        );

        Teacher englishTeacher = createTeacher(
                "Sara",
                "Ali",
                "sara.ali@school.com",
                teacherRole,
                "B.A English",
                6L
        );

        Course math = new Course();
        math.setTeacher(mathTeacher);
        math.setTerm(term);
        math.setCourseName("Mathematics");
        math.setCourseType("CORE");
        math.setDescription("Mathematics");
        math.setAssignments(null);

        Course physics = new Course();
        physics.setTeacher(physicsTeacher);
        physics.setTerm(term);
        physics.setCourseName("Physics");
        physics.setCourseType("CORE");
        physics.setDescription("Physics");
        physics.setAssignments(null);

        Course english = new Course();
        english.setTeacher(englishTeacher);
        english.setTerm(term);
        english.setCourseName("English");
        english.setCourseType("CORE");
        english.setDescription("English");
        english.setAssignments(null);

        courseRepository.saveAll(List.of(math, physics, english));

        LocalDate now = LocalDate.now();

        List<Course> monday = List.of(
                math,
                physics,
                english,
                math,
                physics,
                english,
                math
        );

        List<Course> tuesday = List.of(
                physics,
                english,
                math,
                physics,
                english,
                math,
                physics
        );

        List<Course> wednesday = List.of(
                english,
                math,
                physics,
                english,
                math,
                physics,
                english
        );

        List<Course> thursday = List.of(
                math,
                english,
                physics,
                math,
                english,
                physics,
                math
        );

        List<Course> friday = List.of(
                physics,
                math,
                english,
                physics,
                math,
                english,
                physics
        );

        List<List<Course>> week = List.of(
                monday,
                tuesday,
                wednesday,
                thursday,
                friday
        );

        List<Class> classes = List.of(
                class1A,
                class1B,
                class2A,
                class2B,
                class3A,
                class3B
        );


        List<Session> sessions = new ArrayList<>();

        for (Class clazz : classes) {

            for (int day = 0; day < week.size(); day++) {

                for (Course course : week.get(day)) {

                    Session session = new Session();
                    session.setClassField(clazz);
                    session.setCourse(course);
                    session.setDayOfWeek((long) (day + 1));
                    session.setStartAt(now);
                    session.setEndAt(now.plusMonths(4));
                    session.setUpdatedAt(now);

                    sessions.add(session);
                }
            }
        }

        sessionRepository.saveAll(sessions);
    }

    private Teacher createTeacher(
            String firstName,
            String lastName,
            String email,
            Role teacherRole,
            String education,
            Long yearsExperience
    ) {

        User user = User.builder()
                .firstName(firstName)
                .lastName(lastName)
                .firstNameInArabic(firstName)
                .lastNameInArabic(lastName)
                .email(email)
                .password(passwordEncoder.encode("123"))
                .address("Cairo")
                .nationality("Egyptian")
                .religion("Muslim")
                .gender('M')
                .birthDate(LocalDate.of(1988, 1, 1))
                .nationalNumber(System.nanoTime())
                .createdAt(LocalDateTime.now())
                .lastLogin(LocalDateTime.now())
                .isDeleted(false)
                .role(teacherRole)
                .build();

        userRepository.save(user);

        Teacher teacher = new Teacher();
        teacher.setUser(user);
        teacher.setEducation(education);
        teacher.setEmploymentHistory("NTG School");
        teacher.setNumberOfYearsOfExperience(yearsExperience);

        return teacherRepository.save(teacher);
    }

    private void createStudent(

            String firstName,
            String lastName,
            String firstNameAr,
            String lastNameAr,
            String email,
            long nationalNumber,
            char gender,
            LocalDate birthDate,
            Class studentClass,
            Role studentRole
    ) {
        User user = User.builder()
                .firstName(firstName)
                .lastName(lastName)
                .firstNameInArabic(firstNameAr)
                .lastNameInArabic(lastNameAr)
                .email(email)
                .password(passwordEncoder.encode("123"))
                .address("Cairo, Egypt")
                .nationality("Egyptian")
                .religion("Muslim")
                .gender(gender)
                .birthDate(birthDate)
                .nationalNumber(nationalNumber)
                .createdAt(LocalDateTime.now())
                .lastLogin(LocalDateTime.now())
                .isDeleted(false)
                .role(studentRole)
                .build();

        userRepository.save(user);

        Student student = Student.builder()
                .user(user)
                .studentClass(studentClass)
                .academicScoreInMiddleSchool(380L)
                .governorate("Cairo")
                .placeOfBirth("Cairo")
                .martialParentsStatus(Student.MartialParentsStatus.MARRIED)
                .build();

        studentRepository.save(student);

    }


}
