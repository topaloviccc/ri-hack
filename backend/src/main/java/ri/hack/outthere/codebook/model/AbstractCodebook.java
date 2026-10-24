package ri.hack.outthere.codebook.model;

/** Extend and annotate with {@code @Component} to expose a read-only codebook. */
public abstract class AbstractCodebook {

    private final String key;
    private final String tableName;
    private final boolean uuidIds;

    protected AbstractCodebook(String key) {
        this(key, "codebook_" + (key == null ? "" : key.replace('-', '_')), false);
    }

    /** Explicit schema mapping; identifiers are trusted definitions, never HTTP input. */
    protected AbstractCodebook(String key, String tableName, boolean uuidIds) {
        if (key == null || key.length() > 54 || !key.matches("[a-z][a-z0-9]*(?:-[a-z0-9]+)*")) {
            throw new IllegalArgumentException("Codebook key must be lowercase kebab-case, at most 54 characters");
        }
        this.key = key;
        if (tableName == null || tableName.length() > 63 || !tableName.matches("[a-z][a-z0-9_]*")) {
            throw new IllegalArgumentException("Invalid codebook table name");
        }
        this.tableName = tableName;
        this.uuidIds = uuidIds;
    }

    public final String key() {
        return key;
    }

    public final String tableName() {
        return tableName;
    }

    public final boolean uuidIds() { return uuidIds; }
}
