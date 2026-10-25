package ri.hack.outthere.course.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.stereotype.Repository;
import tools.jackson.databind.json.JsonMapper;
import ri.hack.outthere.image.dto.CoverImageResponse;
import ri.hack.outthere.course.dto.CountryResponse;
import ri.hack.outthere.course.dto.LocationResponse;

@Repository
public class GeographyRepository {
    private final JdbcClient jdbc;
    private final JsonMapper json;

    public GeographyRepository(JdbcClient jdbc, JsonMapper json) { this.jdbc = jdbc; this.json = json; }

    public List<CountryResponse> countries() {
        return jdbc.sql("""
                SELECT n.iso_code AS code, n.label AS name, n.flag_url,
                  (SELECT count(*) FROM course c JOIN course_version v ON v.id=c.current_published_version_id
                   JOIN visibility vis ON vis.id=c.visibility_id
                   JOIN publication_status ps ON ps.id=v.publication_status_id
                   WHERE c.country_id=n.id AND c.archived_at IS NULL
                     AND vis.label='PUBLIC' AND ps.label='PUBLISHED') AS course_count,
                  (SELECT count(*) FROM place p WHERE p.country_id=n.id AND p.archived_at IS NULL) AS location_count,
                  n.blurb
                FROM country n ORDER BY n.label, n.iso_code
                """).query(CountryResponse.class).list();
    }

    public List<LocationResponse> locations(String countryCode, List<UUID> ids) {
        String sql = """
                SELECT p.id, p.name, n.iso_code AS country_code, n.label AS country_name,
                       p.latitude AS lat, p.longitude AS lng, p.image_url, p.kind, p.city,
                       p.geocoder_attribution, p.cover_image::text AS cover_image,
                       EXISTS(SELECT 1 FROM cover_image_job im WHERE im.place_id=p.id AND im.state IN ('QUEUED','RUNNING')) AS cover_image_pending
                FROM place p JOIN country n ON n.id=p.country_id
                WHERE p.archived_at IS NULL
                """;
        if (countryCode != null) sql += " AND n.iso_code=:country";
        if (ids != null) {
            if (ids.isEmpty()) return List.of();
            sql += " AND p.id IN (:ids)";
        }
        var query = jdbc.sql(sql + " ORDER BY p.name, p.id");
        if (countryCode != null) query.param("country", countryCode);
        if (ids != null) query.param("ids", ids);
        return query.query((rs, row) -> new LocationResponse(rs.getObject("id", UUID.class), rs.getString("name"),
                rs.getString("country_code"), rs.getString("country_name"), rs.getBigDecimal("lat"), rs.getBigDecimal("lng"),
                rs.getString("image_url"), rs.getString("kind"), rs.getString("city"), rs.getString("geocoder_attribution"), CoverImageResponse.parse(json, rs.getString("cover_image")),
                rs.getBoolean("cover_image_pending"))).list();
    }

    public Optional<LocationResponse> location(UUID id) {
        return locations(null, List.of(id)).stream().findFirst();
    }
}
