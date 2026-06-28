package com.ntg.sms.Entities;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import jakarta.validation.constraints.NotNull;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.Setter;

import java.io.Serializable;

@Getter
@Setter
@EqualsAndHashCode
@Embeddable
public class UserPhoneNumberId implements Serializable {
    private static final long serialVersionUID = 4986848407214847006L;
    @NotNull
    @Column(name = "USER_ID", nullable = false)
    private Long userId;

    @NotNull
    @Column(name = "PHONE_NUMBER", nullable = false)
    private Long phoneNumber;


}