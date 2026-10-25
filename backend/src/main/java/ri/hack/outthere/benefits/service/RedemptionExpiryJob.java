package ri.hack.outthere.benefits.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import ri.hack.outthere.benefits.repository.CouponRepository;

@Component
public class RedemptionExpiryJob {
    private static final Logger LOG = LoggerFactory.getLogger(RedemptionExpiryJob.class);
    private final CouponRepository coupons;
    private final CouponService service;
    public RedemptionExpiryJob(CouponRepository coupons, CouponService service) {
        this.coupons = coupons;
        this.service = service;
    }

    @Scheduled(fixedDelayString = "${app.benefits.expiry-sweep-ms:30000}", initialDelayString = "${app.benefits.expiry-sweep-ms:30000}")
    public void expire() {
        for (var id : coupons.expired(null, 100)) {
            try { service.expire(id); }
            catch (RuntimeException exception) { LOG.warn("Coupon expiry will be retried for {}", id); }
        }
    }
}
