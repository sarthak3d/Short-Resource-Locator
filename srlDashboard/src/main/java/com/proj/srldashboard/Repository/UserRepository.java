package com.proj.srldashboard.Repository;

import com.proj.srldashboard.Model.User;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Optional;

public interface UserRepository extends MongoRepository<User,String> {
    Optional<User> findByUsername(String username);
    Optional<User> findByUserTag(String userTag);
    Optional<User> findByEmail(String email);
}
