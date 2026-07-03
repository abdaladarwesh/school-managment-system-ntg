package com.ntg.sms.Repositories;

import com.ntg.sms.Entities.Course;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CourseRepository extends JpaRepository<Course, Long> {
}