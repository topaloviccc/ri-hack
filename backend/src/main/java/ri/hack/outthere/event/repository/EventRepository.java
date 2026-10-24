package ri.hack.outthere.event.repository;

import java.util.List;
import java.util.UUID;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.stereotype.Repository;
import ri.hack.outthere.event.dto.EventResponse;

@Repository
public class EventRepository {
    private final JdbcClient jdbc;

    public EventRepository(JdbcClient jdbc) { this.jdbc = jdbc; }

    public List<EventResponse> events(UUID id) {
        String sql = """
                SELECT e.id, e.name AS title, e.starts_at, p.name AS venue, p.latitude AS lat, p.longitude AS lng,
                       e.description, CASE WHEN u.id IS NULL THEN NULL ELSE concat_ws(' ',u.first_name,u.last_name) END AS organizer,
                       e.is_free, e.external_registration_url AS registration_url
                FROM event e JOIN event_status s ON s.id=e.status_id
                LEFT JOIN place p ON p.id=e.place_id LEFT JOIN app_user u ON u.id=e.organizer_id
                WHERE s.label<>'CANCELLED'
                """;
        if (id != null) sql += " AND e.id=:id";
        var query = jdbc.sql(sql + " ORDER BY e.starts_at, e.id");
        if (id != null) query.param("id", id);
        return query.query(EventResponse.class).list();
    }
}
