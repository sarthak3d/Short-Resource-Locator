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
@RequestMapping("/api/analytics/{userTag}")
public class AnalyticsController {

    private final AnalyticsQueryService queryService;

    public AnalyticsController(AnalyticsQueryService queryService) {
        this.queryService = queryService;
    }

    @GetMapping("/summary")
    @Projectable
    public SummaryResponse getSummary(@PathVariable String userTag) {
        return queryService.getSummary(userTag);
    }

    @GetMapping("/clicks-per-day")
    @Projectable(collection = true)
    public List<ClicksPerDayEntry> getClicksPerDay(
            @PathVariable String userTag,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate start,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate end) {
        return queryService.getClicksPerDay(userTag, start, end);
    }

    @GetMapping("/top/referrers")
    @Projectable(collection = true)
    public List<TopItemEntry> getTopReferrers(@PathVariable String userTag,
                                               @RequestParam(defaultValue = "10") int limit) {
        return queryService.getTopReferrers(userTag, limit);
    }

    @GetMapping("/top/browsers")
    @Projectable(collection = true)
    public List<TopItemEntry> getTopBrowsers(@PathVariable String userTag,
                                              @RequestParam(defaultValue = "10") int limit) {
        return queryService.getTopBrowsers(userTag, limit);
    }

    @GetMapping("/top/countries")
    @Projectable(collection = true)
    public List<TopItemEntry> getTopCountries(@PathVariable String userTag,
                                               @RequestParam(defaultValue = "10") int limit) {
        return queryService.getTopCountries(userTag, limit);
    }

    @GetMapping("/top/os")
    @Projectable(collection = true)
    public List<TopItemEntry> getTopOs(@PathVariable String userTag,
                                        @RequestParam(defaultValue = "10") int limit) {
        return queryService.getTopOs(userTag, limit);
    }
}
