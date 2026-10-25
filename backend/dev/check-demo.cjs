// Read-only smoke check of the seeded data through the running HTTP API.
const assert = require('node:assert/strict');
const seed = require('./demo-scenarios.json');
const base = process.env.DEMO_API_URL || 'http://localhost:8080/api';
const headers = { 'X-User-Id': seed.viewer };

async function get(path, expected = 200) {
  const response = await fetch(base + path, { headers });
  assert.equal(response.status, expected, `${path}: unexpected HTTP status`);
  return response.json();
}

async function main() {
  const lists = [
    ['/courses', 40], ['/courses?collection=continue', 1], ['/courses?collection=popular', 1],
    ['/courses?collection=recommended', 1], ['/courses?collection=feed', 1],
    ['/countries', 249], ['/locations', 94], ['/events', 32], ['/users?relation=friend', 1],
    ['/users?relation=requested', 1], ['/users?suggested=true', 1],
    ['/network/feed', 1], ['/network/leaderboard', 2], ['/codebooks/fields', 7],
  ];
  for (const [path, minimum] of lists) {
    const rows = await get(path);
    assert.ok(Array.isArray(rows) && rows.length >= minimum, `${path}: missing demo rows`);
    console.log(`${path}: ${rows.length} rows`);
  }
  const profile = await get('/users/me');
  const country = await get('/countries/HR');
  assert.equal(country.name, 'Croatia');
  assert.equal(country.flagUrl, 'https://flagcdn.com/w160/hr.png');
  assert.equal(profile.id, seed.viewer);
  assert.ok(profile.stats.completedCount >= 5);
  assert.ok(profile.inProgressCourseIds.length >= 4);
  const wallet = await get('/wallet');
  console.log(`Demo Learner: ${wallet.balance} coins, ${profile.stats.completedCount} completed, ${profile.stats.streakDays}-day streak`);
  const s = seed.scenarios;
  const learning = await get(`/courses/${s.ownedNotStarted.id}/learning`);
  assert.equal(learning.lessons.length, 4);
  assert.equal(learning.questionCount, 13);
  assert.equal(learning.finalQuiz.questionCount, 5);
  const longer = await get(`/courses/${s.longCourse.id}/learning`);
  assert.equal(longer.estimatedMinutes, 30);
  assert.equal(longer.lessons.length, 4);
  assert.equal(longer.questionCount, 18);
  assert.equal(longer.lessons.reduce((sum,lesson)=>sum+lesson.estimatedMinutes,0),22);
  console.log('Course player: 4 lessons, 4 lesson quizzes and a 5-question summary quiz.');
  assert.equal((await get(`/courses/${s.freeUnlock.id}`)).unlockCost, 0);
  assert.equal((await get(`/courses/${s.paidUnlock.id}`)).unlockCost, 100);
  assert.equal((await get(`/courses/${s.insufficientCoins.id}`)).unlockCost, 1000);
  const archived = await get(`/courses/${s.ownedArchived.id}`);
  assert.equal(archived.isUnlocked, true);
  const optional = await get(`/courses/${s.optionalMetadata.id}`);
  assert.equal(optional.estimatedMinutes, null);
  assert.equal(optional.locations[0].lat, null);
  await get(`/courses/${s.hiddenUnpublished.id}`, 404);
  assert.equal((await get(`/users/${s.pendingRequest.id}`)).relation, 'requested');
  console.log('Demo read checks passed. No purchases, requests or preferences were changed.');
}

main().catch((error) => { console.error(error.message); process.exitCode = 1; });
