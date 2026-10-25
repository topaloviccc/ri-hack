package ri.hack.outthere.course.service;

import java.net.InetSocketAddress;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.concurrent.atomic.AtomicReference;
import com.sun.net.httpserver.HttpServer;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import static org.assertj.core.api.Assertions.*;

class PlaceGeocoderTests {
    HttpServer server;
    PlaceGeocoder geocoder;
    final AtomicReference<String> body = new AtomicReference<>();
    final AtomicReference<String> query = new AtomicReference<>();
    final AtomicReference<String> authorization = new AtomicReference<>();
    static final String PLACE = """
            {"osm_type":"relation","osm_id":123,"lat":"42.424662","lon":"18.771234",
             "address":{"country_code":"me"},"display_name":"Kotor, Montenegro","licence":"OSM attribution"}
            """;

    @BeforeEach void start() throws Exception {
        server = HttpServer.create(new InetSocketAddress("127.0.0.1", 0), 0);
        server.createContext("/search", exchange -> {
            query.set(exchange.getRequestURI().getRawQuery());
            authorization.set(exchange.getRequestHeaders().getFirst("Authorization"));
            byte[] bytes = body.get().getBytes(StandardCharsets.UTF_8);
            exchange.getResponseHeaders().set("Content-Type", "application/json");
            exchange.sendResponseHeaders(200, bytes.length);
            try (var stream = exchange.getResponseBody()) { stream.write(bytes); }
        });
        server.start();
        geocoder = new PlaceGeocoder("http://127.0.0.1:" + server.getAddress().getPort(), "OutThere test", "", 0, "header");
    }
    @AfterEach void stop() { server.stop(0); }

    @Test void restrictsCountryAndUsesVerifiedCoordinatesAndAttribution() {
        body.set("[" + PLACE + "]");
        var result = geocoder.resolve(List.of("Kotor, Montenegro"), "ME").getFirst();
        assertThat(result.identity()).isEqualTo("osm:relation:123");
        assertThat(result.lat()).isEqualByComparingTo("42.424662");
        assertThat(result.attribution()).isEqualTo("OSM attribution");
        assertThat(query.get()).contains("countrycodes=me", "limit=2", "addressdetails=1");
        assertThat(authorization.get()).isNull();
    }

    @Test void sendsMapsCoKeyOnlyInAuthorizationHeaderAndAcceptsStringOsmIds() {
        geocoder = new PlaceGeocoder("http://127.0.0.1:" + server.getAddress().getPort(), "OutThere test", "test-secret", 0, "header");
        body.set("[" + PLACE.replace("\"osm_id\":123", "\"osm_id\":\"123\"") + "]");
        assertThat(geocoder.resolve(List.of("Kotor"), "ME").getFirst().identity()).isEqualTo("osm:relation:123");
        assertThat(authorization.get()).isEqualTo("Bearer test-secret");
        assertThat(query.get()).doesNotContain("test-secret", "api_key");
    }

    @Test void spacesRequestsForTheFreePlan() {
        geocoder = new PlaceGeocoder("http://127.0.0.1:" + server.getAddress().getPort(), "OutThere test", "", 150, "header");
        body.set("[" + PLACE + "]");
        long started = System.nanoTime();
        geocoder.resolve(List.of("Kotor", "Kotor old town"), "ME");
        assertThat(System.nanoTime() - started).isGreaterThanOrEqualTo(java.time.Duration.ofMillis(150).toNanos());
    }

    @Test void supportsMapsCoQueryAuthenticationAndEncodesPlaceNamesAsValues() {
        geocoder = new PlaceGeocoder("http://127.0.0.1:" + server.getAddress().getPort(), "OutThere test", "test-secret", 0, "query");
        body.set("[" + PLACE + "]");
        geocoder.resolve(List.of("Kotor & bay, Montenegro"), "ME");
        assertThat(query.get()).contains("api_key=test-secret", "Kotor%20%26%20bay%2C%20Montenegro");
        assertThat(authorization.get()).isNull();
    }

    @Test void rejectsUnknownAmbiguousWrongCountryAndInvalidCoordinates() {
        for (String invalid : List.of("[]", "[" + PLACE + "," + PLACE + "]",
                "[" + PLACE.replace("\"me\"", "\"hr\"") + "]",
                "[" + PLACE.replace("42.424662", "92") + "]")) {
            body.set(invalid);
            assertThatThrownBy(() -> geocoder.resolve(List.of("Kotor"), "ME")).isInstanceOf(IllegalArgumentException.class);
        }
    }

    @Test void distinguishesMissingAndAmbiguousPlacesByIndexWithoutProviderUrls() {
        body.set("[]");
        assertThatThrownBy(() -> geocoder.resolve(List.of("Kvarner Bay, Rijeka"), "HR"))
                .isInstanceOf(GenerationValidationException.class).hasMessageContaining("places[0]", "No map match", "Kvarner Bay")
                .hasMessageNotContaining("api_key").hasMessageNotContaining("http");
        body.set("[" + PLACE + "," + PLACE + "]");
        assertThatThrownBy(() -> geocoder.resolve(List.of("Kotor"), "ME"))
                .hasMessageContaining("places[0]", "Multiple map matches");
    }
}
