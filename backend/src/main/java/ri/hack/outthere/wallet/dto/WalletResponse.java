package ri.hack.outthere.wallet.dto;

public record WalletResponse(long balance, long heldBalance, long availableBalance) { }
