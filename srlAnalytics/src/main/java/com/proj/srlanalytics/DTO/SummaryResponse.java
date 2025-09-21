package com.proj.srlanalytics.DTO;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SummaryResponse {

    private String userTag;
    private String locator;
    private long totalClicks;
    private long uniqueClicks;
}
