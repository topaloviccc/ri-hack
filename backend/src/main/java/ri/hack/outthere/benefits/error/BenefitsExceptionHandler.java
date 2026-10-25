package ri.hack.outthere.benefits.error;

import org.springframework.http.ProblemDetail;
import org.springframework.http.HttpStatusCode;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class BenefitsExceptionHandler {
    @ExceptionHandler(BenefitsException.class)
    public ProblemDetail handle(BenefitsException exception) {
        var problem = ProblemDetail.forStatusAndDetail(HttpStatusCode.valueOf(exception.status()), exception.getMessage());
        problem.setProperty("code", exception.code());
        return problem;
    }
}
