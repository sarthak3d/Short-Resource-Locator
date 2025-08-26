package com.proj.srldashboard.Model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AnalyticsTokenResponse {

    private String analyticsToken;
    private int expiresIn;
}
