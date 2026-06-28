package com.ntg.sms.repositories;

import com.ntg.sms.entities.Permission;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

public interface PermissionRepository extends JpaRepository<Permission,Long> {
}
