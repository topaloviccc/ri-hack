package ri.hack.outthere.benefits.service;

import java.time.Instant;
import org.springframework.stereotype.Service;
import tools.jackson.databind.json.JsonMapper;
import ri.hack.outthere.benefits.dto.BenefitsDtos.*;
import ri.hack.outthere.benefits.model.CouponRow;

@Service
public class CouponViewService {
    private final JsonMapper json;
    public CouponViewService(JsonMapper json) { this.json = json; }

    public String snapshot(Offer offer) { return json.writeValueAsString(offer); }
    public Offer offer(CouponRow row) { return json.readValue(row.offerSnapshot(), Offer.class); }

    public Coupon coupon(CouponRow row, Instant now) {
        return new Coupon(row.id(), effectiveStatus(row, now), offer(row), row.priceCoinsSnapshot(),
                row.issuedAt(), row.expiresAt(), row.redemptionCode(), now);
    }

    public static String effectiveStatus(CouponRow row, Instant now) {
        return row.status().equals("ACTIVE") && !row.expiresAt().isAfter(now) ? "EXPIRED" : row.status();
    }
}
