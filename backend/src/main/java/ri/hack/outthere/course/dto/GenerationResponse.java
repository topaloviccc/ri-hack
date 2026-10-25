package ri.hack.outthere.course.dto;

import java.util.UUID;

public record GenerationResponse(UUID id, String query, String state, String message, UUID courseId) { }
