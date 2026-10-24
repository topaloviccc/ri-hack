package ri.hack.outthere.codebook;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.context.annotation.Import;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import ri.hack.outthere.PostgresTestSupport;
import ri.hack.outthere.codebook.model.AbstractCodebook;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest(properties = "spring.liquibase.change-log=classpath:db/codebook-test-changelog.xml")
@AutoConfigureMockMvc
@Import({CodebookIntegrationTests.Levels.class, CodebookIntegrationTests.Empty.class})
@Transactional
class CodebookIntegrationTests extends PostgresTestSupport {

    @Autowired MockMvc mvc;
    @Autowired JdbcClient jdbc;

    @TestConfiguration(proxyBeanMethods = false)
    static class Levels extends AbstractCodebook {
        Levels() { super("course-levels"); }
    }

    @TestConfiguration(proxyBeanMethods = false)
    static class Empty extends AbstractCodebook {
        Empty() { super("empty"); }
    }

    @BeforeEach
    void seed() {
        jdbc.sql("""
                INSERT INTO codebook_course_levels (id, label) VALUES
                (30, 'Last'), (20, 'Second'), (10, 'First')
                """).update();
        jdbc.sql("INSERT INTO codebook_hidden (id, label) VALUES (10, 'Private')").update();
    }

    @Test
    void discoversDefinitionsAndOrdersOnlyTheirEntries() throws Exception {
        mvc.perform(get("/api/codebooks")).andExpect(status().isOk())
                .andExpect(content().json("[\"course-levels\",\"difficulties\",\"empty\",\"fields\"]"));
        mvc.perform(get("/api/codebooks/course-levels")).andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(3))
                .andExpect(jsonPath("$[0].id").value(10))
                .andExpect(jsonPath("$[1].id").value(20))
                .andExpect(jsonPath("$[2].id").value(30))
                .andExpect(jsonPath("$[0].code").doesNotExist())
                .andExpect(jsonPath("$[0].sortOrder").doesNotExist());
        mvc.perform(get("/api/codebooks/empty")).andExpect(status().isOk())
                .andExpect(content().json("[]"));
    }

    @Test
    void scopesItemLookupAndReturnsProblemDetailsForMissingData() throws Exception {
        mvc.perform(get("/api/codebooks/course-levels/10")).andExpect(status().isOk())
                .andExpect(content().json("""
                        {"id":10,"label":"First"}
                        """));
        for (String path : new String[] {"hidden", "hidden/10", "course-levels/99", "empty/10"}) {
            mvc.perform(get("/api/codebooks/" + path)).andExpect(status().isNotFound())
                    .andExpect(content().contentTypeCompatibleWith("application/problem+json"))
                    .andExpect(jsonPath("$.status").value(404));
        }
        mvc.perform(get("/api/codebooks/course-levels/invalid")).andExpect(status().isBadRequest());
        mvc.perform(post("/api/codebooks/course-levels")).andExpect(status().isMethodNotAllowed());
    }

    @Test
    void enforcesIdUniqueness() {
        assertThatThrownBy(() -> jdbc.sql("""
                INSERT INTO codebook_course_levels (id, label) VALUES (10, 'Duplicate')
                """).update()).isInstanceOf(DataIntegrityViolationException.class);
    }

    @Test
    void rejectsBlankLabels() {
        assertThatThrownBy(() -> jdbc.sql("""
                INSERT INTO codebook_course_levels (id, label) VALUES (40, '   ')
                """).update()).isInstanceOf(DataIntegrityViolationException.class);
    }

    @Test
    void tablesHaveExactlyIdAndLabel() {
        var columns = jdbc.sql("""
                SELECT column_name FROM information_schema.columns
                WHERE table_schema = 'public' AND table_name = 'codebook_course_levels'
                ORDER BY ordinal_position
                """).query(String.class).list();
        org.assertj.core.api.Assertions.assertThat(columns).containsExactly("id", "label");
    }
}
