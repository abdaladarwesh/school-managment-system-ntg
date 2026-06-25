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
@Table(name = "MARKS_TYPE")
public class MarksType {
    @Id
    @Column(name = "TYPE_ID", nullable = false)
    private Long id;

    @Size(max = 50)
    @NotNull
    @Column(name = "\"TYPE\"", nullable = false, length = 50)
    private String type;


}