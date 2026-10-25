package ri.hack.outthere;

import java.util.List;
import java.util.UUID;
import java.util.concurrent.Callable;
import java.util.concurrent.Executors;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.test.context.jdbc.Sql;
import org.springframework.test.web.servlet.MockMvc;
import ri.hack.outthere.wallet.service.WalletService;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@Sql("/db/worldlearn-test-data.sql")
class WorldlearnIntegrationTests extends PostgresTestSupport {
    private static final String ME = "00000000-0000-0000-0000-000000000001";
    private static final String FRIEND = "00000000-0000-0000-0000-000000000002";
    private static final String OTHER = "00000000-0000-0000-0000-000000000003";
    private static final String PAID = "10000000-0000-0000-0000-000000000001";
    private static final String FREE = "10000000-0000-0000-0000-000000000002";
    private static final String STARTED = "10000000-0000-0000-0000-000000000003";

    @Autowired MockMvc mvc;
    @Autowired JdbcClient jdbc;
    @Autowired WalletService wallets;

    @Test
    void allowsExpoWebPreflightWithViewerAndPurchaseHeaders() throws Exception {
        mvc.perform(options("/api/courses/" + PAID + "/unlock")
                        .header("Origin", "http://localhost:8081")
                        .header("Access-Control-Request-Method", "POST")
                        .header("Access-Control-Request-Headers", "x-user-id,idempotency-key"))
                .andExpect(status().isOk())
                .andExpect(header().string("Access-Control-Allow-Origin", "http://localhost:8081"));
    }

