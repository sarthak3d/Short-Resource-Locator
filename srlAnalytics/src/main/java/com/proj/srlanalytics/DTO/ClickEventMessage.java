package com.proj.srlanalytics.DTO;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ClickEventMessage {

    private String userTag;
    private String locator;
    private String ipAddress;
    private String userAgent;
    private String referrer;
    private String country;
}
