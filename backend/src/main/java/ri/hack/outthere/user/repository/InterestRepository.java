package ri.hack.outthere.user.repository;

import java.util.List;
import java.util.UUID;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.stereotype.Repository;
import ri.hack.outthere.user.dto.InterestDtos.InterestResponse;

@Repository
public class InterestRepository {
    private final JdbcClient jdbc;
    public InterestRepository(JdbcClient jdbc) { this.jdbc = jdbc; }

    public InterestResponse get(UUID user) {
        var ids = jdbc.sql("SELECT field_id FROM user_interest WHERE user_id=:user ORDER BY field_id")
                .param("user", user).query(UUID.class).list();
        boolean complete = jdbc.sql("SELECT interests_set_at IS NOT NULL FROM app_user WHERE id=:user")
                .param("user", user).query(Boolean.class).single();
        return new InterestResponse(ids, complete);
    }

    public boolean validFields(List<UUID> ids) {
        return ids.isEmpty() || jdbc.sql("SELECT count(*) FROM field WHERE id IN (:ids)")
                .param("ids", ids).query(Long.class).single() == ids.size();
    }

    public void replace(UUID user, List<UUID> ids) {
        jdbc.sql("SELECT id FROM app_user WHERE id=:user FOR UPDATE").param("user", user).query(UUID.class).single();
        jdbc.sql("DELETE FROM user_interest WHERE user_id=:user").param("user", user).update();
        for (UUID id : ids) jdbc.sql("INSERT INTO user_interest(user_id,field_id) VALUES (:user,:field)")
                .param("user", user).param("field", id).update();
        jdbc.sql("UPDATE app_user SET interests_set_at=now(),updated_at=now() WHERE id=:user")
                .param("user", user).update();
    }
}
