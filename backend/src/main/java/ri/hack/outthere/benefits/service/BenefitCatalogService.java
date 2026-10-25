package ri.hack.outthere.benefits.service;

import java.time.Instant;
import java.util.List;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ri.hack.outthere.benefits.dto.BenefitsDtos.*;
import ri.hack.outthere.benefits.error.BenefitsException;
import ri.hack.outthere.benefits.model.OfferRow;
import ri.hack.outthere.benefits.repository.BenefitOfferRepository;
import ri.hack.outthere.user.service.UserService;

@Service
@Transactional(readOnly = true)
public class BenefitCatalogService {
    private final BenefitOfferRepository repository;
    private final UserService users;

    public BenefitCatalogService(BenefitOfferRepository repository, UserService users) {
        this.repository = repository;
        this.users = users;
    }

    public Page<Offer> list(UUID viewer, String search, UUID partner, String country, String sort, int page, int size) {
        users.requireUser(viewer);
        checkPage(page, size);
        country = country(country);
        if (search != null && search.length() > 200) throw invalid("Search must be at most 200 characters");
        String order = switch (sort) {
            case "POPULAR" -> "o.popularity_rank";
            case "PRICE_ASC" -> "o.price_coins";
            case "PRICE_DESC" -> "o.price_coins DESC";
            case "NEWEST" -> "o.created_at DESC";
            default -> throw invalid("Unknown benefit sort");
        };
        Instant now = repository.now();
        var rows = repository.offers(viewer, search, partner, country, order, page, size);
        return new Page<>(rows.stream().map(row -> map(row, now)).toList(), page, size,
                repository.count(search, partner, country));
    }

    public Offer get(UUID viewer, UUID id) {
        users.requireUser(viewer);
        var row = repository.offer(viewer, id).orElseThrow(BenefitsException::missing);
        if (row.status().equals("DRAFT") || row.status().equals("ARCHIVED")) throw BenefitsException.missing();
        return map(row, repository.now());
    }

    public Offer map(OfferRow row, Instant now) {
        var venues = repository.venues(row.id());
        String availability = "AVAILABLE";
        String reason = null;
        if (!row.partnerActive() || !row.status().equals("ACTIVE") || row.startsAt().isAfter(now) || venues.isEmpty()) {
            availability = "UNAVAILABLE";
            reason = "This offer is currently unavailable";
        }
        if (!row.endsAt().isAfter(now) || row.status().equals("EXPIRED")) {
            availability = "EXPIRED";
            reason = "This offer has expired";
        } else if (row.inventoryTotal() != null && row.issuedCount() >= row.inventoryTotal()) {
            availability = "SOLD_OUT";
            reason = "This offer is sold out";
        } else if (row.userCount() >= row.maxPerUser()) {
            availability = "LIMIT_REACHED";
            reason = "You have reached this offer's coupon limit";
        }
        var countries = venues.stream().map(venue -> new Country(venue.countryCode(), venue.countryName())).distinct().toList();
        return new Offer(row.id(), row.title(), row.subtitle(), row.description(), row.imageUrl(),
                new Partner(row.partnerId(), row.partnerName(), row.logoUrl(), row.isDemo()), countries, venues,
                row.priceCoins(), row.terms(), row.termsVersion(), availability, reason == null, reason, row.isDemo());
    }

    public List<Partner> partners(UUID viewer, String country) {
        users.requireUser(viewer);
        return repository.partners(country(country));
    }

    public List<Country> countries(UUID viewer, UUID partner) {
        users.requireUser(viewer);
        return repository.countries(partner);
    }

    public static void checkPage(int page, int size) {
        if (page < 0 || page > 100000 || size < 1 || size > 50) throw invalid("Invalid page or size (maximum 50)");
    }

    private static String country(String value) {
        if (value == null || value.isBlank()) return null;
        if (!value.matches("[A-Za-z]{2}")) throw invalid("Country must be an ISO alpha-2 code");
        return value.toUpperCase(java.util.Locale.ROOT);
    }

    public static BenefitsException invalid(String message) {
        return new BenefitsException(400, "INVALID_INPUT", message);
    }
}
