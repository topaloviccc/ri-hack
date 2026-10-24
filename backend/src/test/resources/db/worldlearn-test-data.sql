TRUNCATE country, field CASCADE;

INSERT INTO country(id,iso_code,label) VALUES
 ('80000000-0000-0000-0000-000000000001','ME','Montenegro'),
 ('80000000-0000-0000-0000-000000000002','HR','Croatia');
INSERT INTO field(id,label) VALUES
 ('90000000-0000-0000-0000-000000000001','History'),
 ('90000000-0000-0000-0000-000000000002','Arts & Music');
INSERT INTO app_user(id,first_name,last_name,username,email,country_id,avatar_url) VALUES
 ('00000000-0000-0000-0000-000000000001','Current','Learner','me','me@example.test','80000000-0000-0000-0000-000000000001','https://example.test/me.png'),
 ('00000000-0000-0000-0000-000000000002','Alex','Friend','alex','alex@example.test','80000000-0000-0000-0000-000000000001',null),
 ('00000000-0000-0000-0000-000000000003','Sam','Other','sam','sam@example.test','80000000-0000-0000-0000-000000000002',null);
INSERT INTO wallet(user_id,balance) VALUES
 ('00000000-0000-0000-0000-000000000001',100),
 ('00000000-0000-0000-0000-000000000002',0),
 ('00000000-0000-0000-0000-000000000003',0);
INSERT INTO friendship(requester_id,addressee_id,friendship_status_id) VALUES
 ('00000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000002','1fd341a9-517a-5e85-b681-2f558ce03441');
INSERT INTO place(id,name,country_id,address,latitude,longitude) VALUES
 ('70000000-0000-0000-0000-000000000001','Museum','80000000-0000-0000-0000-000000000001','Test address',42.424662,18.771234);
INSERT INTO course(id,creator_id,title,description,country_id,estimated_minutes,price_coins,reward_coins) VALUES
 ('10000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000002','Paid course','Paid description','80000000-0000-0000-0000-000000000001',30,40,10),
 ('10000000-0000-0000-0000-000000000002','00000000-0000-0000-0000-000000000002','Free course','Free description','80000000-0000-0000-0000-000000000002',15,0,0),
 ('10000000-0000-0000-0000-000000000003','00000000-0000-0000-0000-000000000002','Started course','Started description','80000000-0000-0000-0000-000000000001',60,20,5),
 ('10000000-0000-0000-0000-000000000004','00000000-0000-0000-0000-000000000002','Expensive course',null,'80000000-0000-0000-0000-000000000001',100,500,10),
 ('10000000-0000-0000-0000-000000000005','00000000-0000-0000-0000-000000000002','Draft course',null,null,null,0,0);
INSERT INTO course_version(id,course_id,version_number,title,created_by,publication_status_id,published_at)
 SELECT ('20000000-0000-0000-0000-' || right(c.id::text,12))::uuid,c.id,1,c.title,c.creator_id,
        'aa7192b0-4b5d-5230-b311-25aa6b0e59ff',now() FROM course c WHERE c.title<>'Draft course';
UPDATE course SET current_published_version_id=('20000000-0000-0000-0000-' || right(id::text,12))::uuid
 WHERE title<>'Draft course';
INSERT INTO course_field(course_id,field_id) VALUES
 ('10000000-0000-0000-0000-000000000001','90000000-0000-0000-0000-000000000001'),
 ('10000000-0000-0000-0000-000000000002','90000000-0000-0000-0000-000000000002');
INSERT INTO course_place(course_id,place_id) VALUES
 ('10000000-0000-0000-0000-000000000001','70000000-0000-0000-0000-000000000001');
INSERT INTO user_interest(user_id,field_id) VALUES
 ('00000000-0000-0000-0000-000000000001','90000000-0000-0000-0000-000000000002');
INSERT INTO course_entitlement(id,user_id,course_id,acquisition_kind,paid_coins,promised_reward_coins) VALUES
 ('30000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000001','10000000-0000-0000-0000-000000000003','GRANT',0,5),
 ('30000000-0000-0000-0000-000000000002','00000000-0000-0000-0000-000000000002','10000000-0000-0000-0000-000000000001','GRANT',0,10),
 ('30000000-0000-0000-0000-000000000003','00000000-0000-0000-0000-000000000003','10000000-0000-0000-0000-000000000002','FREE',0,0);
INSERT INTO enrollment(id,entitlement_id,user_id,course_id,course_version_id,first_opened_at,completed_at)
 SELECT ('40000000-0000-0000-0000-' || right(ce.id::text,12))::uuid, ce.id,ce.user_id,ce.course_id,
        c.current_published_version_id,now()-interval '1 day',
        CASE WHEN ce.user_id<>'00000000-0000-0000-0000-000000000001' THEN now() END
 FROM course_entitlement ce JOIN course c ON c.id=ce.course_id;
INSERT INTO lesson(id,course_version_id,position,title) VALUES
 ('50000000-0000-0000-0000-000000000001','20000000-0000-0000-0000-000000000003',0,'First'),
 ('50000000-0000-0000-0000-000000000002','20000000-0000-0000-0000-000000000003',1,'Second');
INSERT INTO lesson_progress(enrollment_id,course_version_id,lesson_id,completed_at) VALUES
 ('40000000-0000-0000-0000-000000000001','20000000-0000-0000-0000-000000000003','50000000-0000-0000-0000-000000000001',now());
INSERT INTO course_completion(enrollment_id,completed_at,quiz_count,aggregate_percentage,score_sum_numerator,score_sum_denominator)
 SELECT id,completed_at,1,100,1,1 FROM enrollment WHERE completed_at IS NOT NULL;
INSERT INTO event(id,name,description,organizer_id,place_id,starts_at,ends_at,external_registration_url) VALUES
 ('a0000000-0000-0000-0000-000000000001','Museum lecture','A lecture','00000000-0000-0000-0000-000000000002',
  '70000000-0000-0000-0000-000000000001',now()+interval '1 day',now()+interval '2 days','https://example.test/register');
