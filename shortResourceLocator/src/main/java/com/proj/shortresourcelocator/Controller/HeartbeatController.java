package com.proj.shortresourcelocator.Controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/heartbeat")
public class HeartbeatController {

    @GetMapping
    public ResponseEntity<String> ping() {
        return ResponseEntity.ok("shortResourceLocator is alive");
    }
}
