package com.proj.srlanalytics.DTO;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ClicksPerDayEntry {

    private String date;
    private long clicks;
}
