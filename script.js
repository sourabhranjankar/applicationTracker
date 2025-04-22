const form = document.getElementById("applicationForm");
const tableBody = document.querySelector("#applicationsTable tbody");
const statusFilter = document.getElementById("statusFilter");
const resumeOptions = document.getElementById("resumeOptions");
const searchCompany = document.getElementById("searchCompany");
const submitButton = document.getElementById("submitButton");
const cancelEditButton = document.getElementById("cancelEdit");

function loadApplications() {
  const applications = JSON.parse(localStorage.getItem("applications")) || [];
  const filter = statusFilter.value;
  const search = searchCompany.value.toLowerCase();

  const filteredApps = applications.filter(app =>
    (filter === "All" || app.status === filter) &&
    app.company.toLowerCase().includes(search)
  );

  tableBody.innerHTML = "";
  const resumeSet = new Set();

  filteredApps.forEach((app, index) => {
    resumeSet.add(app.resume);
    const row = document.createElement("tr");
    row.innerHTML = `
     <td>${index + 1}</td>
      <td>${app.company}</td>
      <td>${app.location}</td>
      <td>${app.mode}</td>
      <td>${app.role}</td>
      <td><a href="${app.link}" target="_blank">View</a></td>
      <td>${app.date}</td>
      <td>${app.applied_through}</td>
      <td>${app.resume}</td>
      <td>${app.applied_by}</td>
      <td>${app.status}</td>
      <td>
        <button class="btn edit-btn" onclick="editApplication(${index})">Edit</button>
        <button class="btn delete-btn" onclick="deleteApplication(${index})">Delete</button>
      </td>
    `;
    tableBody.appendChild(row);
  });

  // Update resume suggestion list
  resumeOptions.innerHTML = "";
  [...resumeSet].forEach(res => {
    const option = document.createElement("option");
    option.value = res;
    resumeOptions.appendChild(option);
  });
}

form.addEventListener("submit", function (e) {
  e.preventDefault();

  const index = parseInt(document.getElementById("editIndex").value);
  const application = {
    company: document.getElementById("company").value,
    location: document.getElementById("location").value,
    mode: document.getElementById("mode").value,
    role: document.getElementById("role").value,
    link: document.getElementById("link").value,
    date: document.getElementById("date").value,
    applied_through: document.getElementById("applied_through").value,
    resume: document.getElementById("resume").value,
    applied_by: document.getElementById("applied_by").value,
    status: document.getElementById("status").value
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
  const applications = JSON.parse(localStorage.getItem("applications")) || [];
  applications.splice(index, 1);
  localStorage.setItem("applications", JSON.stringify(applications));
  loadApplications();
}

function editApplication(index) {
  const applications = JSON.parse(localStorage.getItem("applications")) || [];
  const app = applications[index];

  document.getElementById("editIndex").value = index;
  document.getElementById("company").value = app.company;
  document.getElementById("location").value = app.location;
  document.getElementById("mode").value = app.mode;
  document.getElementById("role").value = app.role;
  document.getElementById("link").value = app.link;
  document.getElementById("date").value = app.date;
  document.getElementById("applied_through").value = app.applied_through;
  document.getElementById("resume").value = app.resume;
  document.getElementById("applied_by").value = app.applied_by;
  document.getElementById("status").value = app.status;

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

  const headers = Object.keys(applications[0]).join(",");
  const rows = applications.map(app =>
    Object.values(app).map(val => `"${val}"`).join(",")
  );
  const csv = [headers, ...rows].join("\n");

  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "job_applications.csv";
  link.click();
}

function setTodayAsDefaultDate() {
  const today = new Date().toISOString().split("T")[0];
  document.getElementById("date").value = today;
}

statusFilter.addEventListener("change", loadApplications);
searchCompany.addEventListener("input", loadApplications);

// On load
window.onload = function () {
  if (parseInt(document.getElementById("editIndex").value) === -1) {
    setTodayAsDefaultDate();
  }
  loadApplications();
};

function importFromCSV() {
  const fileInput = document.getElementById("csvFileInput");
  const file = fileInput.files[0];
  if (!file) return alert("Please select a CSV file.");

  const reader = new FileReader();
  reader.onload = function (e) {
    const text = e.target.result;
    const lines = text.split("\n").filter(Boolean);
    const headers = lines[0].trim().split(",");
    const requiredHeaders = [
      "company", "location", "mode", "role", "link",
      "date", "applied_through", "resume", "applied_by", "status"
    ];

    if (!requiredHeaders.every(h => headers.includes(h))) {
      return alert("CSV is missing one or more required columns.");
    }

    const data = lines.slice(1).map(line => {
      const values = line.split(",");
      const obj = {};
      headers.forEach((key, i) => {
        obj[key.trim()] = values[i]?.trim() || "";
      });
      return obj;
    });

    const existing = JSON.parse(localStorage.getItem("applications")) || [];
    localStorage.setItem("applications", JSON.stringify([...existing, ...data]));
    fileInput.value = ""; // reset input
    loadApplications();
    alert(`${data.length} records imported successfully.`);
  };
  reader.readAsText(file);
}

