const form = document.getElementById("applicationForm");
const tableBody = document.querySelector("#applicationsTable tbody");
const submitButton = document.getElementById("submitButton");
const cancelEditButton = document.getElementById("cancelEdit");

function loadApplications() {
    const applications = JSON.parse(localStorage.getItem("applications")) || [];
    tableBody.innerHTML = "";
  
    applications.forEach((app, index) => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${index + 1}</td>
            <td>${app.company}</td>
            <td>${app.role}</td>
            <td><a href="${app.link}" target="_blank">View</a></td>
            <td>${app.date}</td>
            <td>${app.resume}</td>
            <td>
                <button class="btn edit-btn" onclick="editApplication(${index})">Edit</button>
                <button class="btn delete-btn" onclick="deleteApplication(${index})">Delete</button>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

form.addEventListener("submit", function (e) {
    e.preventDefault();
  
    const index = parseInt(document.getElementById("editIndex").value);
    const application = {
        company: document.getElementById("company").value,
        role: document.getElementById("role").value,
        link: document.getElementById("link").value,
        date: document.getElementById("date").value,
        resume: "Full Stack" // Fixed default value
    };
  
    const applications = JSON.parse(localStorage.getItem("applications")) || [];
  
    if (index >= 0) {
        applications[index] = application;
        submitButton.textContent = "Submit";
        cancelEditButton.classList.add("hidden");
    } else {
        applications.push(application);
    }
  
    localStorage.setItem("applications", JSON.stringify(applications));
    form.reset();
    document.getElementById("editIndex").value = -1;
    setTodayAsDefaultDate();
    loadApplications();
});
  
function deleteApplication(index) {
    if (confirm("Are you sure you want to delete this application?")) {
        const applications = JSON.parse(localStorage.getItem("applications")) || [];
        applications.splice(index, 1);
        localStorage.setItem("applications", JSON.stringify(applications));
        loadApplications();
    }
}
  
function editApplication(index) {
    const applications = JSON.parse(localStorage.getItem("applications")) || [];
    const app = applications[index];
  
    document.getElementById("editIndex").value = index;
    document.getElementById("company").value = app.company;
    document.getElementById("role").value = app.role;
    document.getElementById("link").value = app.link;
    document.getElementById("date").value = app.date;
  
    submitButton.textContent = "Update";
    cancelEditButton.classList.remove("hidden");
}
  
cancelEditButton.addEventListener("click", function () {
    form.reset();
    document.getElementById("editIndex").value = -1;
    submitButton.textContent = "Submit";
    cancelEditButton.classList.add("hidden");
    setTodayAsDefaultDate();
});
  
function exportToCSV() {
    const applications = JSON.parse(localStorage.getItem("applications")) || [];
    if (applications.length === 0) return alert("No data to export.");
  
    const headers = ["company", "role", "link", "date", "resume"].join(",");
    const rows = applications.map(app =>
        `"${app.company}","${app.role}","${app.link}","${app.date}","${app.resume}"`
    );
    const csv = [headers, ...rows].join("\n");
  
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "job_applications.csv";
    link.click();
}
  
function reset_storage() {
    if (confirm("Are you sure you want to delete all applications? This action cannot be undone.")) {
        localStorage.clear();
        location.reload();
    }
}
  
function setTodayAsDefaultDate() {
    const today = new Date().toISOString().split("T")[0];
    if (document.getElementById("editIndex").value === "-1") {
        document.getElementById("date").value = today;
    }
}
  
// On load
window.onload = function () {
    setTodayAsDefaultDate();
    loadApplications();
};
