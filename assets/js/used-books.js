// SCHITAB — Used book submissions moderation

async function loadUsedBooks() {
  const { data, error } = await supabaseClient
    .from('used_books')
    .select('*, books(title, cover_url)')
    .order('created_at', { ascending: false });

  if (error) {
    showToast('Failed to load used book listings: ' + error.message, 'error');
    return;
  }

  renderUsedBooksList(data || []);
}

function renderUsedBooksList(listings) {
  const el = document.getElementById('usedBooksList');

  if (listings.length === 0) {
    el.innerHTML = '<div class="empty-state"><p>No used book submissions yet. They\'ll show up here for approval once students start selling.</p></div>';
    return;
  }

  const badgeClass = { pending: 'badge-pending', approved: 'badge-approved', rejected: 'badge-rejected' };

  el.innerHTML = listings.map(item => `
    <div class="list-item">
      <img class="list-thumb" src="${(item.photo_urls && item.photo_urls[0]) || item.books?.cover_url || 'https://placehold.co/48x64/EEF0F4/999?text=%20'}" alt="">
      <div class="list-info">
        <div class="list-title">${escapeHtml(item.books?.title || 'Linked book removed')}</div>
        <div class="list-sub">${escapeHtml(item.condition)} · ${formatPrice(item.price)}</div>
      </div>
      <span class="badge ${badgeClass[item.status] || 'badge-inactive'}">${escapeHtml(item.status)}</span>
      ${item.status === 'pending' ? `
        <div class="list-actions">
          <button class="btn btn-primary btn-sm" onclick="setUsedBookStatus('${item.id}', 'approved')">Approve</button>
          <button class="btn btn-danger btn-sm" onclick="setUsedBookStatus('${item.id}', 'rejected')">Reject</button>
        </div>
      ` : ''}
    </div>
  `).join('');
}

async function setUsedBookStatus(id, status) {
  const { error } = await supabaseClient
    .from('used_books')
    .update({ status })
    .eq('id', id);

  if (error) {
    showToast('Failed to update: ' + error.message, 'error');
    return;
  }

  showToast(status === 'approved' ? 'Listing approved' : 'Listing rejected', 'success');
  await loadUsedBooks();
            }
