// ====================
// CONFIG
// ====================
const SHEET_ID   = "1F6v3cm_BglUmsuW2c4ZpsdpsU3mLzl3cOai9LtfuIwM"; // e.g. "1AbCdEFGHIjKlMnOPqrSTUVwxYZ12345"
const API_KEY    = "AIzaSyCZUVJ17YsSU4ah5tlaUjmi-ELxcEgAFvQ";  // e.g. "AIzaSyD123abcXYZ"
const SHEET_NAME = "TrainingModules";

// Build the Google Sheets API URL
const apiURL = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${SHEET_NAME}?key=${API_KEY}`;

/**
 * Fetches the sheet data, returns an array of objects.
 * Example: [ { board: "CBSE", grade: "6", subject: "Science", ... }, ... ]
 */
async function fetchSheetData() {
  const response = await fetch(apiURL);
  const data = await response.json();

  // data.values is a 2D array; first row is headers
  const rows = data.values.slice(1); // remove the header row

  // Map each row to an object
  return rows.map(row => ({
    board: row[0],
    grade: row[1],
    subject: row[2],
    chapter: row[3],
    lessonPlan: row[4],
    tool: row[5],
    link: row[6]
  }));
}

// ======================
//  ON PAGE LOAD
// ======================
window.addEventListener("load", async () => {
  await populateBoards();
});

/**
 * Populate the "Board" dropdown on initial page load.
 */
async function populateBoards() {
  const data = await fetchSheetData();
  const boardSelect = document.getElementById("board");

  // Extract unique boards
  const uniqueBoards = [...new Set(data.map(item => item.board))];

  uniqueBoards.forEach(board => {
    const option = document.createElement("option");
    option.value = board;
    option.textContent = board;
    boardSelect.appendChild(option);
  });
}

// ============================
//  PATH 1: Progressive Dropdown
// ============================
async function updateGrades() {
  const data = await fetchSheetData();
  const boardVal = document.getElementById("board").value;

  resetDropdown("grade", "-- Select Grade --");
  resetDropdown("subject", "-- Select Subject --");
  resetDropdown("chapter", "-- Select Chapter --");
  resetDropdown("lessonPlan", "-- Select Lesson Plan # --");
  document.getElementById("toolOutput").innerHTML = "";

  const filtered = data.filter(item => item.board === boardVal);
  const uniqueGrades = [...new Set(filtered.map(item => item.grade))];

  const gradeSelect = document.getElementById("grade");
  uniqueGrades.forEach(grade => {
    const option = document.createElement("option");
    option.value = grade;
    option.textContent = grade;
    gradeSelect.appendChild(option);
  });
}

async function updateSubjects() {
  const data = await fetchSheetData();
  const boardVal = document.getElementById("board").value;
  const gradeVal = document.getElementById("grade").value;

  resetDropdown("subject", "-- Select Subject --");
  resetDropdown("chapter", "-- Select Chapter --");
  resetDropdown("lessonPlan", "-- Select Lesson Plan # --");
  document.getElementById("toolOutput").innerHTML = "";

  const filtered = data.filter(item => 
    item.board === boardVal && 
    item.grade === gradeVal
  );
  const uniqueSubjects = [...new Set(filtered.map(item => item.subject))];

  const subjectSelect = document.getElementById("subject");
  uniqueSubjects.forEach(subj => {
    const option = document.createElement("option");
    option.value = subj;
    option.textContent = subj;
    subjectSelect.appendChild(option);
  });
}

async function updateChapters() {
  const data = await fetchSheetData();
  const boardVal = document.getElementById("board").value;
  const gradeVal = document.getElementById("grade").value;
  const subjVal  = document.getElementById("subject").value;

  resetDropdown("chapter", "-- Select Chapter --");
  resetDropdown("lessonPlan", "-- Select Lesson Plan # --");
  document.getElementById("toolOutput").innerHTML = "";

  const filtered = data.filter(item => 
    item.board === boardVal && 
    item.grade === gradeVal &&
    item.subject === subjVal
  );
  const uniqueChapters = [...new Set(filtered.map(item => item.chapter))];

  const chapterSelect = document.getElementById("chapter");
  uniqueChapters.forEach(chap => {
    const option = document.createElement("option");
    option.value = chap;
    option.textContent = chap;
    chapterSelect.appendChild(option);
  });
}

async function updateLessonPlans() {
  const data = await fetchSheetData();
  const boardVal   = document.getElementById("board").value;
  const gradeVal   = document.getElementById("grade").value;
  const subjVal    = document.getElementById("subject").value;
  const chapterVal = document.getElementById("chapter").value;

  resetDropdown("lessonPlan", "-- Select Lesson Plan # --");
  document.getElementById("toolOutput").innerHTML = "";

  const filtered = data.filter(item => 
    item.board === boardVal &&
    item.grade === gradeVal &&
    item.subject === subjVal &&
    item.chapter === chapterVal
  );
  const uniquePlans = [...new Set(filtered.map(item => item.lessonPlan))];

  const planSelect = document.getElementById("lessonPlan");
  uniquePlans.forEach(lp => {
    const option = document.createElement("option");
    option.value = lp;
    option.textContent = lp;
    planSelect.appendChild(option);
  });
}

async function fetchTool() {
  const data = await fetchSheetData();
  const boardVal   = document.getElementById("board").value;
  const gradeVal   = document.getElementById("grade").value;
  const subjVal    = document.getElementById("subject").value;
  const chapterVal = document.getElementById("chapter").value;
  const planVal    = document.getElementById("lessonPlan").value;

  const matched = data.find(item => 
    item.board === boardVal &&
    item.grade === gradeVal &&
    item.subject === subjVal &&
    item.chapter === chapterVal &&
    item.lessonPlan === planVal
  );

  const outputDiv = document.getElementById("toolOutput");
  outputDiv.innerHTML = "";

  if (matched) {
    outputDiv.innerHTML = `
      <p><strong>Tech Tool:</strong> ${matched.tool}</p>
      <p><strong>Training Module:</strong> 
        <a href="${matched.link}" target="_blank">Open Link</a>
      </p>
    `;
  } else {
    outputDiv.innerHTML = "<p>No matching training module found.</p>";
  }
}

// Helper to reset dropdown
function resetDropdown(elId, placeholder) {
  const el = document.getElementById(elId);
  el.innerHTML = `<option value="">${placeholder}</option>`;
}

// ============================
//  PATH 2: Chapter Search
// ============================
async function searchByChapter() {
  const chapterInput = document.getElementById("chapterSearch").value.trim().toLowerCase();
  const searchDiv = document.getElementById("searchResults");

  // Clear old results
  searchDiv.innerHTML = "";

  if (!chapterInput) {
    searchDiv.innerHTML = "<p>Please enter a chapter name.</p>";
    return;
  }

  // Fetch all data
  const data = await fetchSheetData();
  // Filter by partial chapter match
  const matchingRows = data.filter(item => 
    item.chapter.toLowerCase() === chapterInput
  );

  if (matchingRows.length === 0) {
    searchDiv.innerHTML = "<p>No training modules found for this chapter.</p>";
    return;
  }

  let html = `<h4>Found ${matchingRows.length} module(s):</h4>`;
  matchingRows.forEach(row => {
    html += `
      <p>
        <strong>Board:</strong> ${row.board}<br/>
        <strong>Grade:</strong> ${row.grade}<br/>
        <strong>Subject:</strong> ${row.subject}<br/>
        <strong>Chapter:</strong> ${row.chapter}<br/>
        <strong>Lesson Plan #:</strong> ${row.lessonPlan}<br/>
        <strong>Tech Tool:</strong> ${row.tool}<br/>
        <strong>Training Module:</strong> 
          <a href="${row.link}" target="_blank">View Link</a>
      </p>
      <hr/>
    `;
  });

  searchDiv.innerHTML = html;
}
