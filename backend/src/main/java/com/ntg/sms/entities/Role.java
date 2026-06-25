package com.ntg.sms.entities;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "ROLES")
public class Role {
    @Id
    @Column(name = "ROLE_ID", nullable = false)
    private Long id;

    @Size(max = 100)
    @NotNull
    @Column(name = "ROLE_NAME", nullable = false, length = 100)
    private String roleName;


}