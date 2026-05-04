const VIEWS = [
    "view-dashboard",
    "view-plan-step1",
    "view-plan-step2",
    "view-plan-loading",
    "view-plan-output",
];

function showView(id) {
    VIEWS.forEach((v) => (document.getElementById(v).style.display = "none"));
    document.getElementById(id).style.display = "block";
    window.scrollTo(0, 0);
    if (id === "view-plan-step1") restoreStep1();
}

const DAYS = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
];

const EXAMS = [
    {
        title: "Data Structures Midterm",
        course: "CS301",
        date: "2026-05-07",
        priority: "high",
    },
    {
        title: "Psychology Quiz",
        course: "PSY101",
        date: "2026-05-08",
        priority: "medium",
    },
    {
        title: "Cybersecurity Midterm",
        course: "CS350",
        date: "2026-05-09",
        priority: "high",
    },
    {
        title: "Psychology Final",
        course: "PSY101",
        date: "2026-05-20",
        priority: "low",
    },
    {
        title: "Python Exam",
        course: "CS150",
        date: "2026-05-22",
        priority: "medium",
    },
];

function restoreStep1() {
    const saved = sessionStorage.getItem("studyHours");
    if (saved) document.getElementById("input-study-hours").value = saved;
    document.getElementById("study-hours-error").textContent = "";
    document.getElementById("input-study-hours").classList.remove("is-invalid");
}

function submitStep1() {
    const val = parseFloat(document.getElementById("input-study-hours").value);
    const errEl = document.getElementById("study-hours-error");
    const inputEl = document.getElementById("input-study-hours");
    if (!val || val <= 0) {
        errEl.textContent = "Please enter a number greater than 0.";
        inputEl.classList.add("is-invalid");
        return;
    }
    inputEl.classList.remove("is-invalid");
    errEl.textContent = "";
    sessionStorage.setItem("studyHours", val);
    const saved2 = sessionStorage.getItem("obligations");
    if (saved2) document.getElementById("input-obligations").value = saved2;
    showView("view-plan-step2");
}

function submitStep2() {
    const val = parseFloat(document.getElementById("input-obligations").value);
    const errEl = document.getElementById("obligations-error");
    const inputEl = document.getElementById("input-obligations");
    if (isNaN(val) || val < 0) {
        errEl.textContent = "Please enter 0 or more hours.";
        inputEl.classList.add("is-invalid");
        return;
    }
    inputEl.classList.remove("is-invalid");
    errEl.textContent = "";
    sessionStorage.setItem("obligations", val);
    showView("view-plan-loading");
    setTimeout(() => {
        generateAndRenderPlan();
        showView("view-plan-output");
    }, 1500);
}

const PRIORITY_COLOR = {
    high: "danger",
    medium: "warning",
    low: "success",
};

function formatDate(dateStr) {
    const [year, month, day] = dateStr.split("-").map(Number);
    return new Date(year, month - 1, day).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
    });
}

function generateAndRenderPlan() {
    const studyHours = parseFloat(sessionStorage.getItem("studyHours"));
    const obligations = parseFloat(sessionStorage.getItem("obligations"));

    // Obligations affect how many days per week you can study
    let studyDays = 5;
    if (obligations >= 50) studyDays = 3;
    else if (obligations >= 35) studyDays = 4;

    const dailyHours = Math.max(0.5, Math.round((studyHours / studyDays) * 2) / 2);

    const schedule = DAYS.map((day, i) => {
        if (i >= studyDays) return { day, rest: true };
        const exam = EXAMS[i % EXAMS.length];
        return { day, exam, hours: dailyHours };
    });

    document.getElementById("plan-summary").textContent =
        `${studyHours} study hrs/week · ${obligations} obligation hrs/week · ${studyDays} study days · ~${dailyHours} hrs/day`;

    const container = document.getElementById("plan-schedule");
    container.innerHTML = schedule
        .map((item) => {
            const body = item.rest
                ? `<div class="plan-day-body rest">
                       <span class="text-muted fst-italic small">Rest day</span>
                   </div>`
                : `<div class="plan-day-body">
                       <div>
                           <strong>${item.exam.title}</strong>
                           <div class="mt-1">
                               <span class="badge bg-secondary me-1">${item.exam.course}</span>
                               <span class="badge bg-${PRIORITY_COLOR[item.exam.priority]}-subtle text-${PRIORITY_COLOR[item.exam.priority]}-emphasis me-1">
                                   ${item.exam.priority} priority
                               </span>
                               <span class="text-muted small">Due ${formatDate(item.exam.date)}</span>
                           </div>
                       </div>
                       <span class="plan-hours-badge">${item.hours} hr${item.hours !== 1 ? "s" : ""}</span>
                   </div>`;
            return `
            <div class="plan-day-card">
                <div class="plan-day-header">${item.day}</div>
                ${body}
            </div>`;
        })
        .join("");
}

