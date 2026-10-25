package ri.hack.outthere.user.service;

import java.util.List;
import java.util.Objects;
import java.util.UUID;
import java.util.function.BooleanSupplier;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ri.hack.outthere.common.error.ApiException;
import ri.hack.outthere.user.dto.UserResponse;
import ri.hack.outthere.user.model.UserRow;
import ri.hack.outthere.user.repository.UserRepository;

@Service
@Transactional(readOnly = true)
public class UserService {
    private final UserRepository repository;

    public UserService(UserRepository repository) { this.repository = repository; }

    public void requireUser(UUID user) {
        if (!repository.exists(user)) throw ApiException.notFound("User");
    }

    public List<UserResponse> list(UUID viewer, String query, String relation, boolean suggested) {
        requireUser(viewer);
        return repository.users(viewer, null, query).stream()
                .filter(row -> !row.id().equals(viewer))
                .filter(row -> relation == null || row.relation().equals(relation))
                .filter(row -> !suggested || row.relation().equals("none") || row.relation().equals("requested"))
                .limit(suggested ? 10 : Long.MAX_VALUE).map(this::response).toList();
    }

    public UserResponse get(UUID viewer, UUID id) {
        requireUser(viewer);
        return response(repository.users(viewer, id, null).stream().findFirst()
                .orElseThrow(() -> ApiException.notFound("User")));
    }

    @Transactional
    public UserResponse sendFriendRequest(UUID viewer, UUID id) {
        requireUser(viewer);
        requireUser(id);
        // Stable lock ordering serializes requests in both directions without a pair insert race.
        UUID first = viewer.compareTo(id) < 0 ? viewer : id;
        UUID second = viewer.compareTo(id) < 0 ? id : viewer;
        repository.lock(first);
        repository.lock(second);
        var other = repository.users(viewer, id, null).getFirst();
        if (!other.relation().equals("none")) throw ApiException.conflict("Already connected");
        repository.requestFriend(viewer, id);
        return get(viewer, id);
    }

    @Transactional
    public UserResponse acceptFriendRequest(UUID viewer, UUID requester) {
        return update(viewer, requester, () -> repository.updateFriendship(requester, viewer, false, "PENDING", "ACCEPTED"),
                "No pending friend request from this user");
    }

    @Transactional
    public UserResponse declineFriendRequest(UUID viewer, UUID requester) {
        return update(viewer, requester, () -> repository.updateFriendship(requester, viewer, false, "PENDING", "DECLINED"),
                "No pending friend request from this user");
    }

    @Transactional
    public UserResponse cancelFriendRequest(UUID viewer, UUID addressee) {
        return update(viewer, addressee, () -> repository.updateFriendship(viewer, addressee, false, "PENDING", "CANCELLED"),
                "No pending friend request to this user");
    }

    /** Ends an accepted friendship; either friend may send a new request afterwards. */
    @Transactional
    public UserResponse removeFriend(UUID viewer, UUID friend) {
        return update(viewer, friend, () -> repository.updateFriendship(viewer, friend, true, "ACCEPTED", "CANCELLED"),
                "Not friends with this user");
    }

    private UserResponse update(UUID viewer, UUID other, BooleanSupplier change, String conflict) {
        requireUser(viewer);
        requireUser(other);
        if (!change.getAsBoolean()) throw ApiException.conflict(conflict);
        return get(viewer, other);
    }

    private UserResponse response(UserRow row) {
        var completions = repository.completions(row.id());
        var countries = completions.stream().map(UserRepository.CompletionRow::countryCode)
                .filter(Objects::nonNull).distinct().sorted().toList();
        return new UserResponse(row.id(), row.name(), row.handle(), row.avatarUrl(), row.countryCode(),
                new UserResponse.Stats(completions.size(), repository.streak(row.id()), countries.size()),
                countries, repository.inProgress(row.id()),
                completions.stream().map(UserRepository.CompletionRow::courseId).toList(),
                row.relation(), row.mutualFriendsCount());
    }
}
