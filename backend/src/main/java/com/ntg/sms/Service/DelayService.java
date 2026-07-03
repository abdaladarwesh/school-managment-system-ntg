package com.ntg.sms.Service;

import com.ntg.sms.Dtos.Request.DelayRequest;
import com.ntg.sms.Entities.Delay;

import java.util.List;

public interface DelayService {
    List<Delay> getAllDelays();
    Delay createDelay(DelayRequest request);
}
