package ri.hack.outthere.course.service;

import java.util.List;
import java.util.stream.IntStream;
import ri.hack.outthere.course.dto.GeneratedCourse;
import ri.hack.outthere.course.dto.GeneratedCourse.*;

public final class GeneratedCourseFixtures {
    private GeneratedCourseFixtures() { }

    public static GeneratedCourse course() {
        return new GeneratedCourse(null, "Kotor's maritime history", "Explore Kotor's maritime heritage.", "ME",
                "Kotor's local history is rooted in Montenegro.", "History", "BEGINNER", 25,
                List.of("Explain Kotor's maritime heritage", "Locate Kotor's old town"), List.of("Kotor, Montenegro"),
                IntStream.rangeClosed(1, 3).mapToObj(i -> new Lesson("Lesson " + i,
                        "## Kotor's maritime heritage\n\n" + "Kotor is a coastal town in Montenegro with a maritime history. ".repeat(8),
                        5, quiz(2))).toList(), quiz(5));
    }

    public static Quiz quiz(int count) {
        return new Quiz("Knowledge check", IntStream.range(0, count).mapToObj(i -> new Question("SINGLE_CHOICE",
                "Which country is Kotor in?", "Kotor is in Montenegro.",
                List.of(new Option("Montenegro", true), new Option("Italy", false)))).toList());
    }

    public static GeneratedCourse refusal() {
        return new GeneratedCourse("This global topic has no dominant country. Try a local tradition.",
                null, null, null, null, null, null, null, null, null, null, null);
    }
}
