package ri.hack.outthere.codebook.error;

import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import ri.hack.outthere.codebook.controller.CodebookController;

@RestControllerAdvice(assignableTypes = CodebookController.class)
public class CodebookExceptionHandler {

    @ExceptionHandler(IllegalArgumentException.class)
    public ProblemDetail invalidId(IllegalArgumentException exception) {
        return ProblemDetail.forStatusAndDetail(HttpStatus.BAD_REQUEST, "Invalid codebook ID");
    }

    @ExceptionHandler(CodebookNotFoundException.class)
    public ProblemDetail notFound(CodebookNotFoundException exception) {
        return ProblemDetail.forStatusAndDetail(HttpStatus.NOT_FOUND, exception.getMessage());
    }
}
