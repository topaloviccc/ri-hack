package ri.hack.outthere;

import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.test.context.jdbc.Sql;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;
import static org.assertj.core.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@Sql("/db/worldlearn-test-data.sql")
class BadgeIntegrationTests extends PostgresTestSupport {
    static final UUID ME=UUID.fromString("00000000-0000-0000-0000-000000000001");
    static final UUID ALEX=UUID.fromString("00000000-0000-0000-0000-000000000002");
    // Seeded by the 010-badges changelog, so it survives the test data's truncation.
    static final UUID TRSAT=UUID.fromString("b7000000-0000-4000-8000-000000000001");
    @Autowired JdbcClient jdbc;
    @Autowired MockMvc mvc;

    ResultActions scan(UUID viewer, String code) throws Exception {
        return mvc.perform(post("/api/badges/scan").with(viewer(viewer))
                .contentType("application/json").content("{\"code\":\"" + code + "\"}"));
    }
    long balance(UUID user) {
        return jdbc.sql("SELECT balance FROM wallet WHERE user_id=:user").param("user", user).query(Long.class).single();
    }
    long count(String table) { return jdbc.sql("SELECT count(*) FROM "+table).query(Long.class).single(); }

    // The test data truncates place with CASCADE, which empties nfc_tag (it references place).
    @BeforeEach void restoreSeededTag() {
        jdbc.sql("INSERT INTO nfc_tag(badge_id,public_code) VALUES (:badge,'trsat-stairs') ON CONFLICT DO NOTHING")
                .param("badge", TRSAT).update();
    }

    @Test void firstScanCollectsTheBadgeAndPaysOnceRepeatScansPayNothing() throws Exception {
        scan(ME, "trsat-stairs").andExpect(status().isOk())
                .andExpect(jsonPath("$.newlyCollected").value(true)).andExpect(jsonPath("$.awardedCoins").value(10))
                .andExpect(jsonPath("$.badge.name").value("Trsat Stairs"))
                .andExpect(jsonPath("$.badge.collected").value(true))
                .andExpect(jsonPath("$.badge.story").value(org.hamcrest.Matchers.startsWith("There is a popular tale")))
                .andExpect(jsonPath("$.badge.countryCode").value("HR"));
        assertThat(balance(ME)).isEqualTo(110);

        scan(ME, "trsat-stairs").andExpect(status().isOk())
                .andExpect(jsonPath("$.newlyCollected").value(false)).andExpect(jsonPath("$.awardedCoins").value(0))
                .andExpect(jsonPath("$.badge.awardedCoins").value(10));
        assertThat(balance(ME)).isEqualTo(110);
        assertThat(count("user_badge")).isEqualTo(1);
        assertThat(jdbc.sql("""
                SELECT count(*) FROM wallet_transaction t JOIN wallet_transaction_type y ON y.id=t.type_id
                WHERE y.label='NFC_VISIT'""").query(Long.class).single()).isEqualTo(1);
    }

    @Test void unknownInactiveAndRevokedTagsAwardNothing() throws Exception {
        jdbc.sql("""
                INSERT INTO nfc_tag(badge_id,public_code,status_id) VALUES
                 (:badge,'old-tag',(SELECT id FROM nfc_tag_status WHERE label='REVOKED')),
                 (:badge,'spare-tag',(SELECT id FROM nfc_tag_status WHERE label='INACTIVE'))
                """).param("badge", TRSAT).update();
        scan(ME, "no-such-tag").andExpect(status().isNotFound());
        scan(ME, "old-tag").andExpect(status().isNotFound());
        scan(ME, "spare-tag").andExpect(status().isNotFound());
        scan(ME, " ").andExpect(status().isBadRequest());
        assertThat(count("user_badge")).isZero();
        assertThat(balance(ME)).isEqualTo(100);
    }

    @Test void storyIsHiddenUntilCollectedAndProfilesListCollectedBadges() throws Exception {
        mvc.perform(get("/api/badges/"+TRSAT).with(viewer(ME))).andExpect(status().isOk())
                .andExpect(jsonPath("$.collected").value(false))
                .andExpect(jsonPath("$.story").doesNotExist())
                .andExpect(jsonPath("$.hook").value("The Devil mixed up the stairs. Do you think you can count them?"));
        mvc.perform(get("/api/users/"+ALEX+"/badges").with(viewer(ME))).andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(0));

        scan(ALEX, "trsat-stairs").andExpect(status().isOk());
        mvc.perform(get("/api/users/"+ALEX+"/badges").with(viewer(ME))).andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(TRSAT.toString()))
                .andExpect(jsonPath("$[0].collectedAt").exists());
        // A friend having it doesn't reveal the story to the viewer.
        mvc.perform(get("/api/badges/"+TRSAT).with(viewer(ME))).andExpect(jsonPath("$.story").doesNotExist());
        mvc.perform(get("/api/users/"+UUID.randomUUID()+"/badges").with(viewer(ME))).andExpect(status().isNotFound());
    }
}
