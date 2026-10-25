// Optional sample content shaped like a future generation/import result. Never runs at startup.
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const crypto = require('node:crypto');
const ts = require('../../mobile/node_modules/typescript');
const { noCoordinates, extra } = require('./demo-course-extras.cjs');
const longCourse = require('./content/etna/course.cjs');
const legacyLongHashes = require('./content/etna/legacy-text-hashes.json');
const root = path.resolve(__dirname, '../..');
function samples(file) {
  const compiled = ts.transpileModule(fs.readFileSync(path.join(root, 'mobile/src', file), 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  const context = { exports: {} };
  vm.runInNewContext(compiled, context);
  return context.exports;
}
const { MOCK_COURSES, MOCK_COUNTRIES, MOCK_LOCATIONS } = samples('features/courses/api/courses.mock.ts');
const courses = [...MOCK_COURSES,...extra];
function id(kind, sourceId) {
  const hash = crypto.createHash('md5').update(`worldlearn-demo:${kind}:${sourceId}`).digest('hex');
  return `${hash.slice(0,8)}-${hash.slice(8,12)}-${hash.slice(12,16)}-${hash.slice(16,20)}-${hash.slice(20)}`;
}
const quote = (value) => value === null ? 'NULL' : `'${String(value).replaceAll("'", "''")}'`;
const sql = ['-- Optional demo lesson/quiz content. Apply after Liquibase and dev/demo-data.sql.',
  '-- Repeatable; preserves real attempts, progress, completed courses, balances and edited content.',
  'BEGIN;', 'SELECT pg_advisory_xact_lock(78215002);'];
const insert = (table, columns, values, conflict = 'ON CONFLICT DO NOTHING') => sql.push(
  `INSERT INTO ${table}(${columns}) VALUES (${values.map(quote).join(',')}) ${conflict};`);
// Provision the long sample here too, so existing databases can load this script alone.
const c = longCourse.course;
insert('course','id,creator_id,title,description,country_id,estimated_minutes,price_coins,reward_coins',[
  id('course',c.id),id('user','u1'),c.title,c.description,
  // country references are expressed below to preserve existing country UUIDs.
  null,c.estimatedMinutes,0,10,
]);
sql.push(`UPDATE course SET country_id=(SELECT id FROM country WHERE iso_code='IT') WHERE id=${quote(id('course',c.id))} AND country_id IS NULL;`);
insert('course_version','id,course_id,version_number,title,description,estimated_minutes,publication_status_id,created_by',[
  id('version',c.id),id('course',c.id),1,c.title,c.description,c.estimatedMinutes,
  'aa7192b0-4b5d-5230-b311-25aa6b0e59ff',id('user','u1'),
]);
sql.push(`UPDATE course_version SET published_at=created_at WHERE id=${quote(id('version',c.id))} AND published_at IS NULL;`);
sql.push(`UPDATE course SET current_published_version_id=${quote(id('version',c.id))} WHERE id=${quote(id('course',c.id))} AND current_published_version_id IS NULL;`);
sql.push(`INSERT INTO course_field(course_id,field_id) SELECT ${quote(id('course',c.id))},id FROM field WHERE label='Nature & Wildlife' ON CONFLICT DO NOTHING;`);
insert('course_place','course_id,place_id',[id('course',c.id),id('place','l-mount-etna')]);
insert('course_entitlement','id,user_id,course_id,acquisition_kind,paid_coins,promised_reward_coins',[
  id('entitlement',`u0:${c.id}`),'11111111-1111-4111-8111-111111111111',id('course',c.id),'GRANT',0,10,
]);
const courseIds=courses.map((course)=>quote(id('course',course.id))).join(',');
const versionIds=courses.map((course)=>quote(id('version',course.id))).join(',');
sql.push(`UPDATE course SET estimated_minutes=greatest(20,least(40,estimated_minutes)) WHERE id IN (${courseIds}) AND estimated_minutes IS NOT NULL;`);
sql.push(`UPDATE course_version SET estimated_minutes=greatest(20,least(40,estimated_minutes)) WHERE id IN (${versionIds}) AND estimated_minutes IS NOT NULL;`);
courses.forEach((course, courseIndex) => {
  const planned = course.id === longCourse.course.id ? longCourse : null;
  const country = MOCK_COUNTRIES.find((c) => c.code === course.countryCode);
  const places = [...MOCK_LOCATIONS,noCoordinates].filter((p) => course.locationIds.includes(p.id));
  const countryName = country?.name ?? 'No specific country';
  const subject = course.subject ?? 'General knowledge';
  const other = MOCK_COURSES[(courseIndex + 7) % MOCK_COURSES.length];
  const description = course.description || `An introduction to ${course.title}.`;
  const site = places[0]?.name ?? 'No specific place';
  const texts = [
    `${course.title}\n\n${description}\n\nThis lesson introduces the central idea. Pay attention to what makes it distinct from other traditions, sites or ecosystems.`,
    `Country and context\n\nThe country context is: ${countryName}.\n\n${country?.blurb ?? description}\n\nUse this geographic context to connect the topic with its setting.`,
    `Connected places\n\n${places.length ? `Places connected to this topic include ${places.map((p) => p.name).join(', ')}. These sites help locate the ideas from the overview in the real world.` : 'No specific place is attached to this concept; a course can describe a country-level idea without a particular site.'}\n\nCountry context: ${countryName}.\n\n${description}`,
    `Bringing it together\n\nThis course belongs to the field ${subject}.\n\n${description}\n\nConnect the main idea to its country (${countryName}) and its places (${site}). The final quiz will revisit these connections and the overview.`,
  ];
  const statement = { type:1,prompt:`Which statement describes ${course.title}?`,explanation:description,
    options:[[description,true],[other.description || other.title,false],['This course is only about modern computer hardware.',false]] };
  const countryQuestion = {type:1,prompt:'Which country provides the context for this topic?',explanation:`The lesson connects this topic to ${countryName}.`,
    options:[[countryName,true],['Canada',false],['New Zealand',false]]};
    const placeQuestion = {type:1,prompt:'Which place is connected to this topic?',explanation:places.length ? `${site} is listed in the connected places lesson.` : 'This concept has no specific place attached.',
    options:[[site,true],...['The Sydney Opera House','The Golden Gate Bridge','Mount Everest'].filter((name) => name!==site).slice(0,2).map((name) => [name,false])]};
  const fieldQuestion = {type:1,prompt:'Which field does this course explore?',explanation:`The final lesson identifies the field as ${subject}.`,
    options:[[subject,true],['Computer hardware',false],['Spaceflight engineering',false]]};
  const multiple = {type:2,prompt:'Select all statements consistent with these lessons.',explanation:`The course concerns ${countryName} and the field ${subject}. Select both, with no unrelated statements.`,
    options:[[`The country context is ${countryName}.`,true],[`The field is ${subject}.`,true],['The topic is exclusively computer hardware.',false]]};
  const lessonQuestions = [
    [statement,{type:3,prompt:`This course focuses on ${other.title}.`,explanation:`This course focuses on ${course.title}.`,options:[['True',false],['False',true]]}],
    [countryQuestion,{type:3,prompt:`The geographic context includes ${countryName}.`,explanation:`The lesson gives ${countryName} as the context.`,options:[['True',true],['False',false]]}],
    [placeQuestion,{type:2,prompt:'Select all facts that help connect the course to its setting.',
      explanation:`The setting is ${countryName}; the connected place is ${site}.`,
      options:[[`The country context is ${countryName}.`,true],[`The connected place is ${site}.`,true],['The topic is exclusively computer hardware.',false]]}],
    [fieldQuestion,multiple],
  ];
  const quizzes = planned ? [...planned.lessons.map((lesson)=>lesson.questions),planned.finalQuestions] : [...lessonQuestions,[statement,countryQuestion,placeQuestion,fieldQuestion,multiple]];
  quizzes.forEach((questions, quizIndex) => {
    const final = quizIndex === 4;
    const lessonId = final ? null : id('lesson',`${course.id}:${quizIndex}`);
    const legacyHash = final ? null : planned ? legacyLongHashes[planned.lessons[quizIndex].file]
      : crypto.createHash('md5').update(texts[quizIndex]).digest('hex');
    const markdown = final ? null : planned ? planned.lessons[quizIndex].text
      : texts[quizIndex].replace(/^([^\n]+)\n\n/,'## $1\n\n');
    if (!final) insert('lesson','id,course_version_id,position,title,content_json',[
      lessonId,id('version',course.id),quizIndex,planned ? planned.lessons[quizIndex].title : ['The central idea','Country and context','Connected places','Bringing it together'][quizIndex],
      JSON.stringify({demo:true,format:'markdown',markdown,estimatedMinutes:planned?.lessons[quizIndex].estimatedMinutes}),
    ], `ON CONFLICT(id) DO UPDATE SET title=excluded.title,content_json=excluded.content_json
        WHERE NOT (lesson.content_json ? 'markdown') AND (lesson.content_json->>'text'='Seeded learning history. The lesson player is not implemented.'
           OR lesson.content_json->>'text'='Demo lesson pending optional learning seed.')`);
    // Formatting-only upgrade for exact known demo bodies. Preserve title, metadata and all
    // learner history; leave edited bodies and already-authored Markdown untouched.
    if (!final) sql.push(`UPDATE lesson SET content_json=(content_json-'text') || jsonb_build_object('format','markdown','markdown',${quote(markdown)})
      WHERE id=${quote(lessonId)} AND content_json->'demo'='true'::jsonb
        AND NOT (content_json ? 'markdown')
        AND md5(replace(content_json->>'text',chr(13)||chr(10),chr(10)))=${quote(legacyHash)};`);
    const quizId = id('quiz',`${course.id}:${quizIndex}`);
    insert('quiz','id,course_version_id,lesson_id,title',[quizId,id('version',course.id),lessonId,final ? 'Final summary quiz' : `Lesson ${quizIndex+1} quiz`]);
    questions.forEach((question, questionIndex) => {
      const questionId = id('question',`${course.id}:${quizIndex}:${questionIndex}`);
      insert('question','id,quiz_id,question_type_id,prompt,explanation,position',[questionId,quizId,question.type,question.prompt,question.explanation,questionIndex]);
      const options = [...question.options];
      if ((quizIndex+questionIndex+courseIndex)%2 && question.type !== 3) options.reverse();
      options.forEach(([text,correct],optionIndex) => insert('answer_option','id,question_id,answer_text,is_correct,position',[
        id('option',`${course.id}:${quizIndex}:${questionIndex}:${optionIndex}`),questionId,text,correct,optionIndex,
      ]));
    });
  });
});
sql.push('COMMIT;');
fs.writeFileSync(path.join(__dirname,'demo-learning.sql'),sql.join('\n')+'\n');
console.log(`Wrote sample lessons and quizzes for ${courses.length} courses.`);
