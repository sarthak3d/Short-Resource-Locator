package com.proj.srlanalytics.Model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;

@Entity
@Table(name = "click_events")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ClickEvent {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_tag", nullable = false, length = 10)
    private String userTag;

    @Column(nullable = false, length = 20)
    private String locator;

    @Column(name = "clicked_at", nullable = false, columnDefinition = "TIMESTAMPTZ")
    private OffsetDateTime clickedAt;

    @Column(name = "ip_hash", length = 64)
    private String ipHash;

    @Column(length = 2)
    private String country;

    @Column(length = 100)
    private String os;

    @Column(length = 100)
    private String browser;

    @Column(length = 500)
    private String referrer;

    @Column(name = "is_unique")
    private boolean isUnique;
}
