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
import java.util.List;
import java.util.Set;

@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private final RoleRepository roleRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final StudentRepository studentRepository;
    private final ClassRepository classRepository;
    private final GradeRepository gradeRepository;
    private final TermRepository termRepository;

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

        if (userRepository.findByFirstName("Abdullah").isEmpty()) {
            User admin = User.builder()
//                    .firstName("Abdullah")
//                    .lastName("Mohammed")
//                    .email("abdaladarwesh@gmail.com")
//                    .address("20 , Cairo , Egypt")
//                    .firstNameInArabic("عبدالله")
//                    .lastNameInArabic("محمد")
//                    .password(passwordEncoder.encode("123"))
//                    .isDeleted(false)
//                    .createdAt(LocalDateTime.now())
//                    .lastLogin(LocalDateTime.now())
//                    .gender('M')
//                    .nationality("Egyption")
//                    .birthDate(LocalDate.now())
//                    .religion("muslim")
//                    .nationalNumber(30911150101074L)
                    .firstName("Ahmed")
                    .lastName("Ali")
                    .email("ahmed@student.com")
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

//        if (userRepository.findByFirstName("Ahmed").isEmpty()) {
//
//            User studentUser = User.builder()
//                    .firstName("Ahmed")
//                    .lastName("Ali")
//                    .email("ahmed@student.com")
//                    .address("Nasr City, Cairo")
//                    .firstNameInArabic("أحمد")
//                    .lastNameInArabic("علي")
//                    .password(passwordEncoder.encode("123"))
//                    .isDeleted(false)
//                    .createdAt(LocalDateTime.now())
//                    .lastLogin(LocalDateTime.now())
//                    .gender('M')
//                    .nationality("Egyptian")
//                    .birthDate(LocalDate.of(2008, 5, 10))
//                    .religion("Muslim")
//                    .nationalNumber(30805101234567L)
//                    .role(studentRole)
//                    .build();
//
//            studentUser = userRepository.save(studentUser);
//            Grade grade = Grade.builder()
//                    .name("Grade 11")
//                    .build();
//            gradeRepository.save(grade);
//
//            Class studentClass = Class.builder()
//                    .name("1A")
//                    .capacity(20L)
//                    .grade(grade)
//                    .build();
//            grade.setClasses(Set.of(studentClass));
//
//            Term term = Term.builder()
//                    .year(2026L)
//                    .term(1L)
//                    .grades(Set.of(grade)).build();
//
//            grade.setTerms(Set.of(term));
//            termRepository.save(term);
//            gradeRepository.save(grade);
//            classRepository.save(studentClass);
//
//
//
//            Student student = new Student();
//            student.setUser(studentUser);
//            student.setGovernorate("Cairo");
//            student.setAcademicScoreInMiddleSchool(285L);
//            student.setPlaceOfBirth("Cairo");
//            student.setStudentClass(studentClass);
//            student.setMartialParentsStatus(Student.MartialParentsStatus.MARRIED);
//
//            // Optional if you've already seeded classes
//            // student.setStudentClass(classRepository.findById(1L).orElseThrow());
//
//            studentRepository.save(student);
//        }
    }


}
