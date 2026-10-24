package ri.hack.outthere.codebook;

import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.Test;

import ri.hack.outthere.codebook.dto.CodebookEntryResponse;
import ri.hack.outthere.codebook.error.CodebookNotFoundException;
import ri.hack.outthere.codebook.model.AbstractCodebook;
import ri.hack.outthere.codebook.model.CodebookEntry;
import ri.hack.outthere.codebook.repository.CodebookRepository;
import ri.hack.outthere.codebook.service.CodebookService;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.*;

class CodebookServiceTests {

    private final CodebookRepository repository = mock(CodebookRepository.class);

    private static AbstractCodebook definition(String key) {
        return new AbstractCodebook(key) { };
    }

    @Test
    void listsRegisteredKeysInOrderAndAllowsNoDefinitions() {
        assertThat(new CodebookService(repository, List.of()).listCodebooks()).isEmpty();
        assertThat(new CodebookService(repository, List.of(definition("z"), definition("a")))
                .listCodebooks()).containsExactly("a", "z");
    }

    @Test
    void rejectsDuplicateAndInvalidKeys() {
        assertThatThrownBy(() -> new CodebookService(repository,
                List.of(definition("levels"), definition("levels"))))
                .isInstanceOf(IllegalArgumentException.class).hasMessageContaining("Duplicate");
        for (String key : new String[] {null, "", "Levels", "a/b", "a--b", "a-", "a_b", "a".repeat(55)}) {
            assertThatThrownBy(() -> definition(key)).isInstanceOf(IllegalArgumentException.class);
        }
    }

    @Test
    void refusesUnregisteredKeysBeforeQueryingTheDatabase() {
        var service = new CodebookService(repository, List.of());
        assertThatThrownBy(() -> service.listEntries("hidden"))
                .isInstanceOf(CodebookNotFoundException.class);
        assertThatThrownBy(() -> service.getEntry("hidden", 1))
                .isInstanceOf(CodebookNotFoundException.class);
        verifyNoInteractions(repository);
    }

    @Test
    void mapsEntriesAndScopesLookupsToTheRegisteredCodebook() {
        var definition = definition("course-levels");
        var service = new CodebookService(repository, List.of(definition));
        var entry = new CodebookEntry(1, "Beginner");
        when(repository.findAll(definition)).thenReturn(List.of(entry));
        when(repository.findById(definition, 1)).thenReturn(Optional.of(entry));
        when(repository.findById(definition, 99)).thenReturn(Optional.empty());
        var response = new CodebookEntryResponse(1, "Beginner");
        assertThat(service.listEntries("course-levels")).containsExactly(response);
        assertThat(service.getEntry("course-levels", 1)).isEqualTo(response);
        assertThatThrownBy(() -> service.getEntry("course-levels", 99))
                .isInstanceOf(CodebookNotFoundException.class);
    }

    @Test
    void derivesSafePostgresTableNames() {
        assertThat(definition("course-levels").tableName()).isEqualTo("codebook_course_levels");
        assertThat(definition("a".repeat(54)).tableName()).hasSize(63);
    }
}
