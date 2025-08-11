package com.proj.shortresourcelocator.Model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.context.annotation.Scope;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.MongoId;
import org.springframework.stereotype.Component;

import java.util.Date;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class srlModel {

    @MongoId
    private String id;
    private String url;
    @Indexed(unique = true)
    private String locator;
    private Date created;

}
