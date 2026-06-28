package com.ntg.sms.controllers;

import com.ntg.sms.dto.DashboardResponse;
import com.ntg.sms.services.DashboardService;
import lombok.Generated;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor

public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping("/dashboard")
    public DashboardResponse getDashboardData(){
        return dashboardService.getDashboardData();
    }
}
