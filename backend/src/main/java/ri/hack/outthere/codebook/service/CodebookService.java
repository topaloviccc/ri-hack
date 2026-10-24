package ri.hack.outthere.codebook.service;

import java.util.List;
import java.util.Map;
import java.util.TreeMap;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import ri.hack.outthere.codebook.dto.CodebookEntryResponse;
import ri.hack.outthere.codebook.error.CodebookNotFoundException;
import ri.hack.outthere.codebook.model.AbstractCodebook;
import ri.hack.outthere.codebook.model.CodebookEntry;
import ri.hack.outthere.codebook.repository.CodebookRepository;

@Service
@Transactional(readOnly = true)
public class CodebookService {

    private final CodebookRepository repository;
    private final Map<String, AbstractCodebook> definitions;

    public CodebookService(CodebookRepository repository, List<AbstractCodebook> codebooks) {
        this.repository = repository;
        Map<String, AbstractCodebook> registered = new TreeMap<>();
        for (AbstractCodebook codebook : codebooks) {
            if (registered.putIfAbsent(codebook.key(), codebook) != null) {
                throw new IllegalArgumentException("Duplicate codebook key: " + codebook.key());
            }
        }
        this.definitions = java.util.Collections.unmodifiableMap(registered);
    }

    public List<String> listCodebooks() {
        return List.copyOf(definitions.keySet());
    }

    public List<CodebookEntryResponse> listEntries(String key) {
        return repository.findAll(requireRegistered(key)).stream().map(CodebookService::toResponse).toList();
    }

    public CodebookEntryResponse getEntry(String key, long id) {
        return repository.findById(requireRegistered(key), id).map(CodebookService::toResponse)
                .orElseThrow(() -> new CodebookNotFoundException("Codebook entry not found"));
    }

    public CodebookEntryResponse getEntry(String key, String id) {
        var definition = requireRegistered(key);
        if (!definition.uuidIds()) return getEntry(key, Long.parseLong(id));
        return repository.findByUuid(definition, java.util.UUID.fromString(id)).map(CodebookService::toResponse)
                .orElseThrow(() -> new CodebookNotFoundException("Codebook entry not found"));
    }

    private AbstractCodebook requireRegistered(String key) {
        AbstractCodebook definition = definitions.get(key);
        if (definition == null) {
            throw new CodebookNotFoundException("Codebook not found");
        }
        return definition;
    }

    private static CodebookEntryResponse toResponse(CodebookEntry entry) {
        return new CodebookEntryResponse(entry.id(), entry.label());
    }
}
