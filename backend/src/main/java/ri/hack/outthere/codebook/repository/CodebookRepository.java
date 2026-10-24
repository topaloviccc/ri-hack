package ri.hack.outthere.codebook.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.jdbc.core.RowMapper;

import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.stereotype.Repository;

import ri.hack.outthere.codebook.model.CodebookEntry;
import ri.hack.outthere.codebook.model.AbstractCodebook;

@Repository
public class CodebookRepository {

    private final JdbcClient jdbc;

    public CodebookRepository(JdbcClient jdbc) {
        this.jdbc = jdbc;
    }

    public List<CodebookEntry> findAll(AbstractCodebook codebook) {
        // Identifiers come only from the validated definition, never from request input.
        return jdbc.sql("SELECT id, label FROM " + codebook.tableName() + " ORDER BY id")
                .query(mapper(codebook))
                .list();
    }

    public Optional<CodebookEntry> findById(AbstractCodebook codebook, long id) {
        return jdbc.sql("SELECT id, label FROM " + codebook.tableName() + " WHERE id = :id")
                .param("id", id)
                .query(mapper(codebook))
                .optional();
    }

    public Optional<CodebookEntry> findByUuid(AbstractCodebook codebook, UUID id) {
        return jdbc.sql("SELECT id, label FROM " + codebook.tableName() + " WHERE id = :id")
                .param("id", id).query(mapper(codebook)).optional();
    }

    private static RowMapper<CodebookEntry> mapper(AbstractCodebook codebook) {
        return (rs, row) -> new CodebookEntry(codebook.uuidIds() ? rs.getObject("id", UUID.class)
                : Long.valueOf(rs.getLong("id")), rs.getString("label"));
    }
}
