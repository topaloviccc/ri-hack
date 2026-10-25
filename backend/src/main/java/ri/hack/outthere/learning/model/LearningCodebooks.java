package ri.hack.outthere.learning.model;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import ri.hack.outthere.codebook.model.AbstractCodebook;

@Configuration(proxyBeanMethods = false)
public class LearningCodebooks {
    @Bean
    AbstractCodebook questionTypes() { return new AbstractCodebook("question-types", "question_type", false) { }; }
}
