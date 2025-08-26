package com.proj.srldashboard.Model;

import lombok.Data;
import lombok.NoArgsConstructor;
import org.bson.types.ObjectId;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;

import java.util.Date;

@Data
@NoArgsConstructor
public class SrlModel {

    @Id
    private ObjectId id;
    private String url;
    @Indexed(unique = true)
    private String locator;
    private Date created;

    public SrlModel(String url, String locator, Date created) {
        this.url = url;
        this.locator = locator;
        this.created = created;
    }
}
