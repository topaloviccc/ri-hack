package ri.hack.outthere.image.service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.client.JdkClientHttpRequestFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.util.HtmlUtils;
import tools.jackson.databind.JsonNode;
import ri.hack.outthere.image.dto.CoverImageResponse;
import ri.hack.outthere.image.model.ImageCandidate;

@Service
public class CommonsImageSearch {
    /** Commons answered 429; callers should stop calling it until {@code retryAfter} has passed. */
    public static class RateLimited extends IllegalStateException {
        public final Duration retryAfter;
        public RateLimited(Duration retryAfter) { super("Commons rate limit"); this.retryAfter = retryAfter; }
    }

    private final RestClient api;
    private final HttpClient http;
    private final String userAgent;
    public CommonsImageSearch(@Value("${app.images.commons-url}") String url,
                              @Value("${app.images.user-agent}") String userAgent) {
        this.userAgent = userAgent;
        http = HttpClient.newBuilder().connectTimeout(Duration.ofSeconds(5)).followRedirects(HttpClient.Redirect.NEVER).build();
        var factory = new JdkClientHttpRequestFactory(http);
        factory.setReadTimeout(Duration.ofSeconds(15));
        api = RestClient.builder().baseUrl(url).requestFactory(factory).defaultHeader("User-Agent", userAgent).build();
    }

    public List<ImageCandidate> search(String query) {
        var response = api.get().uri(builder -> builder.path("/w/api.php")
                .queryParam("action", "query").queryParam("generator", "search")
                .queryParam("gsrsearch", "{query}").queryParam("gsrnamespace", 6).queryParam("gsrlimit", 6)
                .queryParam("prop", "imageinfo").queryParam("iiprop", "url|size|mime|extmetadata")
                .queryParam("iiurlwidth", 1280).queryParam("format", "json").queryParam("formatversion", 2)
                .build(query)).retrieve()
                .onStatus(status -> status.value() == 429, (request, res) -> {
                    throw new RateLimited(retryAfter(res.getHeaders().getFirst("Retry-After")));
                }).body(JsonNode.class);
        if (response == null || response.has("error")) throw new IllegalStateException("Commons search unavailable");
        var result = new ArrayList<ImageCandidate>();
        for (var page : response.path("query").path("pages")) {
            try {
                if (!page.path("imageinfo").isArray() || page.path("imageinfo").isEmpty()) continue;
                var info = page.path("imageinfo").get(0);
                var metadata = info.path("extmetadata");
                String license = clean(metadata.path("LicenseShortName").path("value").asText(""), 100);
                String licenseUrl = metadata.path("LicenseUrl").path("value").asText("");
                if (licenseUrl.startsWith("//")) licenseUrl = "https:" + licenseUrl;
                if (licenseUrl.startsWith("http://creativecommons.org/")) licenseUrl = "https://" + licenseUrl.substring(7);
                String author = clean(metadata.path("Artist").path("value").asText(""), 1000);
                String url = info.path("thumburl").asText("");
                String source = info.path("descriptionurl").asText("");
                int width = info.path("thumbwidth").asInt(0), height = info.path("thumbheight").asInt(0);
                String mime = info.path("mime").asText("");
                if (!Set.of("image/jpeg", "image/png", "image/webp").contains(mime) || width < 400 || height < 250
                        || !trustedMediaUrl(url) || !trustedUrl(source, "commons.wikimedia.org")
                        || !source.contains("/wiki/File:") || author.isBlank() || !supportedLicense(license, licenseUrl)) continue;
                String title = clean(page.path("title").asText(""), 300);
                String description = clean(metadata.path("ImageDescription").path("value").asText(""), 1500);
                long id = page.path("pageid").asLong(0);
                if (id <= 0 || title.isBlank()) continue;
                var image = new CoverImageResponse(url, source, author, license, licenseUrl, description, width, height);
                result.add(new ImageCandidate("commons:" + id, title, description, image));
            } catch (IllegalArgumentException malformed) {
                // Discard malformed metadata; never trust provider strings as arbitrary fetch targets.
            }
        }
        return List.copyOf(result);
    }

    public boolean reachable(CoverImageResponse image) {
        if (!trustedMediaUrl(image.url())) return false;
        try {
            var response = http.send(HttpRequest.newBuilder(URI.create(image.url())).timeout(Duration.ofSeconds(10))
                    .header("User-Agent", userAgent).method("HEAD", HttpRequest.BodyPublishers.noBody()).build(),
                    HttpResponse.BodyHandlers.discarding());
            if (response.statusCode() == 429) throw new RateLimited(retryAfter(response.headers().firstValue("Retry-After").orElse(null)));
            return response.statusCode() == 200 && response.headers().firstValue("Content-Type")
                    .map(value -> value.startsWith("image/")).orElse(false);
        } catch (InterruptedException interrupted) {
            Thread.currentThread().interrupt();
            throw new IllegalStateException("Image verification interrupted", interrupted);
        } catch (java.io.IOException failure) {
            throw new IllegalStateException("Image verification unavailable");
        }
    }

    static Duration retryAfter(String header) {
        try {
            return Duration.ofSeconds(Math.clamp(Long.parseLong(header.strip()), 1, 3600));
        } catch (RuntimeException missingOrDate) { return Duration.ofSeconds(60); }
    }

    static boolean trustedUrl(String value, String host) {
        try {
            var uri = URI.create(value);
            return "https".equals(uri.getScheme()) && host.equalsIgnoreCase(uri.getHost())
                    && uri.getUserInfo() == null && uri.getPort() == -1;
        } catch (IllegalArgumentException failure) { return false; }
    }

    private static boolean trustedMediaUrl(String value) {
        return trustedUrl(value, "upload.wikimedia.org") || trustedUrl(value, "thumb.wikimedia.org");
    }

    private static boolean supportedLicense(String label, String url) {
        if (!(label.startsWith("CC BY ") || label.startsWith("CC BY-SA ") || label.equals("CC0") || label.equals("Public domain"))) return false;
        if (trustedUrl(url, "creativecommons.org")) return url.contains("/licenses/by/") || url.contains("/licenses/by-sa/") || url.contains("/publicdomain/");
        return label.equals("Public domain") && trustedUrl(url, "commons.wikimedia.org");
    }

    private static String clean(String html, int limit) {
        String text = HtmlUtils.htmlUnescape(html.replaceAll("(?s)<[^>]*>", " ")).replaceAll("\\s+", " ").strip();
        return text.length() <= limit ? text : text.substring(0, limit);
    }
}
