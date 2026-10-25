package ri.hack.outthere.image.dto;

import tools.jackson.databind.json.JsonMapper;

/** Provider-owned URLs and attribution; the model can choose a candidate, never supply URLs. */
public record CoverImageResponse(String url, String sourceUrl, String author, String license,
        String licenseUrl, String caption, int width, int height) {
    public static CoverImageResponse parse(JsonMapper json, String value) {
        return value == null ? null : json.readValue(value, CoverImageResponse.class);
    }
}
