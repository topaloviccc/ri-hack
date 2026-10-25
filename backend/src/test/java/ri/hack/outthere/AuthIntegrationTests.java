package ri.hack.outthere;

import com.jayway.jsonpath.JsonPath;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.test.context.jdbc.Sql;
import org.springframework.test.web.servlet.MockMvc;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@Sql("/db/worldlearn-test-data.sql")
class AuthIntegrationTests extends PostgresTestSupport {
    private static final String SIGNUP = """
            {"firstName":"Ana","lastName":"Horvat","username":"%s","email":"%s",
             "password":"correct horse","timezone":"Europe/Zagreb"}
            """;

    @Autowired MockMvc mvc;
    @Autowired JdbcClient jdbc;

    @Test
    void signupCreatesARegularUserWithABonusWalletAndAWorkingToken() throws Exception {
        var body = mvc.perform(post("/api/auth/signup").contentType(MediaType.APPLICATION_JSON)
                        .content(SIGNUP.formatted("ana.h", "Ana@Example.test")))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.token").isString())
                .andExpect(jsonPath("$.user.handle").value("ana.h"))
                .andExpect(jsonPath("$.user.relation").value("me"))
                .andReturn().getResponse().getContentAsString();
        String token = JsonPath.read(body, "$.token");

        mvc.perform(get("/api/users/me/interests").header("Authorization", "Bearer " + token))
                .andExpect(status().isOk()).andExpect(jsonPath("$.onboardingComplete").value(false))
                .andExpect(jsonPath("$.fieldIds.length()").value(0));

        mvc.perform(get("/api/wallet").header("Authorization", "Bearer " + token))
                .andExpect(status().isOk()).andExpect(jsonPath("$.balance").value(500));
        assertThat(jdbc.sql("""
                SELECT u.role || ':' || u.timezone || ':' || t.amount FROM app_user u
                JOIN wallet w ON w.user_id=u.id JOIN wallet_transaction t ON t.wallet_id=w.id
                WHERE u.username='ana.h'
                """).query(String.class).single()).isEqualTo("USER:Europe/Zagreb:500");
        assertThat(jdbc.sql("SELECT password_hash FROM app_user WHERE username='ana.h'")
                .query(String.class).single()).startsWith("$2").doesNotContain("correct horse");
    }

    @Test
    void rejectsDuplicateUsernamesAndEmailsIgnoringCase() throws Exception {
        signup("ana.h", "ana@example.test").andExpect(status().isCreated());
        signup("ANA.H", "other@example.test").andExpect(status().isConflict())
                .andExpect(jsonPath("$.detail").value("Username already taken"));
        signup("ana2", "ANA@example.test").andExpect(status().isConflict())
                .andExpect(jsonPath("$.detail").value("Email already registered"));
    }

    @Test
    void validatesSignupFields() throws Exception {
        mvc.perform(post("/api/auth/signup").contentType(MediaType.APPLICATION_JSON).content("""
                        {"firstName":"Ana","lastName":"Horvat","username":"ana.h","email":"ana@example.test","password":"short"}
                        """)).andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.detail").value("Password must be 8 to 72 characters"));
        signup("a b", "ana@example.test").andExpect(status().isBadRequest());
        signup("ana.h", "not-an-email").andExpect(status().isBadRequest());
    }

    @Test
    void logsInWithEmailAndPasswordOnly() throws Exception {
        signup("ana.h", "ana@example.test").andExpect(status().isCreated());
        var body = login("ANA@example.test", "correct horse").andExpect(status().isOk())
                .andExpect(jsonPath("$.user.handle").value("ana.h"))
                .andReturn().getResponse().getContentAsString();
        mvc.perform(get("/api/users/me").header("Authorization", "Bearer " + JsonPath.read(body, "$.token")))
                .andExpect(status().isOk()).andExpect(jsonPath("$.handle").value("ana.h"));

        login("ana@example.test", "wrong password").andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.detail").value("Invalid email or password"));
        login("nobody@example.test", "correct horse").andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.detail").value("Invalid email or password"));
        // Seeded users have no password until one is set.
        var seeded = jdbc.sql("SELECT email FROM app_user WHERE password_hash IS NULL LIMIT 1").query(String.class).single();
        login(seeded, "anything at all").andExpect(status().isUnauthorized());
    }

    @Test
    void requiresAValidTokenEverywhereElse() throws Exception {
        mvc.perform(get("/api/users/me")).andExpect(status().isUnauthorized());
        mvc.perform(get("/api/countries")).andExpect(status().isUnauthorized());
        mvc.perform(get("/api/users/me").header("Authorization", "Bearer not-a-jwt")).andExpect(status().isUnauthorized());
    }

    private org.springframework.test.web.servlet.ResultActions signup(String username, String email) throws Exception {
        return mvc.perform(post("/api/auth/signup").contentType(MediaType.APPLICATION_JSON)
                .content(SIGNUP.formatted(username, email)));
    }

    private org.springframework.test.web.servlet.ResultActions login(String email, String password) throws Exception {
        return mvc.perform(post("/api/auth/login").contentType(MediaType.APPLICATION_JSON)
                .content("{\"email\":\"%s\",\"password\":\"%s\"}".formatted(email, password)));
    }
}
