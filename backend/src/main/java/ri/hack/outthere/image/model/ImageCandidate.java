package ri.hack.outthere.image.model;

import ri.hack.outthere.image.dto.CoverImageResponse;

public record ImageCandidate(String id, String title, String description, CoverImageResponse image) { }
