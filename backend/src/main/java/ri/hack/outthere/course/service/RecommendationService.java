package ri.hack.outthere.course.service;

import java.util.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import ri.hack.outthere.course.model.CourseRow;
import ri.hack.outthere.course.repository.RecommendationRepository;
import ri.hack.outthere.course.repository.RecommendationRepository.SignalCourse;

@Service
public class RecommendationService {
    private final RecommendationRepository repository;
    private final String model;
    public RecommendationService(RecommendationRepository repository,
            @Value("${app.recommendations.embedding-model}") String model) {
        this.repository = repository;
        this.model = model;
    }

    public List<CourseRow> rank(UUID viewer, List<CourseRow> candidates) {
        return rank(candidates, repository.signals(viewer, model), repository.interests(viewer));
    }

    static List<CourseRow> rank(List<CourseRow> candidates, List<SignalCourse> signals, Set<UUID> interests) {
        Map<UUID, SignalCourse> byId = new HashMap<>();
        signals.forEach(s -> byId.put(s.id(), s));
        var positive = centroid(signals, s -> Math.max(0, s.signal()));
        var negative = centroid(signals, s -> Math.max(0, -s.signal()));
        var explicit = centroid(signals, s -> overlap(s.fields(), interests));
        // Cosine normalizes vector lengths, so apply evidence strength separately:
        // a single quick skip must not have the force of an explicit dismissal.
        double positiveStrength = Math.min(1, signals.stream().mapToDouble(s -> Math.max(0, s.signal())).sum());
        double negativeStrength = Math.min(1, signals.stream().mapToDouble(s -> Math.max(0, -s.signal())).sum());
        Map<UUID, Double> scores = new HashMap<>();
        for (CourseRow course : candidates) {
            var s = byId.get(course.id());
            double score = 0.05 * Math.log1p(course.learnerCount());
            if (s != null) {
                score += 2 * overlap(s.fields(), interests) + 1.2 * cosine(s.vector(), explicit)
                        + 2 * positiveStrength * cosine(s.vector(), positive)
                        - 2.8 * negativeStrength * cosine(s.vector(), negative);
                double fieldSignal = signals.stream().filter(other -> !other.id().equals(s.id()))
                        .mapToDouble(other -> other.signal() * overlap(s.fields(), other.fields())).sum();
                score += 0.5 * Math.clamp(fieldSignal, -1, 1);
                if (s.seen()) score -= 0.4;
            }
            // Completed courses remain accessible through the library and profile.
            if (course.progress() != null && course.progress().doubleValue() >= 1) score -= 4;
            scores.put(course.id(), score);
        }
        var remaining = new ArrayList<>(candidates);
        remaining.sort(Comparator.<CourseRow>comparingDouble(c -> scores.get(c.id())).reversed()
                .thenComparing(c -> c.id().toString()));
        var ranked = new ArrayList<CourseRow>();
        Set<UUID> covered = new HashSet<>();
        while (!remaining.isEmpty()) {
            int selected = 0;
            // Every fifth item explores an uncovered category, while preserving
            // the learned ordering within those exploration candidates.
            if (ranked.size() % 5 == 4) {
                for (int i = 0; i < remaining.size(); i++) {
                    var s = byId.get(remaining.get(i).id());
                    if (s != null && s.fields().stream().anyMatch(f -> !covered.contains(f))) {
                        selected = i;
                        break;
                    }
                }
            }
            var course = remaining.remove(selected);
            ranked.add(course);
            var signal = byId.get(course.id());
            if (signal != null) covered.addAll(signal.fields());
        }
        return ranked;
    }

    private static double overlap(Set<UUID> fields, Set<UUID> desired) {
        if (fields.isEmpty() || desired.isEmpty()) return 0;
        return fields.stream().filter(desired::contains).count() / (double) fields.size();
    }

    private static float[] centroid(List<SignalCourse> courses, java.util.function.ToDoubleFunction<SignalCourse> weight) {
        float[] result = null;
        for (var course : courses) {
            double w = weight.applyAsDouble(course);
            float[] vector = course.vector();
            if (w <= 0 || vector == null) continue;
            if (result == null) result = new float[vector.length];
            if (result.length != vector.length) continue;
            double norm = 0;
            for (float v : vector) norm += v * (double) v;
            if (norm == 0) continue;
            for (int i = 0; i < result.length; i++) result[i] += w * vector[i] / Math.sqrt(norm);
        }
        return result;
    }

    static double cosine(float[] a, float[] b) {
        if (a == null || b == null || a.length != b.length) return 0;
        double dot = 0, aa = 0, bb = 0;
        for (int i = 0; i < a.length; i++) {
            dot += a[i] * (double) b[i]; aa += a[i] * (double) a[i]; bb += b[i] * (double) b[i];
        }
        return aa == 0 || bb == 0 ? 0 : Math.max(0, dot / Math.sqrt(aa * bb));
    }
}
