package com.proj.srldashboard.Repository;

import com.proj.srldashboard.Model.SrlModel;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Map;

@Repository
public class SrlRepository {

    private MongoTemplate mongoTemplate;

    @Autowired
    public void setMongoTemplate(MongoTemplate mongoTemplate) {
        this.mongoTemplate = mongoTemplate;
    }

    public SrlModel saveSrl(SrlModel srlmodel, String userTag) {
                        //collection name= userTag
        mongoTemplate.save(srlmodel,userTag);
        return mongoTemplate.find(Query.query(Criteria.where("locator").is(srlmodel.getLocator())),
                SrlModel.class,
                userTag).getFirst();
    }

    public void deleteSrl(String userTag, String locator) {
        Query query = new Query(Criteria.where("locator").is(locator));
        mongoTemplate.remove(query, SrlModel.class, userTag);
    }

    public List<Map> listSrl(String usertag) {
        return mongoTemplate.findAll(Map.class, usertag);
    }
}
