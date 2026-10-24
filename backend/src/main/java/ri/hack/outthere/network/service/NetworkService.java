package ri.hack.outthere.network.service;

import java.util.List;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ri.hack.outthere.network.dto.*;
import ri.hack.outthere.network.repository.NetworkRepository;
import ri.hack.outthere.user.service.UserService;

@Service
@Transactional(readOnly = true)
public class NetworkService {
    private final NetworkRepository repository;
    private final UserService users;

    public NetworkService(NetworkRepository repository, UserService users) {
        this.repository = repository;
        this.users = users;
    }

    public List<FeedItemResponse> feed(UUID viewer) { users.requireUser(viewer); return repository.feed(viewer); }
    public List<LeaderboardEntryResponse> leaderboard(UUID viewer) { users.requireUser(viewer); return repository.leaderboard(viewer); }
}
