package com.proj.srlanalytics.Controller;

import com.proj.srlanalytics.DTO.ClicksPerDayEntry;
import com.proj.srlanalytics.DTO.SummaryResponse;
import com.proj.srlanalytics.DTO.TopItemEntry;
import com.proj.srlanalytics.Service.AnalyticsQueryService;
import com.projection.annotation.Projectable;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/analytics/{userTag}/locator/{locator}")
public class LocatorAnalyticsController {

    private final AnalyticsQueryService queryService;

    public LocatorAnalyticsController(AnalyticsQueryService queryService) {
        this.queryService = queryService;
    }

    @GetMapping("/summary")
    @Projectable
    public SummaryResponse getLocatorSummary(@PathVariable String userTag,
                                              @PathVariable String locator) {
        return queryService.getLocatorSummary(userTag, locator);
    }

    @GetMapping("/clicks-per-day")
    @Projectable(collection = true)
    public List<ClicksPerDayEntry> getLocatorClicksPerDay(
            @PathVariable String userTag,
            @PathVariable String locator,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate start,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate end) {
        return queryService.getLocatorClicksPerDay(userTag, locator, start, end);
    }

    @GetMapping("/top/referrers")
    @Projectable(collection = true)
    public List<TopItemEntry> getLocatorTopReferrers(@PathVariable String userTag,
                                                      @PathVariable String locator,
                                                      @RequestParam(defaultValue = "10") int limit) {
        return queryService.getLocatorTopReferrers(userTag, locator, limit);
    }

    @GetMapping("/top/countries")
    @Projectable(collection = true)
    public List<TopItemEntry> getLocatorTopCountries(@PathVariable String userTag,
                                                      @PathVariable String locator,
                                                      @RequestParam(defaultValue = "10") int limit) {
        return queryService.getLocatorTopCountries(userTag, locator, limit);
    }
}
