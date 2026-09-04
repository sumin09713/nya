/* ==========================================
   MY♡SPACE
   Personal Homepage JavaScript
========================================== */


/* ==========================================
   STORAGE
========================================== */

const STORAGE_KEYS = {
  events: "myspace_events",
  notes: "myspace_notes",
  tweets: "myspace_tweets",
  music: "myspace_music"
};

function loadData(key) {
  try {
    return JSON.parse(localStorage.getItem(key)) || [];
  } catch {
    return [];
  }
}

function saveData(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}


/* ==========================================
   MOBILE MENU
========================================== */

const menuButton = document.getElementById("menuButton");
const nav = document.querySelector(".nav");

menuButton.addEventListener("click", () => {
  nav.classList.toggle("active");
});

document.querySelectorAll(".nav a").forEach(link => {
  link.addEventListener("click", () => {
    nav.classList.remove("active");
  });
});


/* ==========================================
   CALENDAR
========================================== */

let currentDate = new Date();

const calendarDays = document.getElementById("calendarDays");
const monthTitle = document.getElementById("monthTitle");

let events = loadData(STORAGE_KEYS.events);

function renderCalendar() {

  calendarDays.innerHTML = "";

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDay = new Date(year, month, 1).getDay();
  const lastDate = new Date(year, month + 1, 0).getDate();

  monthTitle.textContent = new Intl.DateTimeFormat("en-US", {
    month: "long",
    year: "numeric"
  }).format(currentDate);


  // 빈 날짜
  for (let i = 0; i < firstDay; i++) {
    const empty = document.createElement("div");
    empty.className = "calendar-day";
    calendarDays.appendChild(empty);
  }


  // 실제 날짜
  for (let day = 1; day <= lastDate; day++) {

    const cell = document.createElement("div");
    cell.className = "calendar-day";

    const dateString =
      `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

    const number = document.createElement("div");
    number.className = "day-number";
    number.textContent = day;

    cell.appendChild(number);


    // 오늘
    const today = new Date();

    if (
      day === today.getDate() &&
      month === today.getMonth() &&
      year === today.getFullYear()
    ) {
      cell.classList.add("today");
    }


    // 일정 표시
    const hasEvent = events.some(event => event.date === dateString);

    if (hasEvent) {
      const dot = document.createElement("div");
      dot.className = "event-dot";
      cell.appendChild(dot);
    }


    // 날짜 클릭
    cell.addEventListener("click", () => {
      document.getElementById("eventDate").value = dateString;
      renderEvents(dateString);
    });

    calendarDays.appendChild(cell);
  }
}


document.getElementById("prevMonth").addEventListener("click", () => {
  currentDate.setMonth(currentDate.getMonth() - 1);
  renderCalendar();
});


document.getElementById("nextMonth").addEventListener("click", () => {
  currentDate.setMonth(currentDate.getMonth() + 1);
  renderCalendar();
});


/* ==========================================
   EVENTS
========================================== */

const addEventButton = document.getElementById("addEvent");

addEventButton.addEventListener("click", () => {

  const date = document.getElementById("eventDate").value;
  const text = document.getElementById("eventText").value.trim();

  if (!date || !text) {
    alert("날짜와 일정을 입력해주세요.");
    return;
  }

  events.push({
    id: Date.now(),
    date,
    text
  });

  saveData(STORAGE_KEYS.events, events);

  document.getElementById("eventText").value = "";

  renderCalendar();
  renderEvents(date);
});


function renderEvents(selectedDate = null) {

  const list = document.getElementById("eventList");

  list.innerHTML = "";

  let filtered = selectedDate
    ? events.filter(event => event.date === selectedDate)
    : events;


  if (filtered.length === 0) {
    list.innerHTML = `
      <p style="font-size:11px;color:#999;">
        등록된 일정이 없습니다.
      </p>
    `;
    return;
  }


  filtered.forEach(event => {

    const item = document.createElement("div");
    item.className = "event-item";

    item.innerHTML = `
      <div>
        <strong>${escapeHTML(event.text)}</strong>
        <div style="color:#999;margin-top:4px;">
          ${event.date}
        </div>
      </div>

      <button class="delete-btn"
              onclick="deleteEvent(${event.id})">
        삭제
      </button>
    `;

    list.appendChild(item);
  });
}


window.deleteEvent = function(id) {

  events = events.filter(event => event.id !== id);

  saveData(STORAGE_KEYS.events, events);

  renderCalendar();
  renderEvents();
};


/* ==========================================
   NOTES
========================================== */

let notes = loadData(STORAGE_KEYS.notes);

const addNoteButton = document.getElementById("addNote");

addNoteButton.addEventListener("click", () => {

  const title = document.getElementById("noteTitle").value.trim();
  const content = document.getElementById("noteContent").value.trim();

  if (!title || !content) {
    alert("노트 제목과 내용을 입력해주세요.");
    return;
  }

  notes.unshift({
    id: Date.now(),
    title,
    content,
    date: new Date().toLocaleDateString("ko-KR")
  });

  saveData(STORAGE_KEYS.notes, notes);

  document.getElementById("noteTitle").value = "";
  document.getElementById("noteContent").value = "";

  renderNotes();
  updateCounts();
});


function renderNotes() {

  const grid = document.getElementById("notesGrid");

  grid.innerHTML = "";

  if (notes.length === 0) {

    grid.innerHTML = `
      <div class="note-card">
        <h3>첫 번째 노트를 작성해보세요 ♡</h3>
        <p>
          위의 입력창에서 생각이나 일상을 기록할 수 있습니다.
        </p>
      </div>
    `;

    return;
  }


  notes.forEach(note => {

    const card = document.createElement("article");

    card.className = "note-card";

    card.innerHTML = `
      <button
        class="delete-btn note-delete"
        onclick="deleteNote(${note.id})">
        ×
      </button>

      <h3>${escapeHTML(note.title)}</h3>

      <p>${escapeHTML(note.content)}</p>

      <div class="note-date">
        ${note.date}
      </div>
    `;

    grid.appendChild(card);
  });
}


window.deleteNote = function(id) {

  notes = notes.filter(note => note.id !== id);

  saveData(STORAGE_KEYS.notes, notes);

  renderNotes();
  updateCounts();
};


/* ==========================================
   TWEETS
========================================== */

let tweets = loadData(STORAGE_KEYS.tweets);

const tweetText = document.getElementById("tweetText");
const tweetCounter = document.getElementById("tweetCounter");

tweetText.addEventListener("input", () => {
  tweetCounter.textContent =
    `${tweetText.value.length} / 280`;
});


document.getElementById("addTweet").addEventListener("click", () => {

  const text = tweetText.value.trim();

  if (!text) {
    alert("게시할 내용을 입력해주세요.");
    return;
  }

  tweets.unshift({
    id: Date.now(),
    text,
    date: new Date().toLocaleString("ko-KR")
  });

  saveData(STORAGE_KEYS.tweets, tweets);

  tweetText.value = "";
  tweetCounter.textContent = "0 / 280";

  renderTweets();
  updateCounts();
});


function renderTweets() {

  const list = document.getElementById("tweetsList");

  list.innerHTML = "";


  if (tweets.length === 0) {

    list.innerHTML = `
      <div class="tweet-card">
        <p style="color:#999;font-size:13px;">
          아직 게시물이 없습니다. 첫 번째 글을 남겨보세요 ♡
        </p>
      </div>
    `;

    return;
  }


  tweets.forEach(tweet => {

    const card = document.createElement("article");

    card.className = "tweet-card";

    card.innerHTML = `

      <div class="tweet-head">

        <div class="tweet-avatar">♡</div>

        <div class="tweet-user">
          <strong>YOUR NAME</strong>
          <span>@your_username</span>
        </div>

      </div>

      <div class="tweet-content">
        ${escapeHTML(tweet.text)}
      </div>

      <div class="tweet-footer">
        <span>${tweet.date}</span>

        <button
          class="delete-btn"
          onclick="deleteTweet(${tweet.id})">
          삭제
        </button>
      </div>
    `;

    list.appendChild(card);
  });
}


window.deleteTweet = function(id) {

  tweets = tweets.filter(tweet => tweet.id !== id);

  saveData(STORAGE_KEYS.tweets, tweets);

  renderTweets();
  updateCounts();
};


/* ==========================================
   YOUTUBE MUSIC
========================================== */

let music = loadData(STORAGE_KEYS.music);

document.getElementById("addMusic").addEventListener("click", () => {

  const url = document.getElementById("youtubeUrl").value.trim();
  const title =
    document.getElementById("youtubeTitle").value.trim() ||
    "My Favorite Music";

  const videoId = getYouTubeID(url);

  if (!videoId) {
    alert("올바른 YouTube 주소를 입력해주세요.");
    return;
  }

  music.unshift({
    id: Date.now(),
    videoId,
    title
  });

  saveData(STORAGE_KEYS.music, music);

  document.getElementById("youtubeUrl").value = "";
  document.getElementById("youtubeTitle").value = "";

  renderMusic();
});


function getYouTubeID(url) {

  try {

    const parsed = new URL(url);

    if (parsed.hostname.includes("youtu.be")) {
      return parsed.pathname.substring(1).split("?")[0];
    }

    if (
      parsed.hostname.includes("youtube.com") &&
      parsed.searchParams.get("v")
    ) {
      return parsed.searchParams.get("v");
    }

    if (
      parsed.hostname.includes("youtube.com") &&
      parsed.pathname.startsWith("/shorts/")
    ) {
      return parsed.pathname.split("/")[2];
    }

    if (
      parsed.hostname.includes("youtube.com") &&
      parsed.pathname.startsWith("/embed/")
    ) {
      return parsed.pathname.split("/")[2];
    }

  } catch {
    return null;
  }

  return null;
}


function renderMusic() {

  const grid = document.getElementById("musicGrid");

  grid.innerHTML = "";


  if (music.length === 0) {

    grid.innerHTML = `
      <div class="music-card">
        <div style="padding:30px;">
          <h3>나만의 음악을 추가해보세요 ♡</h3>
          <p style="font-size:12px;color:#999;margin-top:10px;">
            위에서 YouTube 주소를 입력하면 음악이 여기에 표시됩니다.
          </p>
        </div>
      </div>
    `;

    return;
  }


  music.forEach(item => {

    const card = document.createElement("article");

    card.className = "music-card";

    card.innerHTML = `

      <div class="music-video">

        <iframe
          src="https://www.youtube.com/embed/${encodeURIComponent(item.videoId)}"
          title="${escapeHTML(item.title)}"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowfullscreen>
        </iframe>

      </div>

      <div class="music-info">

        <div>
          <h3>${escapeHTML(item.title)}</h3>
          <span>YouTube Music</span>
        </div>

        <button
          class="delete-btn"
          onclick="deleteMusic(${item.id})">
          삭제
        </button>

      </div>
    `;

    grid.appendChild(card);
  });
}


window.deleteMusic = function(id) {

  music = music.filter(item => item.id !== id);

  saveData(STORAGE_KEYS.music, music);

  renderMusic();
};


/* ==========================================
   COUNTERS
========================================== */

function updateCounts() {

  document.getElementById("postCount").textContent =
    tweets.length;

  document.getElementById("noteCount").textContent =
    notes.length;
}


/* ==========================================
   SECURITY
========================================== */

function escapeHTML(value) {

  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}


/* ==========================================
   INITIALIZE
========================================== */

renderCalendar();
renderEvents();
renderNotes();
renderTweets();
renderMusic();
updateCounts();
