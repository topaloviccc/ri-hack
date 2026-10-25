const fs = require('node:fs');
const path = require('node:path');

const single = (prompt, explanation, correct, wrong) => ({type:1,prompt,explanation,
  options:[[correct,true],...wrong.map((text) => [text,false])]});
const multi = (prompt, explanation, correct, wrong) => ({type:2,prompt,explanation,
  options:[...correct.map((text) => [text,true]),...wrong.map((text) => [text,false])]});
const truth = (prompt, explanation, correct) => ({type:3,prompt,explanation,
  options:[['True',correct],['False',!correct]]});
const lessons = [
  {title:'Read a volcanic landscape',estimatedMinutes:6,file:'01-landscape.md',questions:[
    single('Where is Mount Etna?', 'Etna stands on the eastern side of Sicily, in Italy.', 'Sicily, Italy', ['Iceland','Hawaii, United States']),
    single('What does stratovolcano mean in this course?', 'The mountain has been built through repeated volcanic events.', 'A volcanic mountain built through many eruptions', ['A mountain created in one single event','A volcano that has no record of lava flows']),
    truth('Seeing little vegetation proves that a surface is currently hot.', 'Visible plant cover is an observation; present heat and eruption timing require other evidence.', false),
  ]},
  {title:'How life establishes on exposed rock',estimatedMinutes:6,file:'02-return-of-life.md',questions:[
    multi('Which processes can contribute to soil development on volcanic surfaces?', 'Rock breakdown, trapped fine material and accumulated organic matter can interact during soil development.', ['Weathering that breaks material into smaller pieces','Accumulation of organic matter'], ['An identical, automatic timetable for every patch']),
    single('Why can a sheltered crack differ from an exposed ridge?', 'A microsite can have different shelter, moisture or trapped material from its surroundings.', 'Its local conditions can differ even on the same surface', ['Every crack must be a different age','All cracks are guaranteed to contain plants']),
    truth('Every volcanic surface follows the same fixed succession timetable.', 'Local conditions, disturbance and arrival of organisms affect ecological development.', false),
  ]},
  {title:'Compare habitats fairly',estimatedMinutes:5,file:'03-comparing-habitats.md',questions:[
    single('Why is comparing only sheltered low plots with exposed high plots problematic?', 'Shelter and elevation change together, so the comparison does not isolate either factor.', 'Shelter and elevation are confounded', ['The two locations must contain the same organisms','Elevation has no connection to environmental conditions']),
    multi('Which choices strengthen the fictional seedling comparison?', 'Comparable conditions, repetition and consistent methods make the reasoning more transparent.', ['Compare several sheltered and exposed plots in a similar elevation band','Use the same counting method in each plot'], ['Remove plots that do not fit the expected result']),
    truth('A small observed correlation automatically proves one cause for the whole mountain.', 'A pattern in a limited sample needs interpretation and does not justify a universal causal claim.', false),
  ]},
  {title:'Think about the living landscape',estimatedMinutes:5,file:'04-living-landscape.md',questions:[
    single('Why can an older vegetated patch matter beside exposed ground?', 'An established patch holds a community and may provide organisms that can reach nearby places.', 'It holds living communities and can connect with nearby areas', ['It proves that every exposed patch will become identical','Small patches are always ecologically irrelevant']),
    single('Which fictional education activity is the better starting point?', 'Observation from an appropriate existing viewpoint avoids unnecessary removal of organisms while supporting comparison.', 'Record comparable observations from an appropriate existing viewpoint', ['Ask every visitor to remove a plant from each area','Choose only observations that support the preferred conclusion']),
    multi('Which steps belong in an evidence-based explanation?', 'Separate observations from inferences and match the proposed observation to the explanation.', ['Distinguish what you observed from what you inferred','Consider other factors that could explain a pattern'], ['Treat a preferred appearance as proof of ecological improvement']),
  ]},
].map((lesson) => ({...lesson,text:fs.readFileSync(path.join(__dirname,lesson.file),'utf8').replace(/\r\n/g,'\n').trim()}));

const finalQuestions = [lessons[0].questions[0],lessons[0].questions[1],lessons[1].questions[1],
  lessons[2].questions[0],lessons[2].questions[1],lessons[3].questions[2]];

module.exports = {
  course:{id:'demo-etna-long',title:'Mount Etna: life on a living volcano',
    description:'A 30-minute introduction to volcanic landscapes, ecological succession and fair observation. Four guided lessons combine reading, reflection activities and quizzes.',
    countryCode:'IT',estimatedMinutes:30,difficulty:'beginner',subject:'Nature & Wildlife',locationIds:['l-mount-etna']},
  lessons,finalQuestions,
};
