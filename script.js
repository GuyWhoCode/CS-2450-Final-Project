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

function daysUntil(dateStr) {
    const today = new Date();
    const examDate = new Date(dateStr);
    today.setHours(0, 0, 0, 0);
    examDate.setHours(0, 0, 0, 0);

    const diff = examDate - today;
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

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

document.addEventListener("DOMContentLoaded", () => {
    renderDashboard();
});