let userExams = [
    {
        className: "Data Structures",
        examName: "Midterm",
        date: "2026-05-07",
        priority: "high",
    },
    {
        className: "Psychology",
        examName: "Quiz",
        date: "2026-05-08",
        priority: "medium",
    },
    {
        className: "Cybersecurity",
        examName: "Final",
        date: "2026-05-12",
        priority: "high",
    },
];

function addClassExam() {
    const className = document.getElementById("class-name").value.trim();
    const examName = document.getElementById("exam-name").value.trim();
    const date = document.getElementById("exam-date").value;
    const priority = document.getElementById("exam-priority").value;
    const error = document.getElementById("class-error");

    if (!className || !examName || !date) {
        error.textContent = "Please fill out all fields before adding an exam.";
        return;
    }

    error.textContent = "";

    userExams.push({
        className,
        examName,
        date,
        priority,
    });

    document.getElementById("class-name").value = "";
    document.getElementById("exam-name").value = "";
    document.getElementById("exam-date").value = "";
    document.getElementById("exam-priority").value = "high";

    renderDashboard();

    console.log("Updated Exams:", userExams); // debugging
}

function deleteExam(index) {
    userExams.splice(index, 1);
    renderDashboard();
}

function renderDashboard() {
    const examList = document.getElementById("exam-list");
    const urgentList = document.getElementById("urgent-list");
    const examCount = document.getElementById("exam-count");

    if (!examList || !urgentList || !examCount) return;

    userExams.sort((a, b) => new Date(a.date) - new Date(b.date));

    examCount.textContent = `${userExams.length} exam${userExams.length !== 1 ? "s" : ""}`;

    if (userExams.length === 0) {
        examList.innerHTML = `
            <div class="empty-state">
                No exams added yet. Add a class exam to get started.
            </div>
        `;
        urgentList.innerHTML = `
            <div class="empty-state">
                No urgent deadlines yet.
            </div>
        `;
        return;
    }

    examList.innerHTML = userExams
        .map((exam, index) => {
            return `
                <div class="exam-card priority-${exam.priority}">
                    <div class="d-flex justify-content-between align-items-start">
                        <div>
                            <div class="exam-title">${exam.className}: ${exam.examName}</div>
                            <div class="exam-meta">
                                Date: ${formatDashboardDate(exam.date)} · 
                                Priority: ${capitalize(exam.priority)}
                            </div>
                        </div>
                        <button class="delete-btn" onclick="deleteExam(${index})">
                            Remove
                        </button>
                    </div>
                </div>
            `;
        })
        .join("");

    const urgentExams = userExams.filter((exam) => daysUntil(exam.date) <= 7);

    if (urgentExams.length === 0) {
        urgentList.innerHTML = `
            <div class="empty-state">
                No exams within the next 7 days.
            </div>
        `;
    } else {
        urgentList.innerHTML = urgentExams
            .map((exam) => {
                return `
                    <div class="exam-card priority-${exam.priority}">
                        <div class="exam-title">${exam.className}: ${exam.examName}</div>
                        <div class="exam-meta">
                            ${daysUntil(exam.date)} day(s) away · ${formatDashboardDate(exam.date)}
                        </div>
                    </div>
                `;
            })
            .join("");
    }
}

function daysUntil(dateStr) {
    const today = new Date();
    const examDate = new Date(dateStr);
    today.setHours(0, 0, 0, 0);
    examDate.setHours(0, 0, 0, 0);

    const diff = examDate - today;
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

function formatDashboardDate(dateStr) {
    const [year, month, day] = dateStr.split("-").map(Number);
    return new Date(year, month - 1, day).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
    });
}

function capitalize(word) {
    return word.charAt(0).toUpperCase() + word.slice(1);
}

document.addEventListener("DOMContentLoaded", () => {
    showView("view-dashboard");
    renderDashboard();
});
