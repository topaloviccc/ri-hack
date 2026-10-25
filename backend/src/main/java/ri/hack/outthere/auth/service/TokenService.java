package ri.hack.outthere.auth.service;

import java.time.Duration;
import java.time.Instant;
import java.util.UUID;

import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.JwsHeader;
import org.springframework.security.oauth2.jwt.JwtClaimsSet;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;
import org.springframework.stereotype.Service;

@Service
public class TokenService {
    static final Duration VALIDITY = Duration.ofDays(30);

    private final JwtEncoder encoder;

    public TokenService(JwtEncoder encoder) { this.encoder = encoder; }

    public String issue(UUID user, String role) {
        var now = Instant.now();
        var claims = JwtClaimsSet.builder().issuer("outthere").subject(user.toString())
                .issuedAt(now).expiresAt(now.plus(VALIDITY)).claim("role", role).build();
        var header = JwsHeader.with(MacAlgorithm.HS256).build();
        return encoder.encode(JwtEncoderParameters.from(header, claims)).getTokenValue();
    }
}
