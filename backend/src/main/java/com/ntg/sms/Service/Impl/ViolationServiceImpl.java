package com.ntg.sms.Service.Impl;

import com.ntg.sms.Dtos.Request.ViolationRequest;
import com.ntg.sms.Entities.Student;
import com.ntg.sms.Entities.Violation;
import com.ntg.sms.Repositories.StudentRepository;
import com.ntg.sms.Repositories.ViolationRepository;
import com.ntg.sms.Service.ViolationService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.format.TextStyle;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ViolationServiceImpl implements ViolationService {

    private final ViolationRepository violationRepository;
    private final StudentRepository studentRepository;

    @Override
    public long gettotalviolations() {
        return violationRepository.count();
    }

    @Override
    public List<Object[]> getViolationsByMonth(int months) {
        LocalDate to   = LocalDate.now();
        LocalDate from = to.minusMonths(months - 1L).withDayOfMonth(1);
        List<Object[]> raw = violationRepository.countByMonth(from, to);

        // Build a lookup: monthNumber -> count
        Map<Integer, Long> monthCountMap = raw.stream()
                .collect(Collectors.toMap(
                        r -> ((Number) r[0]).intValue(),
                        r -> ((Number) r[1]).longValue()
                ));

        // Fill all months (including those with 0 violations)
        List<Object[]> result = new ArrayList<>();
        for (int i = months - 1; i >= 0; i--) {
            LocalDate month     = to.minusMonths(i).withDayOfMonth(1);
            int       monthNum  = month.getMonthValue();
            long      count     = monthCountMap.getOrDefault(monthNum, 0L);
            result.add(new Object[]{monthNum, count});
        }
        return result;
    }

    @Override
    public List<String> getViolationMonthLabels(int months) {
        List<String> labels = new ArrayList<>();
        LocalDate to = LocalDate.now();
        for (int i = months - 1; i >= 0; i--) {
            LocalDate month = to.minusMonths(i);
            labels.add(month.getMonth().getDisplayName(TextStyle.SHORT, Locale.ENGLISH)
                    + " '" + String.format("%02d", month.getYear() % 100));
        }
        return labels;
    }

    @Override
    public List<Violation> getAllViolations() {
       return violationRepository.findAll() ;
    }

    @Override
    public Violation createViolation(ViolationRequest request) {
        Student student = studentRepository.findById(request.getStudentId()).orElse(null);
        Violation violation = Violation.builder()
                .student(student)
                .violation(request.getViolation())
                .nameOfViolator(request.getNameOfViolator())
                .applicableProcedure(request.getApplicableProcedure())
                .referringAuthority(request.getReferringAuthority())
                .ismeeting(request.getIsmeeting())
                .notes(request.getNotes())
                .date(LocalDate.now())
                .build();
        return violationRepository.save(violation);
    }
}
