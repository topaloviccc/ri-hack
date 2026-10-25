package ri.hack.outthere.course.dto;

public record CountryResponse(String code, String name, String flagUrl, long courseCount, long locationCount,
                              String blurb) { }
