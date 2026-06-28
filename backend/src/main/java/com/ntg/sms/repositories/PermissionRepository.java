package com.ntg.sms.Repositories;

import com.ntg.sms.Entities.Permission;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

public interface PermissionRepository extends JpaRepository<Permission,Long> {
}