    @Test
    void browsesSchemaBackedCoursesAndFiltersWithoutInventingFields() throws Exception {
        mvc.perform(get("/api/courses").header("X-User-Id", ME)).andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(4));
        mvc.perform(get("/api/courses/" + PAID).header("X-User-Id", ME)).andExpect(status().isOk())
                .andExpect(jsonPath("$.subject").value("History"))
                .andExpect(jsonPath("$.unlockCost").value(40))
                .andExpect(jsonPath("$.isUnlocked").value(false))
                .andExpect(jsonPath("$.locations[0].lat").value(42.424662))
                .andExpect(jsonPath("$.imageUrl").doesNotExist());
        mvc.perform(get("/api/courses").header("X-User-Id", ME).param("collection", "continue"))
                .andExpect(status().isOk()).andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].id").value(STARTED)).andExpect(jsonPath("$[0].progress").value(0.5));
        mvc.perform(get("/api/courses").header("X-User-Id", ME).param("ids", STARTED + "," + PAID))
                .andExpect(status().isOk()).andExpect(jsonPath("$[0].id").value(STARTED));
        mvc.perform(get("/api/courses").header("X-User-Id", ME).param("countryCode", "HR"))
                .andExpect(status().isOk()).andExpect(jsonPath("$.length()").value(1));
        mvc.perform(get("/api/courses").header("X-User-Id", ME)
                        .param("locationId", "70000000-0000-0000-0000-000000000001"))
                .andExpect(status().isOk()).andExpect(jsonPath("$[0].id").value(PAID));
        mvc.perform(get("/api/courses").header("X-User-Id", ME).param("ids", ""))
                .andExpect(status().isOk()).andExpect(content().json("[]"));
        mvc.perform(get("/api/courses").header("X-User-Id", ME).param("collection", "recommended"))
                .andExpect(status().isOk()).andExpect(jsonPath("$[0].id").value(FREE));
        mvc.perform(post("/api/courses/" + FREE + "/dismiss").header("X-User-Id", ME))
                .andExpect(status().isNoContent());
        mvc.perform(get("/api/courses").header("X-User-Id", ME).param("collection", "feed"))
                .andExpect(status().isOk()).andExpect(jsonPath("$.length()").value(3));
    }

    @Test
    void servesCountriesLocationsEventsAndUuidCodebooks() throws Exception {
        mvc.perform(get("/api/countries/ME")).andExpect(status().isOk())
                .andExpect(jsonPath("$.courseCount").value(3)).andExpect(jsonPath("$.locationCount").value(1))
                .andExpect(jsonPath("$.blurb").doesNotExist());
        mvc.perform(get("/api/locations").param("countryCode", "ME"))
                .andExpect(status().isOk()).andExpect(jsonPath("$.length()").value(1));
        mvc.perform(get("/api/events")).andExpect(status().isOk())
                .andExpect(jsonPath("$[0].title").value("Museum lecture"))
                .andExpect(jsonPath("$[0].organizer").value("Alex Friend"))
                .andExpect(jsonPath("$[0].startsAt").isString())
                .andExpect(jsonPath("$[0].isFree").value(true))
                .andExpect(jsonPath("$[0].registrationUrl").value("https://example.test/register"));
        mvc.perform(get("/api/events/a0000000-0000-0000-0000-000000000001"))
                .andExpect(status().isOk()).andExpect(jsonPath("$.venue").value("Museum"));
        mvc.perform(get("/api/codebooks/difficulties/08000e35-c398-5283-8335-920c4f7ad08d"))
                .andExpect(status().isOk()).andExpect(jsonPath("$.label").value("BEGINNER"));
        mvc.perform(get("/api/codebooks/fields")).andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2));
        assertThat(jdbc.sql("""
                SELECT count(*) FROM pg_constraint co JOIN pg_class t ON t.oid=co.conrelid
                WHERE co.contype='c' AND co.connamespace='public'::regnamespace
                  AND t.relname IN ('country','field','visibility','difficulty','publication_status',
                    'enrollment_status','wallet_transaction_type','friendship_status','event_status',
                    'app_user','user_interest','place','course','course_field','course_place',
                    'course_version','lesson','wallet','wallet_transaction','course_entitlement',
                    'enrollment','lesson_progress','course_completion','user_course_preference','friendship','event')
                """)
                .query(Long.class).single()).isZero();
        assertThat(jdbc.sql("SELECT count(*) FROM pg_trigger WHERE NOT tgisinternal")
                .query(Long.class).single()).isZero();
    }

    @Test
    void unlocksAtomicallyAndRetriesWithoutDoubleCharging() throws Exception {
        mvc.perform(post("/api/courses/" + PAID + "/unlock").header("X-User-Id", ME).header("Idempotency-Key", "one"))
                .andExpect(status().isOk()).andExpect(content().json("{\"balance\":60,\"heldBalance\":0,\"availableBalance\":60}"));
        mvc.perform(post("/api/courses/" + PAID + "/unlock").header("X-User-Id", ME).header("Idempotency-Key", "one"))
                .andExpect(status().isOk()).andExpect(content().json("{\"balance\":60,\"heldBalance\":0,\"availableBalance\":60}"));
        mvc.perform(post("/api/courses/" + PAID + "/unlock").header("X-User-Id", ME).header("Idempotency-Key", "new"))
                .andExpect(status().isOk()).andExpect(content().json("{\"balance\":60,\"heldBalance\":0,\"availableBalance\":60}"));
        mvc.perform(post("/api/courses/" + FREE + "/unlock").header("X-User-Id", ME).header("Idempotency-Key", "one"))
                .andExpect(status().isConflict());
        mvc.perform(post("/api/courses/" + FREE + "/unlock").header("X-User-Id", ME).header("Idempotency-Key", "free"))
                .andExpect(status().isOk()).andExpect(content().json("{\"balance\":60,\"heldBalance\":0,\"availableBalance\":60}"));
        mvc.perform(get("/api/courses/" + PAID).header("X-User-Id", ME))
                .andExpect(status().isOk()).andExpect(jsonPath("$.isUnlocked").value(true));
        assertThat(jdbc.sql("SELECT count(*) FROM wallet_transaction").query(Long.class).single()).isEqualTo(1);
        assertThat(jdbc.sql("SELECT count(*) FROM course_entitlement WHERE user_id=:user")
                .param("user", UUID.fromString(ME)).query(Long.class).single()).isEqualTo(3);
    }

    @Test
    void concurrentPurchasesChargeOnceAndSerializeBalanceUpdates() throws Exception {
        Callable<Long> first = () -> wallets.unlock(UUID.fromString(ME),UUID.fromString(PAID),"race1").balance();
        Callable<Long> second = () -> wallets.unlock(UUID.fromString(ME),UUID.fromString(PAID),"race2").balance();
        try (var executor = Executors.newFixedThreadPool(2)) {
            for (var future : executor.invokeAll(List.of(first, second))) assertThat(future.get()).isEqualTo(60);
        }
        assertThat(jdbc.sql("SELECT count(*) FROM wallet_transaction").query(Long.class).single()).isEqualTo(1);
    }

    @Test
    void rejectsUnaffordableUnlockWithoutAnyWrites() throws Exception {
        mvc.perform(post("/api/courses/10000000-0000-0000-0000-000000000004/unlock")
                        .header("X-User-Id", ME).header("Idempotency-Key", "expensive"))
                .andExpect(status().isPaymentRequired()).andExpect(jsonPath("$.status").value(402));
        mvc.perform(get("/api/wallet").header("X-User-Id", ME))
                .andExpect(status().isOk()).andExpect(content().json("{\"balance\":100,\"heldBalance\":0,\"availableBalance\":100}"));
        assertThat(jdbc.sql("SELECT count(*) FROM wallet_transaction").query(Long.class).single()).isZero();
    }

    @Test
    void rollsBackDebitWhenEntitlementCannotBeStored() {
        // A persistence failure after the debit must roll back both balance and ledger.
        jdbc.sql("ALTER TABLE course_entitlement ADD CONSTRAINT test_no_purchase CHECK (acquisition_kind<>'PURCHASE')").update();
        try {
            org.assertj.core.api.Assertions.assertThatThrownBy(() ->
                    wallets.unlock(UUID.fromString(ME),UUID.fromString(PAID),"rollback"))
                    .isInstanceOf(org.springframework.dao.DataIntegrityViolationException.class);
            assertThat(wallets.get(UUID.fromString(ME)).balance()).isEqualTo(100);
            assertThat(wallets.get(UUID.fromString(ME)).heldBalance()).isZero();
            assertThat(wallets.get(UUID.fromString(ME)).availableBalance()).isEqualTo(100);
            assertThat(jdbc.sql("SELECT count(*) FROM wallet_transaction").query(Long.class).single()).isZero();
        } finally {
            jdbc.sql("ALTER TABLE course_entitlement DROP CONSTRAINT test_no_purchase").update();
        }
    }

    @Test
    void readsProfilesFriendFeedAndWeeklyLeaderboard() throws Exception {
        mvc.perform(get("/api/users/me").header("X-User-Id", ME)).andExpect(status().isOk())
                .andExpect(jsonPath("$.relation").value("me"))
                .andExpect(jsonPath("$.inProgressCourseIds[0]").value(STARTED));
        mvc.perform(get("/api/users/" + FRIEND).header("X-User-Id", ME)).andExpect(status().isOk())
                .andExpect(jsonPath("$.stats.completedCount").value(1))
                .andExpect(jsonPath("$.stats.streakDays").value(1))
                .andExpect(jsonPath("$.badgeCountryCodes[0]").value("ME"));
        mvc.perform(get("/api/users").header("X-User-Id", ME).param("query", "sam"))
                .andExpect(status().isOk()).andExpect(jsonPath("$[0].id").value(OTHER));
        mvc.perform(get("/api/network/feed").header("X-User-Id", ME)).andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1)).andExpect(jsonPath("$[0].userId").value(FRIEND));
        mvc.perform(get("/api/network/leaderboard").header("X-User-Id", ME)).andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2)).andExpect(jsonPath("$[0].userId").value(FRIEND))
                .andExpect(jsonPath("$[0].rank").value(1)).andExpect(jsonPath("$[0].completedThisWeek").value(1));
        mvc.perform(post("/api/users/" + OTHER + "/friend-requests").header("X-User-Id", ME))
                .andExpect(status().isOk()).andExpect(jsonPath("$.relation").value("requested"));
        mvc.perform(post("/api/users/" + OTHER + "/friend-requests").header("X-User-Id", ME))
                .andExpect(status().isConflict());
        mvc.perform(post("/api/users/" + ME + "/friend-requests").header("X-User-Id", ME))
                .andExpect(status().isConflict());
    }

    @Test
    void returnsHttpErrorsForMissingResourcesAndMalformedBindings() throws Exception {
        mvc.perform(get("/api/courses/10000000-0000-0000-0000-000000000099").header("X-User-Id", ME))
                .andExpect(status().isNotFound()).andExpect(jsonPath("$.status").value(404));
        mvc.perform(get("/api/courses")).andExpect(status().isBadRequest());
        mvc.perform(get("/api/courses").header("X-User-Id", ME).param("collection", "unknown"))
                .andExpect(status().isBadRequest());
        mvc.perform(get("/api/courses/bad").header("X-User-Id", ME)).andExpect(status().isBadRequest());
        mvc.perform(get("/api/countries/XX")).andExpect(status().isNotFound());
        mvc.perform(get("/api/codebooks/difficulties/bad")).andExpect(status().isBadRequest());
    }
}
