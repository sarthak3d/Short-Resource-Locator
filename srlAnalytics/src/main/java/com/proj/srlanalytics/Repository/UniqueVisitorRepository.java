package com.proj.srlanalytics.Repository;

import com.proj.srlanalytics.Model.UniqueVisitor;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UniqueVisitorRepository extends JpaRepository<UniqueVisitor, Long> {

    boolean existsByUserTagAndLocatorAndIpHash(String userTag, String locator, String ipHash);

    @org.springframework.data.jpa.repository.Modifying
    @org.springframework.data.jpa.repository.Query(
            value = "INSERT INTO unique_visitors (user_tag, locator, ip_hash, first_seen) " +
                    "VALUES (:userTag, :locator, :ipHash, :firstSeen) " +
                    "ON CONFLICT ON CONSTRAINT uq_visitor DO NOTHING",
            nativeQuery = true)
    int insertIgnoreConflict(
            @org.springframework.data.repository.query.Param("userTag") String userTag,
            @org.springframework.data.repository.query.Param("locator") String locator,
            @org.springframework.data.repository.query.Param("ipHash") String ipHash,
            @org.springframework.data.repository.query.Param("firstSeen") java.time.OffsetDateTime firstSeen
    );
}
