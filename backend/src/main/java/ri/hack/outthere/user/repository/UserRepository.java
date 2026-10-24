package ri.hack.outthere.user.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.stereotype.Repository;
import ri.hack.outthere.user.model.UserRow;

@Repository
public class UserRepository {
    private final JdbcClient jdbc;

    public UserRepository(JdbcClient jdbc) { this.jdbc = jdbc; }

    public boolean exists(UUID id) {
        return jdbc.sql("SELECT EXISTS(SELECT 1 FROM app_user WHERE id=:id AND deleted_at IS NULL)")
                .param("id", id).query(Boolean.class).single();
    }

    public List<UserRow> users(UUID viewer, UUID id, String search) {
        String sql = """
                WITH friends AS (
                    SELECT requester_id AS user_id, addressee_id AS friend_id FROM friendship f
                    JOIN friendship_status fs ON fs.id=f.friendship_status_id WHERE fs.label='ACCEPTED'
                    UNION
                    SELECT addressee_id, requester_id FROM friendship f
                    JOIN friendship_status fs ON fs.id=f.friendship_status_id WHERE fs.label='ACCEPTED'
                )
                SELECT u.id, concat_ws(' ',u.first_name,u.last_name) AS name, u.username AS handle,
                  u.avatar_url, n.iso_code AS country_code,
                  CASE WHEN u.id=:viewer THEN 'me' WHEN fs.label='ACCEPTED' THEN 'friend'
                       WHEN fs.label='PENDING' THEN 'requested' ELSE 'none' END AS relation,
                  (SELECT count(*) FROM friends a JOIN friends b ON a.friend_id=b.friend_id
                   WHERE a.user_id=:viewer AND b.user_id=u.id) AS mutual_friends_count
                FROM app_user u LEFT JOIN country n ON n.id=u.country_id
                LEFT JOIN friendship f ON (f.requester_id=:viewer AND f.addressee_id=u.id)
                                       OR (f.addressee_id=:viewer AND f.requester_id=u.id)
                LEFT JOIN friendship_status fs ON fs.id=f.friendship_status_id
                WHERE u.deleted_at IS NULL
                """;
        if (id != null) sql += " AND u.id=:id";
        if (search != null) sql += " AND (position(lower(:search) in lower(concat_ws(' ',u.first_name,u.last_name)))>0 OR position(lower(:search) in lower(u.username))>0)";
        var query = jdbc.sql(sql + " ORDER BY mutual_friends_count DESC, name, u.id").param("viewer", viewer);
        if (id != null) query.param("id", id);
        if (search != null) query.param("search", search.trim());
        return query.query(UserRow.class).list();
    }

    public record CompletionRow(UUID courseId, String countryCode) { }

    public List<CompletionRow> completions(UUID user) {
        return jdbc.sql("""
                SELECT DISTINCT e.course_id, n.iso_code AS country_code
                FROM course_completion cc JOIN enrollment e ON e.id=cc.enrollment_id
                JOIN course c ON c.id=e.course_id LEFT JOIN country n ON n.id=c.country_id
                WHERE e.user_id=:user ORDER BY e.course_id
                """).param("user", user).query(CompletionRow.class).list();
    }

    public List<UUID> inProgress(UUID user) {
        return jdbc.sql("""
                SELECT DISTINCT e.course_id FROM enrollment e
                WHERE e.user_id=:user AND e.first_opened_at IS NOT NULL AND e.completed_at IS NULL
                  AND NOT EXISTS (SELECT 1 FROM course_completion cc JOIN enrollment ce ON ce.id=cc.enrollment_id
                                  WHERE ce.user_id=:user AND ce.course_id=e.course_id)
                ORDER BY e.course_id
                """).param("user", user).query(UUID.class).list();
    }

    public long streak(UUID user) {
        // Today may still be in progress: yesterday's streak remains active until today's end.
        return jdbc.sql("""
                WITH days AS (
                    SELECT DISTINCT (cc.completed_at AT TIME ZONE u.timezone)::date AS day
                    FROM course_completion cc JOIN enrollment e ON e.id=cc.enrollment_id
                    JOIN app_user u ON u.id=e.user_id WHERE u.id=:user
                ), numbered AS (
                    SELECT day, row_number() OVER (ORDER BY day DESC) AS position FROM days
                    WHERE day<=(SELECT (now() AT TIME ZONE timezone)::date FROM app_user WHERE id=:user)
                ), anchor AS (SELECT max(day) AS day FROM numbered)
                SELECT count(*) FROM numbered n CROSS JOIN anchor a
                WHERE a.day >= (SELECT (now() AT TIME ZONE timezone)::date-1 FROM app_user WHERE id=:user)
                  AND n.day=a.day-(n.position::integer-1)
                """).param("user", user).query(Long.class).single();
    }

    public void lock(UUID user) {
        jdbc.sql("SELECT id FROM app_user WHERE id=:id FOR UPDATE").param("id", user).query(UUID.class).single();
    }

    public void requestFriend(UUID viewer, UUID other) {
        // Reuse a declined/cancelled pair; the schema has one row per unordered pair.
        jdbc.sql("""
                INSERT INTO friendship(requester_id,addressee_id) VALUES (:viewer,:other)
                ON CONFLICT (least(requester_id,addressee_id), greatest(requester_id,addressee_id))
                DO UPDATE SET requester_id=:viewer, addressee_id=:other,
                   friendship_status_id=(SELECT id FROM friendship_status WHERE label='PENDING'),
                   created_at=now(), responded_at=NULL
                """).param("viewer", viewer).param("other", other).update();
    }
}
