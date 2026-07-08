package com.ntg.sms.Controllers;

import com.ntg.sms.Dtos.Response.ParentResponse;
import com.ntg.sms.Mappers.ParentMapper;
import com.ntg.sms.Service.ParentService;
import com.ntg.sms.Service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/parents")
@RequiredArgsConstructor
public class ParentController {
    private final ParentService parentService;
    private final ParentMapper parentMapper;
    private final UserService userService;


    @GetMapping
    public List<ParentResponse> getAllParents() {
        var data = parentMapper.toResponse(parentService.getAllParents());

        data.forEach(r -> {
            var userId = r.getUser().getId();
            r.getUser().setPhoneNumbers(userService.getUserPhoneNumbers(userId));
        });
        return data;
    }
}
