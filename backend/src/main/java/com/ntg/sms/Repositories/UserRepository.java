package com.ntg.sms.Repositories;

import com.ntg.sms.Entities.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);

    boolean existsByNationalNumber(Long nationalNumber);

    @Query("""
    SELECT u
    FROM User u
    WHERE u.email = :email
      AND u.role.roleName = 'STUDENT_AFFAIRS'
    """)
    Optional<User> findSAUserByEmail(@Param("email") String email);

    Optional<User> findByFirstName(String firstName);
}
