INSERT INTO lesson(id,course_version_id,position,title,content_json) VALUES
 ('51000000-0000-0000-0000-000000000001','20000000-0000-0000-0000-000000000001',0,'Introduction','{"text":"First lesson text","demo":true}'),
 ('51000000-0000-0000-0000-000000000002','20000000-0000-0000-0000-000000000001',1,'Context','{"text":"Second lesson text","demo":true}');
INSERT INTO quiz(id,course_version_id,lesson_id,title) VALUES
 ('60000000-0000-0000-0000-000000000001','20000000-0000-0000-0000-000000000001','51000000-0000-0000-0000-000000000001','First quiz'),
 ('60000000-0000-0000-0000-000000000002','20000000-0000-0000-0000-000000000001','51000000-0000-0000-0000-000000000002','Second quiz'),
 ('60000000-0000-0000-0000-000000000003','20000000-0000-0000-0000-000000000001',null,'Summary');
INSERT INTO question(id,quiz_id,question_type_id,prompt,explanation,position,points)
 SELECT ('61000000-0000-0000-0000-' || lpad(g::text,12,'0'))::uuid,
   ('60000000-0000-0000-0000-' || lpad(least(g,3)::text,12,'0'))::uuid,
   CASE WHEN g=2 THEN 2 WHEN g=3 THEN 3 ELSE 1 END,'Question '||g,'Explanation '||g,
   CASE WHEN g<3 THEN 0 ELSE g-3 END,CASE WHEN g=1 THEN 10 ELSE 1 END
 FROM generate_series(1,5) g;
INSERT INTO answer_option(id,question_id,answer_text,is_correct,position)
 SELECT md5(q.id::text || ':' || g)::uuid,q.id,'Option '||g,
   g=0 OR (q.question_type_id=2 AND g=1),g
 FROM question q CROSS JOIN generate_series(0,2) g
 WHERE q.quiz_id IN ('60000000-0000-0000-0000-000000000001','60000000-0000-0000-0000-000000000002','60000000-0000-0000-0000-000000000003')
 AND (q.question_type_id<>3 OR g<2);
