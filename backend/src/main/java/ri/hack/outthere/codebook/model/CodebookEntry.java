package ri.hack.outthere.codebook.model;

public record CodebookEntry(Object id, String label) {
    public CodebookEntry(long id, String label) { this(Long.valueOf(id), label); }
}
