package ri.hack.outthere.course.service;

/** Safe diagnostic text authored by the application, never a raw provider error or URL. */
public class GenerationValidationException extends IllegalArgumentException {
    private final String path;
    private final String reason;
    public GenerationValidationException(String path, String reason) {
        super(path + ": " + reason);
        this.path = path;
        this.reason = reason;
    }
    public String path() { return path; }
    public String reason() { return reason; }
}
