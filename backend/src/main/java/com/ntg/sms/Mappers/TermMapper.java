package com.ntg.sms.Mappers;

import com.ntg.sms.Entities.Dtos.Response.TermResponse;
import com.ntg.sms.Entities.Term;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;
import java.util.Set;

@Mapper(componentModel = "spring")
public interface TermMapper {

    Set<TermResponse> toResponse(Set<Term> term);
}
