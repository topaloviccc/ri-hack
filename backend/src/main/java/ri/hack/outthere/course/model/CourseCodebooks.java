package ri.hack.outthere.course.model;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import ri.hack.outthere.codebook.model.AbstractCodebook;

@Configuration(proxyBeanMethods = false)
public class CourseCodebooks {
    @Bean
    AbstractCodebook fields() { return new AbstractCodebook("fields", "field", true) { }; }

    @Bean
    AbstractCodebook difficulties() { return new AbstractCodebook("difficulties", "difficulty", true) { }; }
}
