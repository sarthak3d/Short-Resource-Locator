package com.proj.srldashboard;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;

@SpringBootApplication
@EnableCaching
public class SrlDashboardApplication {

    public static void main(String[] args) {
        SpringApplication.run(SrlDashboardApplication.class, args);
    }

}
