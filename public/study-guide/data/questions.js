/*
  Theta Tau Study Guide — Questions
  ----------------------------------
  Edit questions here. Each item supports:
  id: unique stable id
  q: question text
  a: answer text. For multiple accepted answers, use 'Answer 1 | Answer 2'
  mode: exact, contains, or multi
*/
const classInfo = window.THETA_CONFIG?.pledgeClass || {};

function buildPledgeClassQuestions(info) {
  const questions = [];
  const marshal = String(info.marshal || "").trim();
  const nmes = Array.isArray(info.nmes) ? info.nmes.filter(Boolean) : [];
  const pnms = Array.isArray(info.pnms) ? info.pnms.filter(Boolean) : [];

  if (marshal) questions.push({ id: "classMarshal", q: "Marshal Name", a: marshal, mode: "exact", cat: "Current Pledge Class" });
  if (nmes.length) questions.push({ id: "classNMEs", q: "New Member Educator Names", a: nmes.join(", "), mode: "contains", cat: "Current Pledge Class" });
  pnms.forEach((name, index) => questions.push({
    id: `classPNM${index + 1}`,
    q: `${index + 1}${ordinalSuffix(index + 1)} PNM:`,
    a: name,
    mode: "exact",
    cat: "Current Pledge Class"
  }));
  return questions;
}

function ordinalSuffix(number) {
  const remainder = number % 100;
  if (remainder >= 11 && remainder <= 13) return "th";
  return ["th", "st", "nd", "rd"][number % 10] || "th";
}

