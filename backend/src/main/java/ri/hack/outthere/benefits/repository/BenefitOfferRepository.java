package ri.hack.outthere.benefits.repository;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.stereotype.Repository;
import ri.hack.outthere.benefits.dto.BenefitsDtos.Country;
import ri.hack.outthere.benefits.dto.BenefitsDtos.Partner;
import ri.hack.outthere.benefits.dto.BenefitsDtos.Venue;
import ri.hack.outthere.benefits.model.OfferRow;

@Repository
public class BenefitOfferRepository {
    private final JdbcClient jdbc;
    private static final String VENUES = """
            SELECT pv.id,p.name,n.iso_code AS country_code,n.label AS country_name
            FROM offer_venue ov JOIN partner_venue pv ON pv.id=ov.partner_venue_id
            JOIN place p ON p.id=pv.place_id JOIN country n ON n.id=p.country_id
            WHERE ov.offer_id=:offer AND pv.active AND p.archived_at IS NULL ORDER BY pv.id
            """;
    private static final String COLUMNS = """
            SELECT o.id,o.partner_id,p.name AS partner_name,p.logo_url,p.active AS partner_active,p.is_demo,
                o.title,o.subtitle,o.description,o.image_url,o.price_coins,o.terms,o.terms_version,o.status,
                o.starts_at,o.ends_at,o.inventory_total,o.max_per_user,
                (SELECT count(*) FROM coupon_redemption c WHERE c.offer_id=o.id
                 AND (c.status='REDEEMED' OR (c.status='ACTIVE' AND c.expires_at>clock_timestamp()))) AS issued_count,
                (SELECT count(*) FROM coupon_redemption c WHERE c.offer_id=o.id AND c.user_id=:viewer
                 AND (c.status='REDEEMED' OR (c.status='ACTIVE' AND c.expires_at>clock_timestamp()))) AS user_count
            FROM benefit_offer o JOIN partner p ON p.id=o.partner_id
            """;

    public BenefitOfferRepository(JdbcClient jdbc) { this.jdbc = jdbc; }

    public Instant now() { return jdbc.sql("SELECT clock_timestamp()").query(Instant.class).single(); }

    public void lock(UUID id) {
        jdbc.sql("SELECT id FROM benefit_offer WHERE id=:id FOR UPDATE").param("id", id).query(UUID.class).optional();
    }

    public Optional<OfferRow> offer(UUID viewer, UUID id) {
        return jdbc.sql(COLUMNS + " WHERE o.id=:id").param("viewer", viewer).param("id", id)
                .query(OfferRow.class).optional();
    }

    public List<OfferRow> offers(UUID viewer, String search, UUID partner, String country, String order, int page, int size) {
        var query = filtered(COLUMNS, search, partner, country, " ORDER BY " + order + ",o.id LIMIT :size OFFSET :offset");
        return query.param("viewer", viewer).param("size", size).param("offset", (long) page * size)
                .query(OfferRow.class).list();
    }

    public long count(String search, UUID partner, String country) {
        return filtered("SELECT count(*) FROM benefit_offer o JOIN partner p ON p.id=o.partner_id",
                search, partner, country, "").query(Long.class).single();
    }

    private JdbcClient.StatementSpec filtered(String select, String search, UUID partner, String country, String suffix) {
        String sql = select + " WHERE o.status NOT IN ('DRAFT','ARCHIVED') AND p.active";
        if (search != null && !search.isBlank()) {
            sql += " AND position(lower(:search) in lower(concat_ws(' ',o.title,o.subtitle,o.description,p.name)))>0";
        }
        if (partner != null) sql += " AND o.partner_id=:partner";
        if (country != null) sql += """
                 AND EXISTS(SELECT 1 FROM offer_venue ov JOIN partner_venue pv ON pv.id=ov.partner_venue_id
                 JOIN place pl ON pl.id=pv.place_id JOIN country n ON n.id=pl.country_id
                 WHERE ov.offer_id=o.id AND pv.active AND pl.archived_at IS NULL AND n.iso_code=:country)
                """;
        var query = jdbc.sql(sql + suffix);
        if (search != null && !search.isBlank()) query.param("search", search.trim());
        if (partner != null) query.param("partner", partner);
        if (country != null) query.param("country", country);
        return query;
    }

    public List<Venue> venues(UUID offer) { return jdbc.sql(VENUES).param("offer", offer).query(Venue.class).list(); }

    public List<Partner> partners(String country) {
        String sql = """
                SELECT DISTINCT p.id,p.name,p.logo_url,p.is_demo FROM partner p
                JOIN benefit_offer o ON o.partner_id=p.id JOIN offer_venue ov ON ov.offer_id=o.id
                JOIN partner_venue pv ON pv.id=ov.partner_venue_id JOIN place pl ON pl.id=pv.place_id
                JOIN country n ON n.id=pl.country_id WHERE p.active AND pv.active AND pl.archived_at IS NULL
                AND o.status='ACTIVE' AND o.starts_at<=clock_timestamp() AND o.ends_at>clock_timestamp()
                """;
        if (country != null) sql += " AND n.iso_code=:country";
        var query = jdbc.sql(sql + " ORDER BY p.name,p.id");
        if (country != null) query.param("country", country);
        return query.query(Partner.class).list();
    }

    public List<Country> countries(UUID partner) {
        String sql = """
                SELECT DISTINCT n.iso_code AS code,n.label AS name FROM country n
                JOIN place pl ON pl.country_id=n.id JOIN partner_venue pv ON pv.place_id=pl.id
                JOIN partner p ON p.id=pv.partner_id JOIN offer_venue ov ON ov.partner_venue_id=pv.id
                JOIN benefit_offer o ON o.id=ov.offer_id WHERE p.active AND pv.active AND pl.archived_at IS NULL
                AND o.status='ACTIVE' AND o.starts_at<=clock_timestamp() AND o.ends_at>clock_timestamp()
                """;
        if (partner != null) sql += " AND p.id=:partner";
        var query = jdbc.sql(sql + " ORDER BY n.label,n.iso_code");
        if (partner != null) query.param("partner", partner);
        return query.query(Country.class).list();
    }
}
