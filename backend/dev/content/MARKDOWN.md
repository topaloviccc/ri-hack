# Lesson Markdown contract

The main learning material is Markdown source. Sample lessons are authored as
UTF-8 `.md` files; the seed copies their contents into the existing JSONB column:

```json
{
  "format": "markdown",
  "markdown": "## Read the landscape\n\n**Observe** before explaining.",
  "estimatedMinutes": 6,
  "demo": true
}
```

Use `lesson.content_json.markdown` for future generated material. The backend
returns the source unchanged in the existing lesson response's `text` field.
Legacy `content_json.text` remains readable, so existing content is compatible.
No bucket, upload service or LLM integration is involved.

## Supported writing tools

- Headings `#` through `######`, paragraphs, **bold**, *emphasis*, ~~strikethrough~~.
- Bullet and numbered lists, including nested lists and numbered-list start values.
- Inline code and fenced code blocks, rendered literally in a horizontal scroller.
- Blockquotes, horizontal rules and comparison tables that scroll sideways on phones.
- Markdown links and images: use absolute hosted URLs. Images retain an alt-text caption.
- Tappable reflection checklists and expandable worked examples, described below.
- Note/tip callouts using the blockquote convention `[!NOTE]`, `[!TIP]`,
  `[!IMPORTANT]`, `[!WARNING]` or `[!CAUTION]`.

Top-level `#` / `##` headings start new reading cards. Lower-level headings stay
within their parent card. Fenced code and nested headings do not split cards.
Tables, quotes and lists are parsed as Markdown blocks rather than split by blank
lines. The renderer uses native React Native components and the app's typography
and theme; it does not use HTML, a WebView, JSX or executable code.

## Interactive lesson example

````markdown
## Notice before you explain

**Observation** describes what you can see. *Inference* offers an explanation.

> [!TIP]
> Record the observation first, then ask what evidence could test your explanation.

| Observation | Possible explanation |
| --- | --- |
| More seedlings in a crack | Different moisture or seed arrival |

### Pause and think

- [ ] Record two observations.
- [ ] Suggest an alternative explanation.

::: reveal Compare your explanation

There can be **more than one** plausible explanation.

1. Keep the comparison fair.
2. Repeat the observation.

:::

```text
Observation:
Explanation:
What I would measure next:
```

[Read more about Etna](https://whc.unesco.org/en/list/1427/)
````

An expandable block starts with `::: reveal A plain-text title` and ends on a
line containing `:::`. Its contents can include Markdown; nested reveals work.
Use reveals for hints, worked examples and reflection feedback. Do not place the
only explanation of a quiz topic inside a reveal whose title hides its purpose.

Checklist selections and open reveals are local to the open lesson. They survive
scrolling cards offscreen, but are not persisted when leaving/reloading. They are
reflection tools and do not affect grades. Scored questions, correct answers and
course completion remain in the existing quiz tables and submission API.

## Authoring guidance for future generation

Write a coherent 20–40 minute course, including reading, reflection and quizzes.
Use descriptive section headings, short paragraphs, concrete examples and a few
purposeful interactions. A table should compare information; a reveal should let
the learner think before viewing an explanation. Keep every scored question
answerable from the lesson material. Put real question/answer records in the quiz
structure, rather than trying to grade a Markdown checklist.

The Etna `.md` files demonstrate the format. The optional seed upgrades only exact
known demo text bodies to Markdown and preserves edited content, progress,
submitted answers, completion timestamps and rewards. Subsequent content changes
should follow the course-version workflow instead of overwriting attempted material.
