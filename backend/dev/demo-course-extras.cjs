// Shared edge-case samples used by both the catalogue and the lesson/quiz seed.
const noCoordinates = { id:'demo-no-coordinates', name:'Demo place without coordinates', countryCode:'ME', lat:null, lng:null };
const extra = [
  require('./content/etna/course.cjs').course,
  { id:'demo-null',title:'Optional metadata example',description:null,countryCode:null,estimatedMinutes:null,difficulty:'beginner',locationIds:[noCoordinates.id] },
  { id:'demo-archive',title:'Owned archived course example',description:'A granted private archived course remains in your library.',countryCode:'ME',estimatedMinutes:20,difficulty:'beginner',locationIds:[] },
  { id:'demo-draft',title:'Unpublished demo course (hidden)',description:'This course must not appear in the public catalogue.',countryCode:'ME',estimatedMinutes:15,difficulty:'beginner',locationIds:[] },
];
module.exports = { noCoordinates, extra };
