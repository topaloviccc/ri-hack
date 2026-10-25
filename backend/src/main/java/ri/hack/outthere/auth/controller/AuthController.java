package ri.hack.outthere.auth.controller;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import ri.hack.outthere.auth.dto.AuthDtos.AuthResponse;
import ri.hack.outthere.auth.dto.AuthDtos.LoginRequest;
import ri.hack.outthere.auth.dto.AuthDtos.SignupRequest;
import ri.hack.outthere.auth.service.AuthService;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private final AuthService service;

    public AuthController(AuthService service) { this.service = service; }

    @PostMapping("/signup")
    @ResponseStatus(HttpStatus.CREATED)
    public AuthResponse signup(@RequestBody SignupRequest body) { return service.signup(body); }

    @PostMapping("/login")
    public AuthResponse login(@RequestBody LoginRequest body) { return service.login(body); }
}
