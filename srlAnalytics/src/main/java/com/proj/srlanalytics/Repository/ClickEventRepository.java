package com.proj.srlanalytics.Repository;

import com.proj.srlanalytics.Model.ClickEvent;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.OffsetDateTime;
import java.util.List;

public interface ClickEventRepository extends JpaRepository<ClickEvent, Long> {

    long countByUserTag(String userTag);

    long countByUserTagAndIsUniqueTrue(String userTag);

    long countByUserTagAndLocator(String userTag, String locator);

    long countByUserTagAndLocatorAndIsUniqueTrue(String userTag, String locator);

    @Query("SELECT CAST(c.clickedAt AS LocalDate) AS date, COUNT(c) AS clicks " +
           "FROM ClickEvent c " +
           "WHERE c.userTag = :userTag AND c.clickedAt BETWEEN :start AND :end " +
           "GROUP BY CAST(c.clickedAt AS LocalDate) " +
           "ORDER BY CAST(c.clickedAt AS LocalDate)")
    List<Object[]> countClicksPerDay(@Param("userTag") String userTag,
                                     @Param("start") OffsetDateTime start,
                                     @Param("end") OffsetDateTime end);

    @Query("SELECT c.referrer, COUNT(c) FROM ClickEvent c " +
           "WHERE c.userTag = :userTag AND c.referrer IS NOT NULL AND c.referrer <> '' " +
           "GROUP BY c.referrer ORDER BY COUNT(c) DESC")
    List<Object[]> findTopReferrers(@Param("userTag") String userTag, Pageable pageable);

    @Query("SELECT c.browser, COUNT(c) FROM ClickEvent c " +
           "WHERE c.userTag = :userTag " +
           "GROUP BY c.browser ORDER BY COUNT(c) DESC")
    List<Object[]> findTopBrowsers(@Param("userTag") String userTag, Pageable pageable);

    @Query("SELECT c.country, COUNT(c) FROM ClickEvent c " +
           "WHERE c.userTag = :userTag AND c.country IS NOT NULL AND c.country <> '' " +
           "GROUP BY c.country ORDER BY COUNT(c) DESC")
    List<Object[]> findTopCountries(@Param("userTag") String userTag, Pageable pageable);

    @Query("SELECT c.os, COUNT(c) FROM ClickEvent c " +
           "WHERE c.userTag = :userTag " +
           "GROUP BY c.os ORDER BY COUNT(c) DESC")
    List<Object[]> findTopOs(@Param("userTag") String userTag, Pageable pageable);

    @Query("SELECT CAST(c.clickedAt AS LocalDate) AS date, COUNT(c) AS clicks " +
           "FROM ClickEvent c " +
           "WHERE c.userTag = :userTag AND c.locator = :locator AND c.clickedAt BETWEEN :start AND :end " +
           "GROUP BY CAST(c.clickedAt AS LocalDate) " +
           "ORDER BY CAST(c.clickedAt AS LocalDate)")
    List<Object[]> countClicksPerDayByLocator(@Param("userTag") String userTag,
                                              @Param("locator") String locator,
                                              @Param("start") OffsetDateTime start,
                                              @Param("end") OffsetDateTime end);

    @Query("SELECT c.referrer, COUNT(c) FROM ClickEvent c " +
           "WHERE c.userTag = :userTag AND c.locator = :locator AND c.referrer IS NOT NULL AND c.referrer <> '' " +
           "GROUP BY c.referrer ORDER BY COUNT(c) DESC")
    List<Object[]> findTopReferrersByLocator(@Param("userTag") String userTag,
                                             @Param("locator") String locator,
                                             Pageable pageable);

    @Query("SELECT c.country, COUNT(c) FROM ClickEvent c " +
           "WHERE c.userTag = :userTag AND c.locator = :locator AND c.country IS NOT NULL AND c.country <> '' " +
           "GROUP BY c.country ORDER BY COUNT(c) DESC")
    List<Object[]> findTopCountriesByLocator(@Param("userTag") String userTag,
                                              @Param("locator") String locator,
                                              Pageable pageable);
}
