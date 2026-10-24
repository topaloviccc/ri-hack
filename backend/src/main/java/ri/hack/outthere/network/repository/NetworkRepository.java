package ri.hack.outthere.network.repository;

import java.util.List;
import java.util.UUID;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.stereotype.Repository;
import ri.hack.outthere.network.dto.FeedItemResponse;
import ri.hack.outthere.network.dto.LeaderboardEntryResponse;

@Repository
public class NetworkRepository {
    private static final String FRIENDS = """
            WITH friends AS (
                SELECT CASE WHEN requester_id=:viewer THEN addressee_id ELSE requester_id END AS id
                FROM friendship f JOIN friendship_status fs ON fs.id=f.friendship_status_id
                WHERE (requester_id=:viewer OR addressee_id=:viewer) AND fs.label='ACCEPTED'
            )
            """;

    private final JdbcClient jdbc;

    public NetworkRepository(JdbcClient jdbc) { this.jdbc = jdbc; }

    public List<FeedItemResponse> feed(UUID viewer) {
        return jdbc.sql(FRIENDS + """
                SELECT cc.id, u.id AS user_id, concat_ws(' ',u.first_name,u.last_name) AS user_name,
                       u.avatar_url AS user_avatar_url, c.id AS course_id, c.title AS course_title, cc.completed_at
                FROM course_completion cc JOIN enrollment e ON e.id=cc.enrollment_id
                JOIN app_user u ON u.id=e.user_id JOIN course c ON c.id=e.course_id
                WHERE e.user_id IN (SELECT id FROM friends) AND u.deleted_at IS NULL
                ORDER BY cc.completed_at DESC, cc.id LIMIT 5
                """).param("viewer", viewer).query(FeedItemResponse.class).list();
    }

    public List<LeaderboardEntryResponse> leaderboard(UUID viewer) {
        return jdbc.sql(FRIENDS + """
                , totals AS (
                    SELECT u.id AS user_id, concat_ws(' ',u.first_name,u.last_name) AS user_name,
                           u.avatar_url AS user_avatar_url, count(DISTINCT e.course_id) AS completed_this_week,
                           (u.id=:viewer) AS is_me
                    FROM app_user u
                    LEFT JOIN enrollment e ON e.user_id=u.id AND EXISTS (
                        SELECT 1 FROM course_completion cc WHERE cc.enrollment_id=e.id
                          AND cc.completed_at >= (date_trunc('week',now() AT TIME ZONE 'UTC') AT TIME ZONE 'UTC')
                          AND cc.completed_at <= now())
                    WHERE (u.id=:viewer OR u.id IN (SELECT id FROM friends)) AND u.deleted_at IS NULL
                    GROUP BY u.id
                )
                SELECT row_number() OVER (ORDER BY completed_this_week DESC,user_name,user_id) AS rank, totals.*
                FROM totals ORDER BY rank
                """).param("viewer", viewer).query(LeaderboardEntryResponse.class).list();
    }
}
