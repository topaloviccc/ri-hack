package ri.hack.outthere.course.service;

import java.util.List;
import java.util.Set;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import ri.hack.outthere.course.model.CourseRow;
import ri.hack.outthere.course.repository.RecommendationRepository.SignalCourse;
import static org.assertj.core.api.Assertions.assertThat;

class RecommendationServiceTests {
    @Test
    void treatsDwellAsWeakerEvidenceThanAnExplicitOpen() {
        UUID source = UUID.randomUUID(), semantic = UUID.randomUUID(), category = UUID.randomUUID();
        UUID interest = UUID.randomUUID(), other = UUID.randomUUID();
        var candidates = List.of(course(semantic), course(category));
        var semanticCourse = new SignalCourse(semantic, Set.of(), new float[] {1, 0}, 0, false);
        var categoryCourse = new SignalCourse(category, Set.of(interest, other), null, 0, false);
        var weak = new SignalCourse(source, Set.of(), new float[] {1, 0}, 0.2, true);
        var explicit = new SignalCourse(source, Set.of(), new float[] {1, 0}, 0.8, true);
        assertThat(RecommendationService.rank(candidates, List.of(weak, semanticCourse, categoryCourse), Set.of(interest))
                .getFirst().id()).isEqualTo(category);
        assertThat(RecommendationService.rank(candidates, List.of(explicit, semanticCourse, categoryCourse), Set.of(interest))
                .getFirst().id()).isEqualTo(semantic);
    }

    private CourseRow course(UUID id) {
        return new CourseRow(id, "Course", null, null, null, "Description", 0, 10, "beginner", null, 0, false, null, false);
    }
}
