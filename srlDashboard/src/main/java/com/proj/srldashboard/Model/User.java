package com.proj.srldashboard.Model;


import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.MongoId;

import java.io.Serializable;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Document(collection = "user_mapping")
public class User implements Serializable {
    @MongoId
    private String id;
    @Indexed(unique = true)
    private String username;
    private String name;
    @Indexed(unique = true)
    private String email;
    @Indexed(unique = true)
    private String key;
    @Indexed(unique = true)
    private String userTag;
    private int locator_count;
    private boolean submitted = false;

    public User(UserDTO userDTO) {
        this.name = userDTO.getName();
        this.userTag = userDTO.getUserTag();
    }

}
