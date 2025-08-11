package com.proj.shortresourcelocator.Repository;

import com.proj.shortresourcelocator.Model.srlModel;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public class SrlRepository {

    private MongoTemplate mongoTemplate;

    @Autowired
    public void setMongoTemplate(MongoTemplate mongoTemplate) {
        this.mongoTemplate = mongoTemplate;
    }

    public List<srlModel> findBySrl(String userTag, String locator) {
                        //collection name= userTag
        return mongoTemplate.find(
                Query.query(Criteria.where("locator").is(locator)),
                srlModel.class,
                userTag);
    }
}
