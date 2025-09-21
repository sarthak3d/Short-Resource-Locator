package com.proj.srlanalytics.Model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;

@Entity
@Table(name = "unique_visitors",
        uniqueConstraints = @UniqueConstraint(
                name = "uq_visitor",
                columnNames = {"user_tag", "locator", "ip_hash"}
        ))
@Data
@NoArgsConstructor
@AllArgsConstructor
public class UniqueVisitor {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_tag", nullable = false, length = 10)
    private String userTag;

    @Column(nullable = false, length = 20)
    private String locator;

    @Column(name = "ip_hash", nullable = false, length = 64)
    private String ipHash;

    @Column(name = "first_seen", nullable = false, columnDefinition = "TIMESTAMPTZ")
    private OffsetDateTime firstSeen;
}
