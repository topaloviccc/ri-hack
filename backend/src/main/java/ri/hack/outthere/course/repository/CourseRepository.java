package ri.hack.outthere.course.repository;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.stereotype.Repository;
import ri.hack.outthere.course.dto.LocationResponse;
import ri.hack.outthere.course.model.CourseRow;

@Repository
public class CourseRepository {
    private final JdbcClient jdbc;

    public CourseRepository(JdbcClient jdbc) { this.jdbc = jdbc; }

    public List<CourseRow> courses(UUID viewer, String collection, String countryCode,
                                   UUID locationId, List<UUID> ids) {
        if (ids != null && ids.isEmpty()) return List.of();
        // Ownership is course-wide; progress uses the most recent enrollment's pinned version.
        String sql = """
                SELECT c.id, c.title, c.description, n.iso_code AS country_code, n.label AS country_name,
                  (SELECT f.label FROM course_field cf JOIN field f ON f.id=cf.field_id
                   WHERE cf.course_id=c.id ORDER BY f.label, f.id LIMIT 1) AS subject,
                  (SELECT count(DISTINCT en.user_id) FROM enrollment en WHERE en.course_id=c.id) AS learner_count,
                  c.estimated_minutes, lower(d.label) AS difficulty,
                  CASE WHEN e.first_opened_at IS NULL THEN NULL
                       WHEN e.completed_at IS NOT NULL THEN 1.0
                       ELSE ((SELECT count(*) FROM lesson_progress lp
                              WHERE lp.enrollment_id=e.id AND lp.completed_at IS NOT NULL)
                            + (SELECT count(DISTINCT qa.quiz_id) FROM quiz_attempt qa
                               WHERE qa.enrollment_id=e.id AND qa.submitted_at IS NOT NULL))::float8
                            / nullif((SELECT count(*) FROM lesson l WHERE l.course_version_id=e.course_version_id)
                              + (SELECT count(*) FROM quiz q WHERE q.course_version_id=e.course_version_id),0)
                       END AS progress,
                  c.price_coins AS unlock_cost, (ce.id IS NOT NULL) AS unlocked
                FROM course c LEFT JOIN country n ON n.id=c.country_id
                JOIN difficulty d ON d.id=c.difficulty_id
                JOIN visibility vis ON vis.id=c.visibility_id
                LEFT JOIN course_version v ON v.id=c.current_published_version_id
                LEFT JOIN publication_status ps ON ps.id=v.publication_status_id
                LEFT JOIN course_entitlement ce ON ce.course_id=c.id AND ce.user_id=:viewer
                LEFT JOIN LATERAL (SELECT en.* FROM enrollment en
                     WHERE en.course_id=c.id AND en.user_id=:viewer
                     ORDER BY en.enrolled_at DESC, en.id DESC LIMIT 1) e ON true
                WHERE ((c.archived_at IS NULL AND vis.label='PUBLIC' AND ps.label='PUBLISHED') OR ce.id IS NOT NULL)
                """;
        if (countryCode != null) sql += " AND n.iso_code=:country";
        if (locationId != null) sql += " AND EXISTS (SELECT 1 FROM course_place cp WHERE cp.course_id=c.id AND cp.place_id=:location)";
        if (ids != null) sql += " AND c.id IN (:ids)";
        if ("continue".equals(collection)) sql += " AND e.first_opened_at IS NOT NULL AND e.completed_at IS NULL";
        if ("recommended".equals(collection) || "feed".equals(collection)) {
            sql += """
                     AND c.archived_at IS NULL AND vis.label='PUBLIC' AND ps.label='PUBLISHED'
                     AND NOT EXISTS (SELECT 1 FROM user_course_preference pref
                         WHERE pref.user_id=:viewer AND pref.course_id=c.id AND pref.is_dismissed)
                    """;
        }
        if ("popular".equals(collection)) {
            sql += """
                     ORDER BY (SELECT count(DISTINCT en.user_id) FROM course_completion cc
                        JOIN enrollment en ON en.id=cc.enrollment_id
                        WHERE en.course_id=c.id AND cc.completed_at>=now()-interval '30 days') DESC,
                        learner_count DESC, c.id LIMIT 5
                    """;
        } else if ("recommended".equals(collection)) {
            sql += """
                     ORDER BY (SELECT coalesce(sum(ui.weight),0) FROM user_interest ui
                       JOIN course_field cf ON cf.field_id=ui.field_id
                       WHERE ui.user_id=:viewer AND cf.course_id=c.id) DESC, c.id
                    """;
        } else {
            sql += " ORDER BY c.created_at DESC, c.id";
        }
        var query = jdbc.sql(sql).param("viewer", viewer);
        if (countryCode != null) query.param("country", countryCode);
        if (locationId != null) query.param("location", locationId);
        if (ids != null) query.param("ids", ids);
        var rows = query.query(CourseRow.class).list();
        // Explicit ID lists are used for profile rows; preserve caller order, as the mock did.
        if (ids == null) return rows;
        var ordered = new ArrayList<CourseRow>();
        for (UUID id : ids) rows.stream().filter(row -> row.id().equals(id)).findFirst().ifPresent(ordered::add);
        return ordered;
    }

    public record CourseLocation(UUID courseId, LocationResponse location) { }

    public List<CourseLocation> locations(List<UUID> courseIds) {
        if (courseIds.isEmpty()) return List.of();
        return jdbc.sql("""
                SELECT cp.course_id, p.id, p.name, n.iso_code, n.label, p.latitude, p.longitude
                FROM course_place cp JOIN place p ON p.id=cp.place_id JOIN country n ON n.id=p.country_id
                WHERE cp.course_id IN (:ids) AND p.archived_at IS NULL ORDER BY p.name, p.id
                """).param("ids", courseIds).query((rs, row) -> new CourseLocation(
                    rs.getObject("course_id", UUID.class), new LocationResponse(rs.getObject("id", UUID.class),
                    rs.getString("name"), rs.getString("iso_code"), rs.getString("label"),
                    rs.getBigDecimal("latitude"), rs.getBigDecimal("longitude")))).list();
    }

    public boolean exists(UUID id) {
        return jdbc.sql("SELECT EXISTS(SELECT 1 FROM course WHERE id=:id)")
                .param("id", id).query(Boolean.class).single();
    }

    public void dismiss(UUID viewer, UUID course) {
        jdbc.sql("""
                INSERT INTO user_course_preference(user_id, course_id, is_dismissed) VALUES (:viewer,:course,true)
                ON CONFLICT(user_id,course_id) DO UPDATE SET is_dismissed=true, updated_at=now()
                """).param("viewer", viewer).param("course", course).update();
    }
}
