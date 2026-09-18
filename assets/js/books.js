// SCHITAB — Books management

let allBooks = [];

async function loadBooks() {
  const { data, error } = await supabaseClient
    .from('books')
    .select('*, categories(name)')
    .order('created_at', { ascending: false });

  if (error) {
    showToast('Failed to load books: ' + error.message, 'error');
    return;
  }

  allBooks = data || [];
  renderBooksList();
}

function renderBooksList() {
  const el = document.getElementById('booksList');

  if (allBooks.length === 0) {
    el.innerHTML = '<div class="empty-state"><p>No books yet. Add your first one to start building the catalog.</p></div>';
    return;
  }

  el.innerHTML = allBooks.map(book => `
    <div class="list-item">
      <img class="list-thumb" src="${book.cover_url || 'https://placehold.co/48x64/EEF0F4/999?text=%20'}" alt="">
      <div class="list-info">
        <div class="list-title">${escapeHtml(book.title)}</div>
        <div class="list-sub">${escapeHtml(book.categories?.name || 'Uncategorized')} · ${formatPrice(book.price)} <span style="text-decoration:line-through;color:#9CA3AF;">${formatPrice(book.mrp)}</span></div>
      </div>
      <span class="badge ${book.is_active ? 'badge-active' : 'badge-inactive'}">${book.is_active ? 'Live' : 'Hidden'}</span>
      <div class="list-actions">
        <button class="btn btn-outline btn-sm" onclick="editBook('${book.id}')">Edit</button>
      </div>
    </div>
  `).join('');
}

function openBookForm() {
  document.getElementById('bookForm').reset();
  document.getElementById('bookId').value = '';
  document.getElementById('bookModalTitle').textContent = 'Add Book';
  document.getElementById('bookActive').checked = true;
  openModal('bookModal');
}

function editBook(id) {
  const book = allBooks.find(b => b.id === id);
  if (!book) return;

  document.getElementById('bookId').value = book.id;
  document.getElementById('bookModalTitle').textContent = 'Edit Book';
  document.getElementById('bookTitle').value = book.title || '';
  document.getElementById('bookAuthor').value = book.author || '';
  document.getElementById('bookPublisher').value = book.publisher || '';
  document.getElementById('bookIsbn').value = book.isbn || '';
  document.getElementById('bookEdition').value = book.edition || '';
  document.getElementById('bookCategory').value = book.category_id || '';
  document.getElementById('bookMrp').value = book.mrp;
  document.getElementById('bookPrice').value = book.price;
  document.getElementById('bookStock').value = book.stock_quantity || 0;
  document.getElementById('bookAvailability').value = book.availability || 'available_to_order';
  document.getElementById('bookCoverUrl').value = book.cover_url || '';
  document.getElementById('bookDescription').value = book.description || '';
  document.getElementById('bookActive').checked = book.is_active;

  openModal('bookModal');
}

async function uploadCoverIfNeeded() {
  const fileInput = document.getElementById('bookCoverFile');
  const file = fileInput.files[0];
  if (!file) return document.getElementById('bookCoverUrl').value.trim() || null;

  const ext = file.name.split('.').pop();
  const path = `covers/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

  const { error } = await supabaseClient.storage.from('book-covers').upload(path, file);
  if (error) {
    showToast('Cover upload failed: ' + error.message, 'error');
    return document.getElementById('bookCoverUrl').value.trim() || null;
  }

  const { data } = supabaseClient.storage.from('book-covers').getPublicUrl(path);
  return data.publicUrl;
}

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('bookForm');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = document.getElementById('bookSaveBtn');
    btn.disabled = true;
    btn.innerHTML = '<span class="spinner"></span> Saving...';

    const id = document.getElementById('bookId').value;
    const title = document.getElementById('bookTitle').value.trim();

    const coverUrl = await uploadCoverIfNeeded();

    const payload = {
      title,
      slug: slugify(title) + '-' + Math.random().toString(36).slice(2, 6),
      author: document.getElementById('bookAuthor').value.trim() || null,
      publisher: document.getElementById('bookPublisher').value.trim() || null,
      isbn: document.getElementById('bookIsbn').value.trim() || null,
      edition: document.getElementById('bookEdition').value.trim() || null,
      category_id: document.getElementById('bookCategory').value || null,
      mrp: parseFloat(document.getElementById('bookMrp').value),
      price: parseFloat(document.getElementById('bookPrice').value),
      stock_quantity: parseInt(document.getElementById('bookStock').value) || 0,
      availability: document.getElementById('bookAvailability').value,
      cover_url: coverUrl,
      description: document.getElementById('bookDescription').value.trim() || null,
      is_active: document.getElementById('bookActive').checked
    };

    let error;
    if (id) {
      delete payload.slug;
      ({ error } = await supabaseClient.from('books').update(payload).eq('id', id));
    } else {
      ({ error } = await supabaseClient.from('books').insert(payload));
    }

    btn.disabled = false;
    btn.textContent = 'Save Book';

    if (error) {
      showToast('Failed to save book: ' + error.message, 'error');
      return;
    }

    showToast(id ? 'Book updated' : 'Book added', 'success');
    closeModal('bookModal');
    await loadBooks();
  });
});
