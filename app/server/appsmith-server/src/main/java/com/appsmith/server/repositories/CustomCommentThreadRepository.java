package com.appsmith.server.repositories;

import com.appsmith.server.acl.AclPermission;
import com.appsmith.server.domains.CommentThread;
import com.mongodb.client.result.UpdateResult;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.util.Set;

public interface CustomCommentThreadRepository extends AppsmithRepository<CommentThread> {
    Flux<CommentThread> findByApplicationId(String applicationId, AclPermission permission);
    Mono<UpdateResult> addToSubscribers(String threadId, Set<String> usernames);
    Mono<CommentThread> findPrivateThread(String applicationId);
}
