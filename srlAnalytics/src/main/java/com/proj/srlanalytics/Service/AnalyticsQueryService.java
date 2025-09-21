package com.proj.srlanalytics.Service;

import com.proj.srlanalytics.DTO.ClicksPerDayEntry;
import com.proj.srlanalytics.DTO.SummaryResponse;
import com.proj.srlanalytics.DTO.TopItemEntry;
import com.proj.srlanalytics.Repository.ClickEventRepository;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.List;

@Service
@Transactional(readOnly = true)
public class AnalyticsQueryService {

    private final ClickEventRepository repo;

    public AnalyticsQueryService(ClickEventRepository repo) {
        this.repo = repo;
    }

    public SummaryResponse getSummary(String userTag) {
        long total = repo.countByUserTag(userTag);
        long unique = repo.countByUserTagAndIsUniqueTrue(userTag);
        return new SummaryResponse(userTag, null, total, unique);
    }

    public SummaryResponse getLocatorSummary(String userTag, String locator) {
        long total = repo.countByUserTagAndLocator(userTag, locator);
        long unique = repo.countByUserTagAndLocatorAndIsUniqueTrue(userTag, locator);
        return new SummaryResponse(userTag, locator, total, unique);
    }

    public List<ClicksPerDayEntry> getClicksPerDay(String userTag, LocalDate start, LocalDate end) {
        OffsetDateTime startDt = start.atStartOfDay().atOffset(ZoneOffset.UTC);
        OffsetDateTime endDt = end.plusDays(1).atStartOfDay().atOffset(ZoneOffset.UTC);
        List<Object[]> rows = repo.countClicksPerDay(userTag, startDt, endDt);
        return rows.stream()
                .map(row -> new ClicksPerDayEntry(row[0].toString(), toLong(row[1])))
                .toList();
    }

    public List<TopItemEntry> getTopReferrers(String userTag, int limit) {
        return toTopItemList(repo.findTopReferrers(userTag, PageRequest.of(0, limit)));
    }

    public List<TopItemEntry> getTopBrowsers(String userTag, int limit) {
        return toTopItemList(repo.findTopBrowsers(userTag, PageRequest.of(0, limit)));
    }

    public List<TopItemEntry> getTopCountries(String userTag, int limit) {
        return toTopItemList(repo.findTopCountries(userTag, PageRequest.of(0, limit)));
    }

    public List<TopItemEntry> getTopOs(String userTag, int limit) {
        return toTopItemList(repo.findTopOs(userTag, PageRequest.of(0, limit)));
    }

    public List<ClicksPerDayEntry> getLocatorClicksPerDay(String userTag, String locator,
                                                           LocalDate start, LocalDate end) {
        OffsetDateTime startDt = start.atStartOfDay().atOffset(ZoneOffset.UTC);
        OffsetDateTime endDt = end.plusDays(1).atStartOfDay().atOffset(ZoneOffset.UTC);
        List<Object[]> rows = repo.countClicksPerDayByLocator(userTag, locator, startDt, endDt);
        return rows.stream()
                .map(row -> new ClicksPerDayEntry(row[0].toString(), toLong(row[1])))
                .toList();
    }

    public List<TopItemEntry> getLocatorTopReferrers(String userTag, String locator, int limit) {
        return toTopItemList(repo.findTopReferrersByLocator(userTag, locator, PageRequest.of(0, limit)));
    }

    public List<TopItemEntry> getLocatorTopCountries(String userTag, String locator, int limit) {
        return toTopItemList(repo.findTopCountriesByLocator(userTag, locator, PageRequest.of(0, limit)));
    }

    private List<TopItemEntry> toTopItemList(List<Object[]> rows) {
        return rows.stream()
                .map(row -> new TopItemEntry(
                        row[0] != null && !row[0].toString().isBlank() ? row[0].toString() : "(direct)",
                        toLong(row[1])))
                .toList();
    }

    private long toLong(Object value) {
        return value instanceof Number num ? num.longValue() : 0L;
    }
}
