package com.proj.srldashboard.Controller;

import com.proj.srldashboard.Model.UserDTO;
import com.proj.srldashboard.Service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("user/details")
public class UserController {

    private final UserService userservice;

    @Autowired
    public UserController(UserService userservice) {
        this.userservice = userservice;
    }

    @PostMapping("fill")
    public ResponseEntity<?> submitDetails(@RequestBody UserDTO request,
            @AuthenticationPrincipal UserDetails userdetails) {
        return userservice.submitDetails(request, userdetails.getUsername());
    }

    @GetMapping("get")
    public ResponseEntity<?> getDetails(@AuthenticationPrincipal UserDetails userdetails) {
        return userservice.getDetails(userdetails.getUsername());
    }

    @PatchMapping("update")
    public ResponseEntity<?> updateDetails(@RequestBody UserDTO request,
            @AuthenticationPrincipal UserDetails userdetails) {
        return userservice.updateDetails(request, userdetails.getUsername());
    }

    @GetMapping("srl-list")
    public ResponseEntity<?> getSrlList(@AuthenticationPrincipal UserDetails userdetails) {
        return userservice.getSrlList(userdetails.getUsername());
    }
}
