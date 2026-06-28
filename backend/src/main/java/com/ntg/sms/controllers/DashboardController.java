package com.ntg.sms.Controllers;

import com.ntg.sms.Entities.Dtos.Response.DashboardResponse;
import com.ntg.sms.Service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/dashboard/")
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping
    public DashboardResponse getDashboardData(){
        return dashboardService.getDashboardData();
    }
}
