package ri.hack.outthere.image.service;

import java.net.InetSocketAddress;
import java.nio.charset.StandardCharsets;
import java.util.concurrent.atomic.AtomicReference;
import com.sun.net.httpserver.HttpServer;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import static org.assertj.core.api.Assertions.*;

class CommonsImageSearchTests {
    HttpServer server;
    CommonsImageSearch search;
    final AtomicReference<String> body = new AtomicReference<>();
    final AtomicReference<String> query = new AtomicReference<>();
    static final String RESULT = """
            {"query":{"pages":[{"pageid":42,"title":"File:Trsat Castle.jpg","imageinfo":[{
             "mime":"image/jpeg","thumburl":"https://thumb.wikimedia.org/wikipedia/commons/thumb/a/ab/Castle.jpg/1280px-Castle.jpg",
             "descriptionurl":"https://commons.wikimedia.org/wiki/File:Trsat_Castle.jpg","thumbwidth":1280,"thumbheight":850,
             "extmetadata":{"Artist":{"value":"<a>Alice &amp; Bob</a>"},"LicenseShortName":{"value":"CC BY-SA 4.0"},
              "LicenseUrl":{"value":"https://creativecommons.org/licenses/by-sa/4.0/"},
              "ImageDescription":{"value":"<p>Trsat Castle in Rijeka, Croatia.</p>"}}
            }]}]}}
            """;
    @BeforeEach void start() throws Exception {
        body.set(RESULT);
        server = HttpServer.create(new InetSocketAddress("127.0.0.1", 0), 0);
        server.createContext("/w/api.php", exchange -> {
            query.set(exchange.getRequestURI().getRawQuery());
            byte[] bytes = body.get().getBytes(StandardCharsets.UTF_8);
            exchange.getResponseHeaders().set("Content-Type", "application/json");
            exchange.sendResponseHeaders(200, bytes.length);
            try (var out = exchange.getResponseBody()) { out.write(bytes); }
        });
        server.start();
        search = new CommonsImageSearch("http://127.0.0.1:" + server.getAddress().getPort(), "OutThere test");
    }
    @AfterEach void stop() { server.stop(0); }

    @Test void retrievesActualImagesWithCleanAttributionAndEncodesTheSearch() {
        var candidates = search.search("Trsat & Rijeka");
        assertThat(candidates).singleElement().satisfies(candidate -> {
            assertThat(candidate.id()).isEqualTo("commons:42");
            assertThat(candidate.image().author()).isEqualTo("Alice & Bob");
            assertThat(candidate.description()).isEqualTo("Trsat Castle in Rijeka, Croatia.");
            assertThat(candidate.image().license()).isEqualTo("CC BY-SA 4.0");
            assertThat(candidate.image().url()).startsWith("https://thumb.wikimedia.org/");
        });
        assertThat(query.get()).contains("gsrsearch=Trsat%20%26%20Rijeka", "gsrnamespace=6");
    }

    @Test void rejectsUntrustedUrlsMissingCreditsUnsupportedLicensesAndSmallFiles() {
        for (String invalid : java.util.List.of(
                RESULT.replace("thumb.wikimedia.org", "thumb.wikimedia.org.attacker.test"),
                RESULT.replace("<a>Alice &amp; Bob</a>", ""),
                RESULT.replace("CC BY-SA 4.0", "All rights reserved"),
                RESULT.replace("creativecommons.org", "attacker.test"),
                RESULT.replace("\"thumbwidth\":1280", "\"thumbwidth\":100"))) {
            body.set(invalid);
            assertThat(search.search("Trsat")).isEmpty();
        }
        assertThat(CommonsImageSearch.trustedUrl("https://upload.wikimedia.org@127.0.0.1/photo.jpg", "upload.wikimedia.org")).isFalse();
        assertThat(CommonsImageSearch.trustedUrl("http://upload.wikimedia.org/photo.jpg", "upload.wikimedia.org")).isFalse();
    }

    @Test void distinguishesNoResultsFromProviderFailures() {
        body.set("{\"batchcomplete\":true}");
        assertThat(search.search("unknown")).isEmpty();
        body.set("{\"error\":{\"code\":\"maxlag\"}}");
        assertThatThrownBy(() -> search.search("Trsat")).hasMessage("Commons search unavailable");
    }
}
