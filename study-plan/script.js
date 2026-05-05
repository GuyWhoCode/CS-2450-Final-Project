const VIEWS = [
    "view-plan-step1",
    "view-plan-step2",
    "view-plan-loading",
    "view-plan-output",
];

const DAYS = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
];

const EXAMS_STORAGE_KEY = "sessionUserExams";

const PRIORITY_COLOR = {
    high: "danger",
    medium: "warning",
    low: "success",
};

let userExams = [];

function loadUserExams() {
    const saved = sessionStorage.getItem(EXAMS_STORAGE_KEY);

    if (!saved) return [];

    try {
        const parsed = JSON.parse(saved);
        return Array.isArray(parsed) ? parsed : [];
    } catch {
        return [];
    }
}

function showView(id) {
    VIEWS.forEach((v) => {
        const view = document.getElementById(v);
        if (view) view.style.display = "none";
    });

    const activeView = document.getElementById(id);
    if (activeView) activeView.style.display = "block";

    window.scrollTo(0, 0);

    if (id === "view-plan-step1") restoreStep1();
}

function formatDate(dateStr) {
    const [year, month, day] = dateStr.split("-").map(Number);

    return new Date(year, month - 1, day).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
    });
}

function capitalize(word) {
    if (!word) return "";
    return word.charAt(0).toUpperCase() + word.slice(1);
}

function restoreStep1() {
    const input = document.getElementById("input-study-hours");
    const error = document.getElementById("study-hours-error");
    const saved = sessionStorage.getItem("studyHours");

    if (saved && input) input.value = saved;
    if (error) error.textContent = "";
    if (input) input.classList.remove("is-invalid");
}

function submitStep1() {
    const inputEl = document.getElementById("input-study-hours");
    const errEl = document.getElementById("study-hours-error");
    const val = parseFloat(inputEl.value);

    if (isNaN(val) || val <= 0) {
        errEl.textContent = "Please enter a number greater than 0.";
        inputEl.classList.add("is-invalid");
        return;
    }

    if (val > 80) {
        errEl.textContent =
            "Please enter a realistic number of study hours per week, 80 or less.";
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
    const inputEl = document.getElementById("input-obligations");
    const errEl = document.getElementById("obligations-error");
    const val = parseFloat(inputEl.value);

    if (isNaN(val) || val < 0) {
        errEl.textContent = "Please enter 0 or more hours.";
        inputEl.classList.add("is-invalid");
        return;
    }

    if (val > 120) {
        errEl.textContent =
            "Please enter a realistic number of obligation hours per week, 120 or less.";
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

function generateAndRenderPlan() {
    const studyHours = parseFloat(sessionStorage.getItem("studyHours"));
    const obligations = parseFloat(sessionStorage.getItem("obligations"));

    let studyDays = 5;

    if (obligations >= 50) studyDays = 3;
    else if (obligations >= 35) studyDays = 4;

    const dailyHours = Math.max(
        0.5,
        Math.round((studyHours / studyDays) * 2) / 2,
    );

    const sortedExams = [...userExams].sort(
        (a, b) => new Date(a.date) - new Date(b.date),
    );

    const schedule = DAYS.map((day, i) => {
        if (i >= studyDays) return { day, rest: true };

        if (sortedExams.length === 0) {
            return { day, noExam: true, hours: dailyHours };
        }

        const exam = sortedExams[i % sortedExams.length];
        return { day, exam, hours: dailyHours };
    });

    document.getElementById("plan-summary").textContent =
        `${studyHours} study hrs/week · ${obligations} obligation hrs/week · ${studyDays} study days · ~${dailyHours} hrs/day`;

    const container = document.getElementById("plan-schedule");

    container.innerHTML = schedule
        .map((item) => {
            let body = "";

            if (item.rest) {
                body = `
                    <div class="plan-day-body rest">
                        <span class="text-muted fst-italic small">Rest day</span>
                    </div>
                `;
            } else if (item.noExam) {
                body = `
                    <div class="plan-day-body rest">
                        <span class="text-muted fst-italic small">No exams added yet</span>
                    </div>
                `;
            } else {
                body = `
                    <div class="plan-day-body">
                        <div>
                            <strong>${item.exam.className}: ${item.exam.examName}</strong>
                            <div class="mt-1">
                                <span class="badge bg-secondary me-1">${item.exam.className}</span>
                                <span class="badge bg-${PRIORITY_COLOR[item.exam.priority]}-subtle text-${PRIORITY_COLOR[item.exam.priority]}-emphasis me-1">
                                    ${capitalize(item.exam.priority)} priority
                                </span>
                                <span class="text-muted small">Due ${formatDate(item.exam.date)}</span>
                            </div>
                        </div>
                        <span class="plan-hours-badge">${item.hours} hr${item.hours !== 1 ? "s" : ""}</span>
                    </div>
                `;
            }

            return `
                <div class="plan-day-card">
                    <div class="plan-day-header">${item.day}</div>
                    ${body}
                </div>
            `;
        })
        .join("");
}

document.addEventListener("DOMContentLoaded", () => {
    userExams = loadUserExams();
    showView("view-plan-step1");
});