const permanentQuestions = [
  {
    id: "purpose",
    q: "Purpose of Theta Tau:",
    a: "The purpose of Theta Tau is to develop and maintain a high standard of professional interest among its members and to unite them in a strong bond of fraternal fellowship.",
    mode: "exact",
  },
  {
    id: "motto",
    q: "Open Motto of Theta Tau:",
    a: "\u201cWhatsoever thy hand findeth to do, do it with thy might;...\u201d --Ecclesiastes 9:10",
    mode: "exact",
  },
  {
    id: "alphabet",
    q: "Greek Alphabet in Order",
    a: "Alpha beta gamma delta epsilon zeta eta theta iota kappa lambda mu nu xi omicron pi rho sigma tau upsilon phi chi psi omega",
    mode: "contains",
  },
  {
    id: "Flower",
    q: "Official Flower of Theta Tau:",
    a: "Jacqueminot",
    mode: "contains",
  },
  {
    id: "Gem",
    q: "Official Gem of Theta Tau:",
    a: "Dark Red Garnet",
    mode: "contains",
  },
  {
    id: "Colors",
    q: "Official colors of Theta Tau: (Color, Color)",
    a: "Dark Red, Gold",
    mode: "contains",
  },
  {
    id: "Uni",
    q: "Founding University:",
    a: "University of Minnesota",
    mode: "exact",
  },
  { 
    id: "City", 
    q: "Founding City:", 
    a: "Minneapolis", 
    mode: "exact" 
  },
  { 
    id: "State", 
    q: "Founding State:", 
    a: "Minnesota", 
    mode: "exact" 
  },
  {
    id: "Date",
    q: "Founding Date: (Month Day, Year)",
    a: "October 15th, 1904",
    mode: "contains",
  },
  {
    id: "OGName",
    q: "Original name of Theta Tau:",
    a: "Society of Hammer and Tongs",
    mode: "exact",
  },
  {
    id: "Founders",
    q: "Original founders: (Name, Name, etc.)",
    a: "Isaac Baker Hanks, William Murray Lewis, Erich Julius Schrader, Elwin Leroy Vinal",
    mode: "contains",
  },
  {
    id: "DeadOrAlive",
    q: "Are they Alive? (yes/no)",
    a: "No",
    mode: "contains",
  },
  {
    id: "CoatOfArms1",
    q: "What are the 2 objects at the top? (x, y)",
    a: "hammer, tongs",
    mode: "contains",
  },
  {
    id: "CoatOfArms2",
    q: "What is clasping these objects?",
    a: "right hand | hands | hand",
    mode: "multi",
  },
  {
    id: "CoatOfArms3",
    q: "What object is on the left?",
    a: "tongs",
    mode: "contains",
  },
  {
    id: "CoatOfArms4",
    q: "What object is on the right?",
    a: "hammer",
    mode: "contains",
  },
  {
    id: "CoatOfArms5",
    q: "Whats under the thing clasping these objects?",
    a: "sleeve",
    mode: "contains",
  },
  {
    id: "CoatOfArms6",
    q: "Where is the torsade under?",
    a: "sleeve",
    mode: "contains",
  },
  {
    id: "CoatOfArms7",
    q: "How many stripes are in the torsade? (number)",
    a: "11",
    mode: "contains",
  },
  {
    id: "CoatOfArms8",
    q: "What colors are alternating in the torsade? (x, y)",
    a: "Dark red, Gold",
    mode: "contains",
  },
  {
    id: "CoatOfArms9",
    q: "What objects are on top half of the shield?",
    a: "gears",
    mode: "contains",
  },
  {
    id: "CoatOfArms10",
    q: "How many teeth do they have? (number)",
    a: "26",
    mode: "contains",
  },
  {
    id: "CoatOfArms11",
    q: "How many spokes do they have? (number)",
    a: "4",
    mode: "contains",
  },
  {
    id: "CoatOfArms12",
    q: "Is there a circle in the middle of this object? (yes/no)",
    a: "yes",
    mode: "contains",
  },
  {
    id: "CoatOfArms13",
    q: "What object is on the bottom half of the shield?",
    a: "bridge",
    mode: "contains",
  },
  {
    id: "CoatOfArms14",
    q: "How many arches does this object have? (number)",
    a: "3",
    mode: "contains",
  },
  {
    id: "CoatOfArms15",
    q: "How many bricks does this object have? (number +/- number)",
    a: "151 +/- 1",
    mode: "contains",
  },
  {
    id: "CoatOfArms16",
    q: "What color is this object?",
    a: "grey | gray | light gray | light grey",
    mode: "multi",
  },
  {
    id: "CoatOfArms17",
    q: "How many ripples? (number +/- number)",
    a: "33 +/- 1",
    mode: "contains",
  },
  {
    id: "CoatOfArms18",
    q: "What color is the top half background of the shield?",
    a: "Red",
    mode: "contains",
  },
  {
    id: "CoatOfArms19",
    q: "What color is the bottom half background of the shield?",
    a: "Gold",
    mode: "contains",
  },
  {
    id: "CoatOfArms20",
    q: "What object is under the shield?",
    a: "Ribbon",
    mode: "contains",
  },
  {
    id: "CoatOfArms21",
    q: "What color is this objects background?",
    a: "Gold",
    mode: "contains",
  },
  {
    id: "CoatOfArms22",
    q: "How many folds does this object have? (number)",
    a: "3",
    mode: "contains",
  },
  {
    id: "CoatOfArms23",
    q: "What letters are written on it?",
    a: "Theta.Tau.",
    mode: "exact",
  },
  {
    id: "CoatOfArms24",
    q: "What color are these letters",
    a: "black",
    mode: "contains",
  },
  {
    id: "ChapterExecutiveCouncil1",
    q: "Who's the Regent?",
    a: "Roen Wainscoat",
    mode: "exact",
  },
  {
    id: "ChapterExecutiveCouncil2",
    q: "Name at least one of his duties:",
    a: "preside over all meetings | initiate new members | appoint committees",
    mode: "multi",
  },
  {
    id: "ChapterExecutiveCouncil3",
    q: "Who's the Vice Regent?",
    a: "Kyler Eenhuis",
    mode: "exact",
  },
  {
    id: "ChapterExecutiveCouncil4",
    q: "Name at least one of his duties:",
    a: "preside over meetings in absence of the regent | oversee committees | maintain room reservations | is property manager",
    mode: "multi",
  },
  {
    id: "ChapterExecutiveCouncil5",
    q: "Who's the scribe?",
    a: "Evan Swarup",
    mode: "exact",
  },
  {
    id: "ChapterExecutiveCouncil6",
    q: "Name at least one of his duties:",
    a: "record minutes at all meetings | register all visitors | correspondent to the Grand Executive Council",
    mode: "multi",
  },
  {
    id: "ChapterExecutiveCouncil7",
    q: "Who's the Treasurer?",
    a: "Brooke Kubosh",
    mode: "exact",
  },
  {
    id: "ChapterExecutiveCouncil8",
    q: "Name at least one of her duties:",
    a: "collect dues and fees | maintain chapter financial records",
    mode: "multi",
  },
  {
    id: "ChapterExecutiveCouncil9",
    q: "Who's the Corresponding Secretary?",
    a: "Matthew Heinsen",
    mode: "exact",
  },
  {
    id: "ChapterExecutiveCouncil10",
    q: "Name at least one of his duties:",
    a: "chapter correspondent to The Gear | maintain alumni records | author of chapter newsletter",
    mode: "multi",
  },
  {
    id: "ChapterExecutiveCouncil11",
    q: "Who's the Regent Emiritus?",
    a: "Robert Morones",
    mode: "exact",
  },
  {
    id: "ChapterExecutiveCouncil12",
    q: "Name at least one of his duties:",
    a: "aid and advise the E-Council | maintain parliamentary procedure | ensure quorum at meetings",
    mode: "multi",
  },
  {
    id: "GrandExecutiveCouncil1",
    q: "Who's the Grand Regent?",
    a: "David Parker",
    mode: "exact",
  },
  {
    id: "GrandExecutiveCouncil2",
    q: "Who's the Grand Vice Regent?",
    a: "Lindsey Carr",
    mode: "exact",
  },
  {
    id: "GrandExecutiveCouncil3",
    q: "Who's the Grand Scribe?",
    a: "Dan McConnell",
    mode: "exact",
  },
  {
    id: "GrandExecutiveCouncil4",
    q: "Who's the Grand Treasurer?",
    a: "Benjamin Ladick",
    mode: "exact",
  },
  {
    id: "GrandExecutiveCouncil5",
    q: "Who's the Grand Marshal?",
    a: "Keyannah Holloway",
    mode: "exact",
  },
  {
    id: "GrandExecutiveCouncil6",
    q: "Who's the Grand Inner Guard?",
    a: "Andrew Blanchard",
    mode: "exact",
  },
  {
    id: "GrandExecutiveCouncil7",
    q: "Who's the Grand Outer Guard?",
    a: "Jean-Marc Cassier",
    mode: "exact",
  },
  {
    id: "GrandExecutiveCouncil8",
    q: "Who's the National Delegate?",
    a: "Kaitlynn Rahn | Keegan Dykstra",
    mode: "multi",
  },
  {
    id: "GrandExecutiveCouncil9",
    q: "Who's the other National Delegate?",
    a: "Keegan Dykstra | Kaitlynn Rahn",
    mode: "multi",
  },
  {
    id: "Flag1",
    q: "What Color is on the top left and bottom right corner?",
    a: "Dark Red",
    mode: "contains",
  },
  {
    id: "Flag2",
    q: "What color is on the top right and bottom left corner?",
    a: "Gold",
    mode: "contains",
  },
  {
    id: "Flag3",
    q: "What's on the top left corner?",
    a: "Coat of Arms",
    mode: "contains",
  },
  {
    id: "Flag4",
    q: "What's on the bottom right corner?",
    a: "Theta Tau",
    mode: "contains",
  },
  {
    id: "Flag5",
    q: "What color is the object on the bottom right corner?",
    a: "Gold",
    mode: "contains",
  },
  {
    id: "Regions1",
    q: "Name all 10 Regions (region, region, etc.)",
    a: "Atlantic, Central, Great Lakes, Gulf, Midwest, Mid-Atlantic, Northeast, Northwest, Southeast, Southwest",
    mode: "contains",
  },
  {
    id: "Regions2",
    q: "Who are the regional directors? (Name, Name)",
    a: "Jasdeep Shangari, Saul Manzano",
    mode: "contains",
  },
  {
    id: "Chapters1",
    q: "1st Chapter in SW Region: (alphabet, university, city if applicable)",
    a: "Chi, University of Arizona",
    mode: "contains",
  },
  {
    id: "Chapters2",
    q: "2nd Chapter in SW Region: (alphabet, university, city if applicable)",
    a: "Delta Gamma, Arizona State University",
    mode: "contains",
  },
  {
    id: "Chapters3",
    q: "3rd Chapter in SW Region: (alphabet, university, city if applicable)",
    a: "Epsilon Delta, University of California, San Diego",
    mode: "contains",
  },
  {
    id: "Chapters4",
    q: "4th Chapter in SW Region: (alphabet, university, city if applicable)",
    a: "Pi Delta, University of California, Irvine",
    mode: "contains",
  },
  {
    id: "Chapters5",
    q: "5th Chapter in SW Region: (alphabet, university, city if applicable)",
    a: "Sigma Delta, University of California, Riverside",
    mode: "contains",
  },
  {
    id: "Chapters6",
    q: "6th Chapter in SW Region: (alphabet, university, city if applicable)",
    a: "Upsilon Delta, University of California, Los Angeles",
    mode: "contains",
  },
  {
    id: "Chapters7",
    q: "7th Chapter in SW Region: (alphabet, university, city if applicable)",
    a: "Kappa Epsilon, University of Southern California",
    mode: "contains",
  },
  {
    id: "Chapters8",
    q: "8th Chapter in SW Region: (alphabet, university, city if applicable)",
    a: "Lambda Epsilon, University of San Diego",
    mode: "contains",
  },
  {
    id: "Chapters9",
    q: "9th Chapter in SW Region: (alphabet, university, city if applicable)",
    a: "Xi Epsilon, California State University, Long Beach",
    mode: "contains",
  },
  {
    id: "Chapters10",
    q: "10th Chapter in SW Region: (alphabet, university, city if applicable)",
    a: "Omicron Epsilon, Northern Arizona University",
    mode: "contains",
  },
  {
    id: "Chapters11",
    q: "11th Chapter in SW Region: (alphabet, university, city if applicable)",
    a: "Sigma Epsilon, University of California, Santa Barbara",
    mode: "contains",
  },
  {
    id: "Chapters12",
    q: "12th Chapter in SW Region: (alphabet, university, city if applicable)",
    a: "Phi Epsilon, California State University, Fullerton",
    mode: "contains",
  },
    {
    id: "Chapters13",
    q: "13th Chapter in SW Region: (alphabet, university, city if applicable)",
    a: "Iota Zeta, California Polytechnic State University",
    mode: "contains",
  },
  {
    id: "Requirement1",
    q: "Look at PDF for Requirements. It's too hard to implement it here.",
    a: "N/A",
    mode: "contains",
  },
  {
    id: "Requirement2",
    q: "Name one of the 4 Financial Obligations of Members:",
    a: "Initiation and Badge Fee | Housing Fee | Semester Dues | Liability Insurance",
    mode: "multi",
  },
  {
    id: "Requirement3",
    q: "Name one of the 3 remaining Financial Obligations:",
    a: "Initiation and Badge Fee | Housing Fee | Semester Dues | Liability Insurance",
    mode: "multi",
  },
  {
    id: "Requirement4",
    q: "Name one of the 2 remaining Financial Obligations:",
    a: "Initiation and Badge Fee | Housing Fee | Semester Dues | Liability Insurance",
    mode: "multi",
  },
  {
    id: "Requirement5",
    q: "Name the last Financial Obligation:",
    a: "Initiation and Badge Fee | Housing Fee | Semester Dues | Liability Insurance",
    mode: "multi",
  },
  {
    id: "Other",
    q: "What is the Official Magazine of Theta Tau?",
    a: "The Gear",
    mode: "exact",
  },
  {
    id: "MemberBadge1",
    q: "What colors are on the Member Badge? (Enter: \"Color, Color\")",
    a: "Dark Red, Gold",
    mode: "contains",
  },
  {
    id: "MemberBadge2",
    q: "How many teeth are on the Member Badge? (Enter: \"Number\")",
    a: "24",
    mode: "exact",
  },
  {
    id: "MemberBadge3",
    q: "There are two objects in the center. What object is on the left?",
    a: "tongs",
    mode: "contains",
  },
  {
    id: "MemberBadge4",
    q: "What is the object is on the right?",
    a: "hammer",
    mode: "contains",
  },
  {
    id: "MemberBadge5",
    q: "Is the object on the right \"over\"/\"under\" the object on the left?",
    a: "over",
    mode: "contains",
  },
  {
    id: "MemberBadge6",
    q: "What greek letters are on the top half?",
    a: "Theta Tau",
    mode: "contains",
  },
  {
    id: "MemberBadge7",
    q: "What color are the greek letters on the top half?",
    a: "Gold",
    mode: "contains",
  },
  {
    id: "MemberBadge8",
    q: "What is in the center?",
    a: "Dark Red Garnet",
    mode: "contains",
  },
  {
    id: "MemberBadge9",
    q: "How many pearls are on the member badge? (Enter: \"Number\")",
    a: "12",
    mode: "contains",
  },
  {
    id: "MemberBadge10",
    q: "What are the pearl patterns on the member badge? (Start on the top and go clockwise) (Enter: \"Number Number Number Number\")",
    a: "7 2 2 1",
    mode: "contains",
  },
  {
    id: "CompetingFraternitiesSororities1",
    q: "1st Competing Fraternity/Sorority: (Greek Letters)",
    a: "Alpha Omega Epsilon",
    mode: "exact",
  },
  {
    id: "CompetingFraternitiesSororities2",
    q: "2nd Competing Fraternity/Sorority: (Greek Letters)",
    a: "Alpha Rho Chi",
    mode: "exact",
  },
  {
    id: "CompetingFraternitiesSororities3",
    q: "3rd Competing Fraternity/Sorority: (Greek Letters)",
    a: "Kappa Eta Kappa",
    mode: "exact",
  },
  {
    id: "CompetingFraternitiesSororities4",
    q: "4th Competing Fraternity/Sorority: (Greek Letters)",
    a: "Phi Sigma Rho",
    mode: "exact",
  },
  {
    id: "CompetingFraternitiesSororities5",
    q: "5th Competing Fraternity/Sorority: (Greek Letters)",
    a: "Sigma Phi Delta",
    mode: "exact",
  },
  {
    id: "CompetingFraternitiesSororities6",
    q: "6th Competing Fraternity/Sorority: (Greek Letters)",
    a: "Sigma Rho",
    mode: "exact",
  },
  {
    id: "CompetingFraternitiesSororities7",
    q: "7th Competing Fraternity/Sorority: (Greek Letters)",
    a: "Kappa Theta Pi",
    mode: "exact",
  },
  {
    id: "CompetingFraternitiesSororities8",
    q: "8th Competing Fraternity/Sorority:",
    a: "Triangle",
    mode: "exact",
  },
  {
    id: "DeltaGammaSigDates1",
    q: "What is the colony creation date? (Month Day, Year)",
    a: "October 23, 1993",
    mode: "exact",
  },
  {
    id: "DeltaGammaSigDates2",
    q: "What is the name of the colony?",
    a: "Theta Tau Delta",
    mode: "exact",
  },
  {
    id: "DeltaGammaSigDates3",
    q: "What is the chapter initiation date? (Month Day, Year)",
    a: "May 6, 1995",
    mode: "exact",
  },
  {
    id: "ThetaTauSigDates1",
    q: "When did the chapter desegregate? (Year)",
    a: "1958",
    mode: "exact",
  },
  {
    id: "ThetaTauSigDates2",
    q: "When did the chapter become co-ed? (Year)",
    a: "1977",
    mode: "exact",
  },
  {
    id: "ThetaTauSigDates3",
    q: "When did the chapter get it's first computer? (Year)",
    a: "1983",
    mode: "exact",
  },
];

const classQuestions = buildPledgeClassQuestions(classInfo);
const quizRanges = [
  { name: "Quiz 2", start: 3, end: 36 },
  { name: "Quiz 3", start: 37, end: 57 },
  { name: "Quiz 4", start: 58, end: 76 },
  { name: "Quiz 5", start: 77, end: 82 },
  { name: "Quiz 6", start: 83, end: Number.MAX_SAFE_INTEGER }
];

window.THETA_QUESTIONS = [
  ...permanentQuestions.slice(0, 3).map(question => ({ ...question, quiz: "Quiz 1" })),
  ...classQuestions.map(question => ({ ...question, quiz: "Quiz 1" })),
  ...permanentQuestions.slice(3).map((question, index) => {
    const sourceIndex = index + 3;
    const range = quizRanges.find(item => sourceIndex >= item.start && sourceIndex <= item.end);
    return { ...question, quiz: range?.name || "Quiz 6" };
  })
];
