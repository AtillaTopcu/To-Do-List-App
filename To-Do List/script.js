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

let editingNote = null;

const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);

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
  popupElements.close.textContent = 'Delete Task';
  editingNote = null;
}

function createNote({ title, desc, category, date }) {
  const note = document.createElement('div');
  note.classList.add('note', category);

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
    popupElements.close.textContent = 'Delete Changes';

    togglePopup(true);
  });
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
    editingNote.querySelector('.note-title').textContent = capitalize(noteData.title);
    editingNote.querySelector('.note-desc').textContent =
      capitalize(noteData.desc) || 'No description.';
    editingNote.querySelector('.note-category').textContent = capitalize(noteData.category);
    editingNote.querySelector('.note-date').textContent = noteData.date || 'No date';
    editingNote.className = `note ${noteData.category}`;
  } else {
    createNote(noteData);
  }

  resetPopup();
  togglePopup(false);
});