package ri.hack.outthere.auth.dto;

import ri.hack.outthere.user.dto.UserResponse;

public final class AuthDtos {
    private AuthDtos() { }

    public record SignupRequest(String firstName, String lastName, String username, String email,
                                String password, String timezone) { }
    public record LoginRequest(String email, String password) { }
    public record AuthResponse(String token, UserResponse user) { }
}
