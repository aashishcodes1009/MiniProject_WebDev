const STORAGE_KEY = 'crud-student-records';

const initialStudents = [
  {
    id: 1,
    name: 'Aashish Sharma',
    email: 'aashish@example.com',
    phone: '+91 98765 43210',
    course: 'Web Development'
  },
  {
    id: 2,
    name: 'Priya Verma',
    email: 'priya@example.com',
    phone: '+91 91234 56789',
    course: 'Database Management'
  },
  {
    id: 3,
    name: 'Rahul Singh',
    email: 'rahul@example.com',
    phone: '+91 99887 76655',
    course: 'JavaScript'
  }
];

const form = document.getElementById('studentForm');
const tableBody = document.getElementById('tableBody');
const searchInput = document.getElementById('searchInput');
const recordCount = document.getElementById('recordCount');
const submitBtn = document.getElementById('submitBtn');
const cancelBtn = document.getElementById('cancelBtn');

const nameInput = document.getElementById('name');
const emailInput = document.getElementById('email');
const phoneInput = document.getElementById('phone');
const courseInput = document.getElementById('course');

let students = readStudents();
let editingId = null;

function readStudents() {
  const saved = localStorage.getItem(STORAGE_KEY);

  if (!saved) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(initialStudents));
    return [...initialStudents];
  }

  try {
    const parsed = JSON.parse(saved);
    return Array.isArray(parsed) && parsed.length ? parsed : [...initialStudents];
  } catch (error) {
    return [...initialStudents];
  }
}

function saveStudents() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(students));
}

function updateRecordCount() {
  const count = students.length;
  recordCount.textContent = `${count} record${count === 1 ? '' : 's'}`;
}

function renderTable() {
  const searchTerm = searchInput.value.trim().toLowerCase();
  const filteredStudents = students.filter((student) => {
    const values = `${student.name} ${student.email} ${student.phone} ${student.course}`.toLowerCase();
    return values.includes(searchTerm);
  });

  if (!filteredStudents.length) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="5" class="empty-state">No records found.</td>
      </tr>
    `;
    updateRecordCount();
    return;
  }

  tableBody.innerHTML = filteredStudents
    .map(
      (student) => `
        <tr>
          <td>${student.name}</td>
          <td>${student.email}</td>
          <td>${student.phone}</td>
          <td>${student.course}</td>
          <td>
            <div class="actions">
              <button type="button" class="secondary edit-btn" data-id="${student.id}">Edit</button>
              <button type="button" class="danger delete-btn" data-id="${student.id}">Delete</button>
            </div>
          </td>
        </tr>
      `
    )
    .join('');

  updateRecordCount();
}

function resetForm() {
  form.reset();
  editingId = null;
  submitBtn.textContent = 'Add Student';
  cancelBtn.classList.add('hidden');
}

function fillForm(student) {
  nameInput.value = student.name;
  emailInput.value = student.email;
  phoneInput.value = student.phone;
  courseInput.value = student.course;

  editingId = student.id;
  submitBtn.textContent = 'Update Student';
  cancelBtn.classList.remove('hidden');
  nameInput.focus();
}

function handleSubmit(event) {
  event.preventDefault();

  const student = {
    id: editingId ?? Date.now(),
    name: nameInput.value.trim(),
    email: emailInput.value.trim(),
    phone: phoneInput.value.trim(),
    course: courseInput.value.trim()
  };

  if (!student.name || !student.email || !student.phone || !student.course) {
    alert('Please fill in all student details.');
    return;
  }

  if (editingId) {
    students = students.map((entry) => (entry.id === editingId ? student : entry));
  } else {
    students.unshift(student);
  }

  saveStudents();
  resetForm();
  renderTable();
}

function handleEdit(id) {
  const student = students.find((entry) => entry.id === Number(id));
  if (!student) return;
  fillForm(student);
}

function handleDelete(id) {
  const student = students.find((entry) => entry.id === Number(id));
  if (!student) return;

  const confirmed = window.confirm(`Delete ${student.name}?`);
  if (!confirmed) return;

  students = students.filter((entry) => entry.id !== Number(id));

  if (editingId === Number(id)) {
    resetForm();
  }

  saveStudents();
  renderTable();
}

form.addEventListener('submit', handleSubmit);

searchInput.addEventListener('input', renderTable);

cancelBtn.addEventListener('click', resetForm);


document.addEventListener('click', (event) => {
  const editButton = event.target.closest('.edit-btn');
  const deleteButton = event.target.closest('.delete-btn');

  if (editButton) {
    handleEdit(editButton.dataset.id);
  }

  if (deleteButton) {
    handleDelete(deleteButton.dataset.id);
  }
});

renderTable();
