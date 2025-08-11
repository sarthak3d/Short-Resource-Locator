package com.proj.shortresourcelocator.Service;

import com.proj.shortresourcelocator.Model.srlModel;
import com.proj.shortresourcelocator.Repository.SrlRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
@Transactional(readOnly = true)
public class srlService {

    private SrlRepository srlrepository;

    @Autowired
    public void setSrlrepository(SrlRepository srlrepository) {
        this.srlrepository = srlrepository;
    }


    public srlModel getUrl(String userTag,String locator) {
        List<srlModel> srlModels = srlrepository.findBySrl(userTag,locator);
        if (srlModels.isEmpty()) {
            srlModel srlM = new srlModel();
            srlM.setId("");
            return  srlM;
        } else {
            return srlModels.getFirst();
        }
    }

}
