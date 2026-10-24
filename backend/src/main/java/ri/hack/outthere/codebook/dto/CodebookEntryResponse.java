package ri.hack.outthere.codebook.dto;

public record CodebookEntryResponse(Object id, String label) {
    public CodebookEntryResponse(long id, String label) { this(Long.valueOf(id), label); }
}
