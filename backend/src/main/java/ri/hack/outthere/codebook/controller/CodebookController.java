package ri.hack.outthere.codebook.controller;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import ri.hack.outthere.codebook.dto.CodebookEntryResponse;
import ri.hack.outthere.codebook.service.CodebookService;

@RestController
@RequestMapping("/api/codebooks")
public class CodebookController {

    private final CodebookService service;

    public CodebookController(CodebookService service) {
        this.service = service;
    }

    @GetMapping
    public List<String> listCodebooks() {
        return service.listCodebooks();
    }

    @GetMapping("/{key}")
    public List<CodebookEntryResponse> listEntries(@PathVariable String key) {
        return service.listEntries(key);
    }

    @GetMapping("/{key}/{id}")
    public CodebookEntryResponse getEntry(@PathVariable String key, @PathVariable String id) {
        return service.getEntry(key, id);
    }
}
