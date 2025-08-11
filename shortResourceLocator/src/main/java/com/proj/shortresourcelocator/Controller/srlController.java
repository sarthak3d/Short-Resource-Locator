package com.proj.shortresourcelocator.Controller;


import com.proj.shortresourcelocator.Model.srlModel;
import com.proj.shortresourcelocator.Service.ClickEventPublisher;
import com.proj.shortresourcelocator.Service.srlService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.view.RedirectView;

@RestController
@RequestMapping("{userTag}")
public class srlController {

    private srlService srlService;
    private ClickEventPublisher clickEventPublisher;

    @Autowired
    public void setSrlService(srlService srlService) {
        this.srlService = srlService;
    }

    @Autowired
    public void setClickEventPublisher(ClickEventPublisher clickEventPublisher) {
        this.clickEventPublisher = clickEventPublisher;
    }

    @GetMapping("{locator}")
    public Object srlToUrl(@PathVariable String userTag,
                           @PathVariable String locator,
                           HttpServletRequest request) {
        srlModel srlM = srlService.getUrl(userTag, locator);
        if(srlM.getId().isEmpty())
            return ResponseEntity.badRequest().body("Missing redirect URL");
        clickEventPublisher.publish(request, userTag, locator);
        return new RedirectView(srlM.getUrl());
    }

}
