const todoContainer = document.querySelector('.todo-container');
const addNoteBtn = document.querySelector('.add-note');
const popupOverlay = document.querySelector('.popup-overlay');

const popupElements = {
  title: popupOverlay.querySelector('.note-title-input'),
  desc: popupOverlay.querySelector('.note-content'),
  category: popupOverlay.querySelector('.note-category'),
  date: popupOverlay.querySelector('.note-date'),
  save: popupOverlay.querySelector('.add-btn'),
  close: popupOverlay.querySelector('.delete-btn'),
  heading: popupOverlay.querySelector('h2')
};

const STORAGE_KEY = 'todo-notes';
let notes = [];
let editingNote = null;

const capitalize = (str = '') =>
  str ? str.charAt(0).toUpperCase() + str.slice(1) : '';

function togglePopup(show = true) {
  popupOverlay.style.display = show ? 'flex' : 'none';
  if (show) setTimeout(() => popupElements.title.focus(), 100);
}

function resetPopup() {
  popupElements.title.value = '';
  popupElements.desc.value = '';
  popupElements.category.value = 'personal';
  popupElements.date.value = '';
  popupElements.heading.textContent = 'Create Task';
  popupElements.save.textContent = 'Create Task';
  popupElements.close.textContent = 'Cancel';
  editingNote = null;
}

function saveNotesToStorage() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
}

function loadNotesFromStorage() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error('localStorage okunurken hata:', err);
    return [];
  }
}

function renderNote(noteData) {
  const { id, title, desc, category, date } = noteData;

  const note = document.createElement('div');
  note.classList.add('note', category);
  note.dataset.id = id;

  note.innerHTML = `
    <button class="delete-note-btn">
      <span class="material-symbols-outlined">delete</span>
    </button>
    <button class="edit-note-btn">
      <span class="material-symbols-outlined">edit</span>
    </button>
    <h3 class="note-title">${capitalize(title)}</h3>
    <p class="note-desc">${capitalize(desc) || 'No description.'}</p>
    <div class="note-footer">
      <span class="note-category">${capitalize(category)}</span>
      <span class="note-date">${date || 'No date'}</span>
    </div>
  `;

  todoContainer.insertBefore(note, addNoteBtn);

  note.addEventListener('click', (e) => {
    e.stopPropagation();

    const isActive = note.classList.contains('active');
    document.querySelectorAll('.note.active').forEach((n) => {
      n.classList.remove('active');
      n.querySelector('.delete-note-btn').style.display = 'none';
      n.querySelector('.edit-note-btn').style.display = 'none';
    });

    if (!isActive) {
      note.classList.add('active');
      note.querySelector('.delete-note-btn').style.display = 'flex';
      note.querySelector('.edit-note-btn').style.display = 'flex';
    }
  });

  note.querySelector('.delete-note-btn').addEventListener('click', (e) => {
    e.stopPropagation();
    const id = note.dataset.id;
    notes = notes.filter((n) => n.id !== id);
    saveNotesToStorage();
    note.remove();
  });

  note.querySelector('.edit-note-btn').addEventListener('click', (e) => {
    e.stopPropagation();
    editingNote = note;

    popupElements.title.value = note.querySelector('.note-title').textContent;
    popupElements.desc.value = note.querySelector('.note-desc').textContent;
    popupElements.category.value = note.classList.contains('work')
      ? 'work'
      : note.classList.contains('other')
      ? 'other'
      : 'personal';
    popupElements.date.value =
      note.querySelector('.note-date').textContent !== 'No date'
        ? note.querySelector('.note-date').textContent
        : '';

    popupElements.heading.textContent = 'Edit Task';
    popupElements.save.textContent = 'Save Changes';
    popupElements.close.textContent = 'Cancel';

    togglePopup(true);
  });
}

function createAndSaveNote(noteData) {
  const newNote = {
    id: Date.now().toString() + Math.random().toString(16).slice(2),
    title: noteData.title,
    desc: noteData.desc,
    category: noteData.category,
    date: noteData.date
  };

  notes.push(newNote);
  saveNotesToStorage();
  renderNote(newNote);
}

document.addEventListener('click', () => {
  document.querySelectorAll('.note.active').forEach((n) => {
    n.classList.remove('active');
    n.querySelector('.delete-note-btn').style.display = 'none';
    n.querySelector('.edit-note-btn').style.display = 'none';
  });
});

popupElements.close.addEventListener('click', () => {
  resetPopup();
  togglePopup(false);
});

addNoteBtn.addEventListener('click', () => {
  resetPopup();
  togglePopup(true);
});

popupOverlay.addEventListener('click', (e) => {
  if (e.target === popupOverlay) {
    resetPopup();
    togglePopup(false);
  }
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    resetPopup();
    togglePopup(false);
  }
});

popupElements.save.addEventListener('click', () => {
  const noteData = {
    title: popupElements.title.value.trim(),
    desc: popupElements.desc.value.trim(),
    category: popupElements.category.value,
    date: popupElements.date.value
  };

  if (!noteData.title) {
    alert('Lütfen bir başlık girin.');
    return;
  }

  if (editingNote) {
    const id = editingNote.dataset.id;
    const index = notes.findIndex((n) => n.id === id);
    if (index !== -1) {
      notes[index] = { ...notes[index], ...noteData };
      saveNotesToStorage();
    }

    editingNote.querySelector('.note-title').textContent = capitalize(noteData.title);
    editingNote.querySelector('.note-desc').textContent =
      capitalize(noteData.desc) || 'No description.';
    editingNote.querySelector('.note-category').textContent = capitalize(noteData.category);
    editingNote.querySelector('.note-date').textContent = noteData.date || 'No date';
    editingNote.classList.remove('personal', 'work', 'other');
    editingNote.classList.add(noteData.category);
  } else {
    createAndSaveNote(noteData);
  }

  resetPopup();
  togglePopup(false);
});

notes = loadNotesFromStorage();
notes.forEach(renderNote);
