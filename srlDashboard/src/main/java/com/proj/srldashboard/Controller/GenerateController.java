package com.proj.srldashboard.Controller;

import com.proj.srldashboard.Model.UrlRequest;
import com.proj.srldashboard.Service.GenerateService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
@RestController
@RequestMapping("url2srl")
public class GenerateController {

    private final GenerateService generateservice;

    @Autowired
    public GenerateController(GenerateService generateservice) {
        this.generateservice = generateservice;
    }


    @PostMapping("generate")
    public ResponseEntity<?> generate(@RequestBody UrlRequest request,
                                      @AuthenticationPrincipal UserDetails userdetails) {
        return generateservice.generateSrl(request.getUrl(),userdetails.getUsername());
    }

    @DeleteMapping("delete")
    public ResponseEntity<?> deleteSrl(@RequestParam String userTag, @RequestParam String locator) {
        return generateservice.deleteSrl(userTag, locator);
    }


}
