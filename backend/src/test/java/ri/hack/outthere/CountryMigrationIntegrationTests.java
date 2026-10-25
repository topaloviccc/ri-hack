package ri.hack.outthere;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.test.web.servlet.MockMvc;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest(properties = "spring.liquibase.change-log=classpath:db/country-upgrade-changelog.xml")
@AutoConfigureMockMvc
class CountryMigrationIntegrationTests extends PostgresTestSupport {
    @Autowired JdbcClient jdbc;
    @Autowired MockMvc mvc;

    @Test
    void upgradesExistingCountriesWithoutBreakingReferencesOrSeedingDemoAccounts() throws Exception {
        assertThat(jdbc.sql("SELECT id::text FROM country WHERE iso_code='ME'")
                .query(String.class).single()).isEqualTo("80000000-0000-0000-0000-000000000001");
        assertThat(jdbc.sql("SELECT n.label FROM app_user u JOIN country n ON n.id=u.country_id")
                .query(String.class).single()).isEqualTo("Montenegro");
        assertThat(jdbc.sql("SELECT balance FROM wallet").query(Long.class).single()).isEqualTo(123);
        assertThat(jdbc.sql("SELECT count(*) FROM app_user").query(Long.class).single()).isEqualTo(1);
        mvc.perform(get("/api/countries")).andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(249));
        mvc.perform(get("/api/countries/ME")).andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value("ME"))
                .andExpect(jsonPath("$.name").value("Montenegro"))
                .andExpect(jsonPath("$.flagUrl").value("https://flagcdn.com/w160/me.png"))
                .andExpect(jsonPath("$.courseCount").value(0));
        mvc.perform(get("/api/countries/US")).andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("United States"));
        mvc.perform(get("/api/countries/XX")).andExpect(status().isNotFound());
    }

    @Test
    void everyProductionCountryHasAHostedFlagUrl() {
        var urls = jdbc.sql("SELECT flag_url FROM country").query(String.class).list();
        assertThat(urls).hasSize(249).doesNotHaveDuplicates();
        for (String url : urls) {
            assertThat(url).matches("https://flagcdn\\.com/w160/[a-z]{2}\\.png");
        }
    }
}
