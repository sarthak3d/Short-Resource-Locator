package com.proj.srldashboard.Model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class CredRequest {
    private String email;
    private String username;
    private String passcode;

}