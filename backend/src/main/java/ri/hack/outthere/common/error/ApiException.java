package ri.hack.outthere.common.error;

public class ApiException extends RuntimeException {
    public enum Kind { NOT_FOUND, CONFLICT, INSUFFICIENT_COINS, BAD_REQUEST, UNAUTHORIZED }

    private final Kind kind;

    public ApiException(Kind kind, String message) {
        super(message);
        this.kind = kind;
    }

    public Kind kind() { return kind; }

    public static ApiException notFound(String resource) {
        return new ApiException(Kind.NOT_FOUND, resource + " not found");
    }

    public static ApiException conflict(String message) {
        return new ApiException(Kind.CONFLICT, message);
    }

    public static ApiException badRequest(String message) {
        return new ApiException(Kind.BAD_REQUEST, message);
    }

    public static ApiException unauthorized(String message) {
        return new ApiException(Kind.UNAUTHORIZED, message);
    }
}
