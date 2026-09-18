// SCHITAB — Categories management

let allCategories = [];

async function loadCategories() {
  const { data, error } = await supabaseClient
    .from('categories')
    .select('*')
    .order('display_order', { ascending: true })
    .order('name', { ascending: true });

  if (error) {
    showToast('Failed to load categories: ' + error.message, 'error');
    return;
  }

  allCategories = data || [];
  renderCategoriesList();
  populateCategoryDropdowns();
}

function renderCategoriesList() {
  const el = document.getElementById('categoriesList');

  if (allCategories.length === 0) {
    el.innerHTML = '<div class="empty-state"><p>No categories yet. Add your first one to start organizing books.</p></div>';
    return;
  }

  const topLevel = allCategories.filter(c => !c.parent_id);
  const children = allCategories.filter(c => c.parent_id);

  let html = '';
  topLevel.forEach(cat => {
    html += renderCategoryRow(cat);
    children.filter(c => c.parent_id === cat.id).forEach(sub => {
      html += renderCategoryRow(sub, true);
    });
  });

  el.innerHTML = html;
}

function renderCategoryRow(cat, isChild = false) {
  return `
    <div class="list-item" style="${isChild ? 'padding-left:20px;' : ''}">
      <div class="list-info">
        <div class="list-title">${isChild ? '↳ ' : ''}${escapeHtml(cat.name)}</div>
        <div class="list-sub">/${escapeHtml(cat.slug)}</div>
      </div>
      <span class="badge ${cat.is_active ? 'badge-active' : 'badge-inactive'}">${cat.is_active ? 'Active' : 'Hidden'}</span>
      <div class="list-actions">
        <button class="btn btn-outline btn-sm" onclick="toggleCategoryActive('${cat.id}', ${cat.is_active})">${cat.is_active ? 'Hide' : 'Show'}</button>
      </div>
    </div>
  `;
}

function populateCategoryDropdowns() {
  const bookSelect = document.getElementById('bookCategory');
  const parentSelect = document.getElementById('categoryParent');

  const topLevel = allCategories.filter(c => !c.parent_id);
  const children = allCategories.filter(c => c.parent_id);

  let bookOptions = '<option value="">— Select category —</option>';
  let parentOptions = '<option value="">— Top-level category —</option>';

  topLevel.forEach(cat => {
    bookOptions += `<option value="${cat.id}">${escapeHtml(cat.name)}</option>`;
    parentOptions += `<option value="${cat.id}">${escapeHtml(cat.name)}</option>`;
    children.filter(c => c.parent_id === cat.id).forEach(sub => {
      bookOptions += `<option value="${sub.id}">&nbsp;&nbsp;↳ ${escapeHtml(sub.name)}</option>`;
    });
  });

  bookSelect.innerHTML = bookOptions;
  parentSelect.innerHTML = parentOptions;
}

function openCategoryForm() {
  document.getElementById('categoryForm').reset();
  openModal('categoryModal');
}

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('categoryForm');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = document.getElementById('categoryName').value.trim();
    const parentId = document.getElementById('categoryParent').value || null;
    const slug = slugify(name);

    const { error } = await supabaseClient.from('categories').insert({
      name, slug, parent_id: parentId
    });

    if (error) {
      showToast('Failed to save: ' + error.message, 'error');
      return;
    }

    showToast('Category added', 'success');
    closeModal('categoryModal');
    await loadCategories();
  });
});

async function toggleCategoryActive(id, currentlyActive) {
  const { error } = await supabaseClient
    .from('categories')
    .update({ is_active: !currentlyActive })
    .eq('id', id);

  if (error) {
    showToast('Failed to update: ' + error.message, 'error');
    return;
  }
  await loadCategories();
      }
