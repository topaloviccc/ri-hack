package ri.hack.outthere.benefits.error;

public class BenefitsException extends RuntimeException {
    private final int status;
    private final String code;

    public BenefitsException(int status, String code, String message) {
        super(message);
        this.status = status;
        this.code = code;
    }

    public int status() { return status; }
    public String code() { return code; }

    public static BenefitsException conflict(String code, String message) {
        return new BenefitsException(409, code, message);
    }

    public static BenefitsException missing() {
        return new BenefitsException(404, "NOT_FOUND", "Benefit or coupon not found");
    }
}
