package com.ntg.sms.Service.Impl;

import com.ntg.sms.Dtos.Request.AttendanceEntryRequest;
import com.ntg.sms.Dtos.Request.SaveAttendanceRequest;
import com.ntg.sms.Dtos.Response.*;
import com.ntg.sms.Entities.*;
import com.ntg.sms.Entities.Class;
import com.ntg.sms.Exceptions.ResourceNotFoundException;
import com.ntg.sms.Repositories.AttendanceRepository;
import com.ntg.sms.Repositories.ClassRepository;
import com.ntg.sms.Repositories.SessionRepository;
import com.ntg.sms.Repositories.StudentRepository;
import com.ntg.sms.Service.AttendanceService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.TextStyle;
import java.time.temporal.TemporalAdjusters;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AttendanceServiceImpl implements AttendanceService {

    private final AttendanceRepository attendanceRepository;
    private final ClassRepository classRepository;
    private final StudentRepository studentRepository;
    private final SessionRepository sessionRepository;

    @Override
    public Double getTodayAttendance() {
        LocalDate today = LocalDate.now();
        LocalDateTime start = today.atStartOfDay();
        LocalDateTime end = today.plusDays(1).atStartOfDay();
        return (double) attendanceRepository.countByDateBetween(start, end);
    }

    @Override
    @Transactional(readOnly = true)
    public StudentHistoryResponse getStudentHistory(Long studentId, LocalDate date) {
        // 1. Verify student exists
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found with id: " + studentId));

        // 2. Fetch all historical attendance rows for this student
        List<Attendance> records = attendanceRepository.findByStudentId(studentId);

        // 3. Group session records by their LocalDate execution day
        Map<LocalDate, List<Attendance>> recordsByDate = records.stream()
                .filter(a -> a.getDateTime() != null)
                .collect(Collectors.groupingBy(a -> a.getDateTime().toLocalDate()));

        int presentDays = 0;
        int absentDays = 0;
        int lateDays = 0;
        int excusedDays = 0;

        List<StudentHistoryDay> historyDays = new ArrayList<>();

        // 4. Collapse multi-session days into unified daily statuses
        for (Map.Entry<LocalDate, List<Attendance>> entry : recordsByDate.entrySet()) {
            LocalDate day = entry.getKey();
            List<Attendance> dayRecords = entry.getValue();

            List<Character> statuses = dayRecords.stream()
                    .map(Attendance::getStatus)
                    .filter(Objects::nonNull)
                    .collect(Collectors.toList());

            if (statuses.isEmpty()) {
                continue; // Skip days with no recorded data
            }

            String consolidatedStatus;
            if (statuses.contains('P')) {
                consolidatedStatus = "P";
                presentDays++;
            } else if (statuses.contains('L')) {
                consolidatedStatus = "L";
                lateDays++;
            } else if (statuses.stream().allMatch(s -> s == 'E')) {
                consolidatedStatus = "E";
                excusedDays++;
            } else {
                consolidatedStatus = "A";
                absentDays++;
            }

            historyDays.add(StudentHistoryDay.builder()
                    .date(day)
                    .status(consolidatedStatus)
                    .build());
        }

        // 5. Sort chronologically for the calendar layout alignment
        historyDays.sort(Comparator.comparing(StudentHistoryDay::getDate));

        int totalDays = presentDays + absentDays + lateDays + excusedDays;
        double rate = totalDays == 0 ? 0.0 : Math.round(((double) presentDays / totalDays) * 100.0);

        return StudentHistoryResponse.builder()
                .attendanceRate(rate)
                .recordedDays((long) totalDays)
                .stats(StudentHistoryResponse.Stats.builder()
                        .present(presentDays)
                        .absent(absentDays)
                        .late(lateDays)
                        .excused(excusedDays)
                        .build())
                .historyDays(historyDays)
                .build();
    }

    @Override
    public Long getTodayAbsenceCount() {

        LocalDate today = LocalDate.now();
        LocalDateTime start = today.atStartOfDay();
        LocalDateTime end = today.plusDays(1).atStartOfDay();
        return attendanceRepository.countAbsenceByDateBetween(start, end);
    }

    @Override
    public List<Long> getWeeklyAttendanceCounts(int weeks) {
        List<Long> result = new ArrayList<>();
        // find the start of the current week (Monday)
        LocalDate weekStart = LocalDate.now().with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));
        // walk backwards from the oldest week to the current one
        LocalDate firstWeekStart = weekStart.minusWeeks(weeks - 1);
        for (int i = 0; i < weeks; i++) {
            LocalDate wStart = firstWeekStart.plusWeeks(i);
            LocalDate wEnd = wStart.plusWeeks(1);
            long count = attendanceRepository.countByWeek(
                    wStart.atStartOfDay(),
                    wEnd.atStartOfDay()
            );
            result.add(count);
        }
        return result;
    }

    @Override
    public List<String> getWeeklyLabels(int weeks) {
        List<String> labels = new ArrayList<>();
        LocalDate weekStart = LocalDate.now().with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));
        LocalDate firstWeekStart = weekStart.minusWeeks(weeks - 1);
        for (int i = 0; i < weeks; i++) {
            LocalDate wStart = firstWeekStart.plusWeeks(i);
            String monthAbbr = wStart.getMonth().getDisplayName(TextStyle.SHORT, Locale.ENGLISH);
            labels.add(monthAbbr + " " + wStart.getDayOfMonth());
        }
        return labels;
    }

    @Override
    public List<Object[]> getAbsenceByGrade() {
        return attendanceRepository.countAbsenceByGrade();
    }

    @Override
    @Transactional(readOnly = true)
    public AttendanceGridResponse getAttendanceGrid(Long classId, LocalDate date) {
        Class classRoom = classRepository.findById(classId)
                .orElseThrow(() -> new ResourceNotFoundException("Class not found with id: " + classId));

        List<Student> students = studentRepository.findByStudentClassIdOrderByUserFirstNameAsc(classId);

        long dayOfWeekValue = date.getDayOfWeek().getValue(); // 1=Monday .. 7=Sunday

        List<Session> sessions = sessionRepository
                .findByClassField_IdAndDayOfWeekOrderByStartAtAsc(classId, dayOfWeekValue);

        LocalDateTime dayStart = date.atStartOfDay();
        LocalDateTime dayEnd = date.plusDays(1).atStartOfDay();

        List<Attendance> existingRecords =
                attendanceRepository.findGridByClassAndDate(classId, dayStart, dayEnd);

        Map<String, Attendance> recordIndex = existingRecords.stream()
                .filter(a -> a.getSession() != null)
                .collect(Collectors.toMap(
                        a -> a.getStudent().getId() + "_" + a.getSession().getId(),
                        a -> a,
                        (a, b) -> a
                ));

        List<StudentAttendanceRowResponse> rows = new ArrayList<>();
        for (Student student : students) {
            List<SessionAttendanceResponse> sessionResponses = new ArrayList<>();
            for (int i = 0; i < sessions.size(); i++) {
                Session session = sessions.get(i);
                String key = student.getId() + "_" + session.getId();
                Attendance existing = recordIndex.get(key);
                sessionResponses.add(SessionAttendanceResponse.builder()
                        .sessionId(session.getId())
                        .periodNumber(i + 1)          // 1-based column index
                        .courseName(session.getCourse().getCourseName())
                        .startAt(session.getStartAt())
                        .endAt(session.getEndAt())
                        .status(existing != null ? existing.getStatus() : null)
                        .build());
            }

            rows.add(StudentAttendanceRowResponse.builder()
                    .studentId(student.getId())
                    .fullName(buildFullName(student))
                    .fullNameAr(buildFullNameAr(student))
                    .initials(buildInitials(student))
                    .className(classRoom.getName())
                    .sessions(sessionResponses)
                    .build());
        }

        // Build column-header metadata (same sessions list, status is null for headers)
        List<SessionAttendanceResponse> sessionHeaders = new ArrayList<>();
        for (int i = 0; i < sessions.size(); i++) {
            Session s = sessions.get(i);
            sessionHeaders.add(SessionAttendanceResponse.builder()
                    .sessionId(s.getId())
                    .periodNumber(i + 1)
                    .courseName(s.getCourse().getCourseName())
                    .startAt(s.getStartAt())
                    .endAt(s.getEndAt())
                    .status(null)
                    .build());
        }

        return AttendanceGridResponse.builder()
                .classId(classRoom.getId())
                .className(classRoom.getName())
                .date(date)
                .studentCount(students.size())
                .sessions(sessionHeaders)
                .rows(rows)
                .build();
    }

    @Override
    @Transactional
    public AttendanceGridResponse saveAttendance(SaveAttendanceRequest request) {
        Class classRoom = classRepository.findById(request.getClassId())
                .orElseThrow(() -> new ResourceNotFoundException("Class not found with id: " + request.getClassId()));

        long dayOfWeekValue = request.getDate().getDayOfWeek().getValue();
        Map<Long, Session> sessionsById = sessionRepository
                .findByClassField_IdAndDayOfWeekOrderByStartAtAsc(classRoom.getId(), dayOfWeekValue)
                .stream()
                .collect(Collectors.toMap(Session::getId, s -> s));

        Set<Long> validStudentIds = studentRepository
                .findByStudentClassIdOrderByUserFirstNameAsc(classRoom.getId())
                .stream()
                .map(Student::getId)
                .collect(Collectors.toSet());

        LocalDateTime dayStart = request.getDate().atStartOfDay();
        LocalDateTime dayEnd = request.getDate().plusDays(1).atStartOfDay();

        for (AttendanceEntryRequest entry : request.getEntries()) {
            if (!validStudentIds.contains(entry.getStudentId())) {
                throw new IllegalArgumentException(
                        "Student " + entry.getStudentId() + " does not belong to class " + classRoom.getName());
            }

            Session session = sessionsById.get(entry.getSessionId());
            if (session == null) {
                throw new IllegalArgumentException(
                        "Session " + entry.getSessionId() + " is not scheduled for class "
                                + classRoom.getName() + " on this day");
            }

            Attendance record = attendanceRepository
                    .findByStudentAndSessionOnDate(entry.getStudentId(), session.getId(), dayStart, dayEnd)
                    .orElseGet(() -> {
                        Attendance newRecord = new Attendance();
                        Student studentRef = new Student();
                        studentRef.setId(entry.getStudentId());
                        newRecord.setStudent(studentRef);
                        newRecord.setSession(session);
                        newRecord.setDateTime(request.getDate().atTime(9, 0));
                        return newRecord;
                    });

            record.setStatus(entry.getStatus() != null && !entry.getStatus().isEmpty() ? entry.getStatus().charAt(0) : null);
            attendanceRepository.save(record);
        }

        return getAttendanceGrid(classRoom.getId(), request.getDate());
    }

    @Override
    @Transactional(readOnly = true)
    public List<ClassResponse> getAllClasses() {
        return classRepository.findAll().stream()
                .sorted(Comparator.comparing(Class::getName))
                .map(c -> ClassResponse.builder()
                        .id(c.getId())
                        .name(c.getName())
                        .displayName("Class " + c.getName())
                        .studentCount((int) studentRepository.countByStudentClassId(c.getId()))
                        .build())
                .collect(Collectors.toList());
    }

    private String buildFullName(Student student) {
        User user = student.getUser();
        String first = user.getFirstName() != null ? user.getFirstName() : "";
        String last = user.getLastName() != null ? user.getLastName() : "";
        return (first + " " + last).trim();
    }

    private String buildFullNameAr(Student student) {
        User user = student.getUser();
        String first = user.getFirstNameInArabic() != null ? user.getFirstNameInArabic() : "";
        String last = user.getLastNameInArabic() != null ? user.getLastNameInArabic() : "";
        return (first + " " + last).trim();
    }

    private String buildInitials(Student student) {
        User user = student.getUser();
        String first = user.getFirstName();
        String last = user.getLastName();
        String firstInitial = (first != null && !first.isEmpty()) ? first.substring(0, 1) : "";
        String lastInitial = (last != null && !last.isEmpty()) ? last.substring(0, 1) : "";
        return (firstInitial + lastInitial).toUpperCase();
    }
}


