package ri.hack.outthere.user.service;

import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ri.hack.outthere.common.error.ApiException;
import ri.hack.outthere.user.dto.InterestDtos.*;
import ri.hack.outthere.user.repository.InterestRepository;

@Service
@Transactional(readOnly = true)
public class InterestService {
    private final InterestRepository repository;
    private final UserService users;
    public InterestService(InterestRepository repository, UserService users) {
        this.repository = repository;
        this.users = users;
    }
    public InterestResponse get(UUID viewer) {
        users.requireUser(viewer);
        return repository.get(viewer);
    }
    @Transactional
    public InterestResponse save(UUID viewer, InterestRequest request) {
        users.requireUser(viewer);
        if (request.fieldIds() == null || request.fieldIds().size() > 50 || request.fieldIds().stream().anyMatch(java.util.Objects::isNull))
            throw ApiException.badRequest("Choose up to 50 learning categories");
        var ids = request.fieldIds().stream().distinct().toList();
        if (!repository.validFields(ids)) throw ApiException.badRequest("Unknown learning category");
        repository.replace(viewer, ids);
        return repository.get(viewer);
    }
}
