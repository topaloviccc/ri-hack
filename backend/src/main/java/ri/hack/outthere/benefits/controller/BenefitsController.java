package ri.hack.outthere.benefits.controller;

import java.util.List;
import java.util.UUID;
import org.springframework.http.CacheControl;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import ri.hack.outthere.benefits.dto.BenefitsDtos.*;
import ri.hack.outthere.benefits.service.BenefitCatalogService;
import ri.hack.outthere.benefits.service.CouponService;

@RestController
@RequestMapping("/api/benefits")
public class BenefitsController {
    private final BenefitCatalogService catalog;
    private final CouponService coupons;

    public BenefitsController(BenefitCatalogService catalog, CouponService coupons) {
        this.catalog = catalog;
        this.coupons = coupons;
    }

    @GetMapping("/partners")
    public List<Partner> partners(@RequestHeader("X-User-Id") UUID viewer, @RequestParam(required = false) String countryCode) {
        return catalog.partners(viewer, countryCode);
    }

    @GetMapping("/countries")
    public List<Country> countries(@RequestHeader("X-User-Id") UUID viewer, @RequestParam(required = false) UUID partnerId) {
        return catalog.countries(viewer, partnerId);
    }

    @GetMapping("/offers")
    public Page<Offer> offers(@RequestHeader("X-User-Id") UUID viewer, @RequestParam(required = false) String q,
                             @RequestParam(required = false) UUID partnerId, @RequestParam(required = false) String countryCode,
                             @RequestParam(defaultValue = "POPULAR") String sort, @RequestParam(defaultValue = "0") int page,
                             @RequestParam(defaultValue = "20") int size) {
        return catalog.list(viewer, q, partnerId, countryCode, sort, page, size);
    }

    @GetMapping("/offers/{id}")
    public Offer offer(@RequestHeader("X-User-Id") UUID viewer, @PathVariable UUID id) { return catalog.get(viewer, id); }

    @PostMapping("/offers/{id}/activate")
    public ResponseEntity<CouponResult> activate(@RequestHeader("X-User-Id") UUID viewer, @PathVariable UUID id) {
        return ResponseEntity.status(201).cacheControl(CacheControl.noStore()).body(coupons.activate(viewer, id));
    }

    @GetMapping("/coupons")
    public ResponseEntity<Page<Coupon>> history(@RequestHeader("X-User-Id") UUID viewer,
                                               @RequestParam(required = false) String status,
                                               @RequestParam(defaultValue = "0") int page,
                                               @RequestParam(defaultValue = "20") int size) {
        return privateResponse(coupons.history(viewer, status, page, size));
    }

    @GetMapping("/coupons/{id}")
    public ResponseEntity<Coupon> coupon(@RequestHeader("X-User-Id") UUID viewer, @PathVariable UUID id) {
        return privateResponse(coupons.get(viewer, id));
    }

    @PostMapping("/coupons/{id}/mark-used")
    public ResponseEntity<Coupon> markUsed(@RequestHeader("X-User-Id") UUID viewer, @PathVariable UUID id) {
        return privateResponse(coupons.markUsed(viewer, id));
    }

    private <T> ResponseEntity<T> privateResponse(T body) { return ResponseEntity.ok().cacheControl(CacheControl.noStore()).body(body); }
}
