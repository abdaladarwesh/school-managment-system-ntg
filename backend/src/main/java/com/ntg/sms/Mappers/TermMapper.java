package com.ntg.sms.Mappers;

import com.ntg.sms.Dtos.Response.TermResponse;
import com.ntg.sms.Entities.Term;
import org.mapstruct.Mapper;

import java.util.Set;

@Mapper(componentModel = "spring")
public interface TermMapper {

    Set<TermResponse> toResponse(Set<Term> term);
}
