package ri.hack.outthere.wallet.controller;

import java.util.UUID;
import org.springframework.web.bind.annotation.*;
import ri.hack.outthere.wallet.dto.WalletResponse;
import ri.hack.outthere.wallet.service.WalletService;

@RestController
@RequestMapping("/api")
public class WalletController {
    private final WalletService service;

    public WalletController(WalletService service) { this.service = service; }

    @GetMapping("/wallet")
    public WalletResponse get(@RequestHeader("X-User-Id") UUID viewer) { return service.get(viewer); }

    @PostMapping("/courses/{id}/unlock")
    public WalletResponse unlock(@RequestHeader("X-User-Id") UUID viewer, @PathVariable UUID id,
                                  @RequestHeader("Idempotency-Key") String key) {
        return service.unlock(viewer, id, key);
    }
}
