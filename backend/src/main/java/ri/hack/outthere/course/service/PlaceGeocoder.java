package ri.hack.outthere.course.service;

import java.math.BigDecimal;
import java.net.http.HttpClient;
import java.time.Duration;
import java.util.List;
import java.util.Locale;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.client.JdkClientHttpRequestFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import tools.jackson.databind.JsonNode;

/** Nominatim-compatible geocoder. Reject missing, ambiguous and wrong-country matches. */
@Service
public class PlaceGeocoder {
    public record Place(String identity, String name, String address, BigDecimal lat, BigDecimal lng,
                        String attribution) { }
    private final RestClient client;
    private final boolean available;
    private final long minIntervalNanos;
    private final String queryKey;
    private long nextRequestNanos;

    public PlaceGeocoder(@Value("${app.generation.geocoder-url}") String url,
                         @Value("${app.generation.geocoder-user-agent}") String userAgent,
                         @Value("${app.generation.geocoder-api-key}") String apiKey,
                         @Value("${app.generation.geocoder-min-interval-ms}") long minIntervalMs,
                         @Value("${app.generation.geocoder-auth-mode}") String authMode) {
        if (!List.of("header", "query").contains(authMode)) throw new IllegalArgumentException("Invalid geocoder authentication mode");
        if (minIntervalMs < 0 || minIntervalMs > 60000) throw new IllegalArgumentException("Invalid geocoder request interval");
        minIntervalNanos = Duration.ofMillis(minIntervalMs).toNanos();
        available = !url.isBlank();
        var factory = new JdkClientHttpRequestFactory(HttpClient.newBuilder().connectTimeout(Duration.ofSeconds(5)).build());
        factory.setReadTimeout(Duration.ofSeconds(15));
        var builder = RestClient.builder().baseUrl(url.isBlank() ? "http://localhost" : url)
                .requestFactory(factory).defaultHeader("User-Agent", userAgent);
        queryKey = "query".equals(authMode) ? apiKey.strip() : "";
        if (!apiKey.isBlank() && "header".equals(authMode)) builder.defaultHeaders(headers -> headers.setBearerAuth(apiKey.strip()));
        client = builder.build();
    }

    public boolean available() { return available; }

    public List<Place> resolve(List<String> names, String country) {
        // Serial requests; configure a self-hosted or contracted Nominatim endpoint.
        var places = new java.util.ArrayList<Place>();
        for (int i = 0; i < names.size(); i++) places.add(resolve(names.get(i), country, "places[" + i + "]"));
        return List.copyOf(places);
    }

    private Place resolve(String name, String country, String path) {
        awaitPermit();
        JsonNode rows = client.get().uri(builder -> {
            builder.path("/search").queryParam("q", "{name}")
                .queryParam("format", "jsonv2").queryParam("countrycodes", country.toLowerCase(Locale.ROOT))
                .queryParam("addressdetails", 1).queryParam("accept-language", "en").queryParam("limit", 2);
            if (!queryKey.isBlank()) builder.queryParam("api_key", "{key}");
            return builder.build(java.util.Map.of("name", name, "key", queryKey));
        })
                .retrieve().body(JsonNode.class);
        if (rows == null || !rows.isArray()) throw new GenerationValidationException(path, "Map service returned an invalid result");
        if (rows.isEmpty()) throw new GenerationValidationException(path, "No map match for “" + name + "” in " + country);
        if (rows.size() != 1) throw new GenerationValidationException(path, "Multiple map matches for “" + name + "”; use a more precise or alternative place");
        var row = rows.get(0);
        if (!country.equalsIgnoreCase(row.path("address").path("country_code").asText()))
            throw new GenerationValidationException(path, "Map match for “" + name + "” is in a different country");
        String type = row.path("osm_type").asText();
        long id = row.path("osm_id").asLong();
        if (!List.of("node", "way", "relation").contains(type) || id <= 0)
            throw new GenerationValidationException(path, "Map result is missing a geographic identity");
        var lat = new BigDecimal(row.path("lat").asText());
        var lng = new BigDecimal(row.path("lon").asText());
        if (lat.abs().compareTo(BigDecimal.valueOf(90)) > 0 || lng.abs().compareTo(BigDecimal.valueOf(180)) > 0)
            throw new GenerationValidationException(path, "Map result has invalid coordinates");
        String address = row.path("display_name").asText();
        if (address.isBlank()) throw new GenerationValidationException(path, "Map result is missing an address");
        return new Place("osm:" + type + ":" + id, name, address, lat, lng,
                row.path("licence").asText("© OpenStreetMap contributors, ODbL 1.0"));
    }

    private synchronized void awaitPermit() {
        long remaining = nextRequestNanos == 0 ? 0 : nextRequestNanos - System.nanoTime();
        if (remaining > 0) {
            try {
                Thread.sleep(Duration.ofNanos(remaining));
            } catch (InterruptedException interrupted) {
                Thread.currentThread().interrupt();
                throw new IllegalStateException("Geocoding interrupted", interrupted);
            }
        }
        nextRequestNanos = System.nanoTime() + minIntervalNanos;
    }
}
