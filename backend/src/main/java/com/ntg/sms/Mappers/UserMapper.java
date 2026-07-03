package com.ntg.sms.Mappers;

import com.ntg.sms.Dtos.Response.UserResponse;
import com.ntg.sms.Entities.User;
import org.mapstruct.Mapper;

import java.util.List;

@Mapper(componentModel = "spring")
public interface UserMapper {

    UserResponse toDto(User user);

    List<UserResponse> toDto(List<User> users);
}