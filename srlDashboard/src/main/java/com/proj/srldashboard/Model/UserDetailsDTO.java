package com.proj.srldashboard.Model;

import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class UserDetailsDTO extends UserDTO {
    private String username;
    private int locator_count;
    private String email;

    public UserDetailsDTO(String name, String email, String userTag, String username, int locator_count) {
        super(name, userTag);
        this.username = username;
        this.locator_count = locator_count;
        this.email = email;
    }

}
