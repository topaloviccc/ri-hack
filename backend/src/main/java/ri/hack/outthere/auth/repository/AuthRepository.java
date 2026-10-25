package ri.hack.outthere.auth.repository;

import java.util.Optional;
import java.util.UUID;

import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.stereotype.Repository;

@Repository
public class AuthRepository {
    private final JdbcClient jdbc;

    public AuthRepository(JdbcClient jdbc) { this.jdbc = jdbc; }

    public record Credentials(UUID id, String passwordHash, String role) { }

    public Optional<Credentials> credentials(String email) {
        return jdbc.sql("""
                SELECT id,password_hash,role FROM app_user
                WHERE lower(email)=lower(:email) AND deleted_at IS NULL
                """).param("email", email).query(Credentials.class).optional();
    }

    public boolean usernameTaken(String username) {
        return jdbc.sql("SELECT EXISTS(SELECT 1 FROM app_user WHERE lower(username)=lower(:username))")
                .param("username", username).query(Boolean.class).single();
    }

    public boolean emailTaken(String email) {
        return jdbc.sql("SELECT EXISTS(SELECT 1 FROM app_user WHERE lower(email)=lower(:email))")
                .param("email", email).query(Boolean.class).single();
    }

    public UUID insert(String firstName, String lastName, String username, String email, String passwordHash,
                       String timezone) {
        return jdbc.sql("""
                INSERT INTO app_user(first_name,last_name,username,email,password_hash,timezone)
                VALUES (:firstName,:lastName,:username,:email,:passwordHash,:timezone) RETURNING id
                """).param("firstName", firstName).param("lastName", lastName).param("username", username)
                .param("email", email).param("passwordHash", passwordHash).param("timezone", timezone)
                .query(UUID.class).single();
    }
}
