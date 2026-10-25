package ri.hack.outthere.auth.service;

import java.nio.charset.StandardCharsets;
import java.time.DateTimeException;
import java.time.ZoneId;
import java.util.UUID;
import java.util.regex.Pattern;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ri.hack.outthere.auth.dto.AuthDtos.AuthResponse;
import ri.hack.outthere.auth.dto.AuthDtos.LoginRequest;
import ri.hack.outthere.auth.dto.AuthDtos.SignupRequest;
import ri.hack.outthere.auth.repository.AuthRepository;
import ri.hack.outthere.common.error.ApiException;
import ri.hack.outthere.user.service.UserService;
import ri.hack.outthere.wallet.service.WalletService;

@Service
public class AuthService {
    private static final String ROLE = "USER";
    private static final String INVALID_LOGIN = "Invalid email or password";
    private static final Pattern USERNAME = Pattern.compile("[A-Za-z0-9._]{3,50}");
    private static final Pattern EMAIL = Pattern.compile("[^@\\s]+@[^@\\s]+\\.[^@\\s]+");

    private final AuthRepository repository;
    private final PasswordEncoder passwords;
    private final TokenService tokens;
    private final UserService users;
    private final WalletService wallets;
    private final long signupBonusCoins;

    public AuthService(AuthRepository repository, PasswordEncoder passwords, TokenService tokens, UserService users,
                       WalletService wallets, @Value("${app.auth.signup-bonus-coins}") long signupBonusCoins) {
        this.repository = repository;
        this.passwords = passwords;
        this.tokens = tokens;
        this.users = users;
        this.wallets = wallets;
        this.signupBonusCoins = signupBonusCoins;
    }

    @Transactional
    public AuthResponse signup(SignupRequest request) {
        var firstName = name(request.firstName(), "First name");
        var lastName = name(request.lastName(), "Last name");
        var username = trim(request.username());
        if (!USERNAME.matcher(username).matches())
            throw ApiException.badRequest("Username must be 3-50 letters, digits, dots or underscores");
        var email = trim(request.email());
        if (email.length() > 255 || !EMAIL.matcher(email).matches()) throw ApiException.badRequest("Enter a valid email");
        var password = request.password() == null ? "" : request.password();
        // BCrypt only uses the first 72 bytes, so longer passwords are rejected rather than truncated.
        if (password.length() < 8 || password.getBytes(StandardCharsets.UTF_8).length > 72)
            throw ApiException.badRequest("Password must be 8 to 72 characters");
        var timezone = timezone(request.timezone());

        if (repository.usernameTaken(username)) throw ApiException.conflict("Username already taken");
        if (repository.emailTaken(email)) throw ApiException.conflict("Email already registered");
        UUID id;
        try {
            id = repository.insert(firstName, lastName, username, email, passwords.encode(password), timezone);
        } catch (DuplicateKeyException race) {
            var message = String.valueOf(race.getMessage());
            throw ApiException.conflict(message.contains("uq_email_ci") ? "Email already registered" : "Username already taken");
        }
        wallets.open(id, signupBonusCoins);
        return new AuthResponse(tokens.issue(id, ROLE), users.get(id, id));
    }

    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest request) {
        if (request.email() == null || request.password() == null) throw ApiException.unauthorized(INVALID_LOGIN);
        var credentials = repository.credentials(request.email().trim())
                .filter(found -> found.passwordHash() != null && passwords.matches(request.password(), found.passwordHash()))
                .orElseThrow(() -> ApiException.unauthorized(INVALID_LOGIN));
        return new AuthResponse(tokens.issue(credentials.id(), credentials.role()), users.get(credentials.id(), credentials.id()));
    }

    private static String trim(String value) { return value == null ? "" : value.trim(); }

    private static String name(String value, String field) {
        var trimmed = trim(value);
        if (trimmed.isEmpty() || trimmed.length() > 100) throw ApiException.badRequest(field + " must be 1-100 characters");
        return trimmed;
    }

    private static String timezone(String value) {
        var trimmed = trim(value);
        if (trimmed.isEmpty()) return "UTC";
        try {
            return ZoneId.of(trimmed).getId();
        } catch (DateTimeException invalid) {
            throw ApiException.badRequest("Unknown timezone");
        }
    }
}
