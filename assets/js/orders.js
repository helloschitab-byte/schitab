async function loadOrders() {
  const el = document.getElementById('ordersList');
  el.innerHTML = '<div class="empty-state">Loading orders...</div>';

  const { data: orders, error } = await supabaseClient
    .from('orders')
    .select('*, order_items(*)')
    .order('created_at', { ascending: false });

  if (error || !orders || orders.length === 0) {
    el.innerHTML = '<div class="empty-state">No orders yet.</div>';
    return;
  }

  el.innerHTML = orders.map(order => `
    <div class="card" style="margin-bottom:12px;">
      <div class="section-head">
        <div>
          <strong>${escapeHtml(order.customer_name)}</strong> — ${escapeHtml(order.phone)}<br>
          <span class="hint">${new Date(order.created_at).toLocaleString()}</span>
        </div>
        <select onchange="updateOrderStatus('${order.id}', this.value)">
          <option value="pending" ${order.status === 'pending' ? 'selected' : ''}>Pending</option>
          <option value="confirmed" ${order.status === 'confirmed' ? 'selected' : ''}>Confirmed</option>
          <option value="shipped" ${order.status === 'shipped' ? 'selected' : ''}>Shipped</option>
          <option value="delivered" ${order.status === 'delivered' ? 'selected' : ''}>Delivered</option>
        </select>
      </div>
      <div class="hint">${escapeHtml(order.address)}, ${escapeHtml(order.pincode)}</div>
      <div style="margin-top:8px;">
        ${order.order_items.map(item => `<div>${escapeHtml(item.book_title)} x${item.quantity} — ₹${item.price * item.quantity}</div>`).join('')}
      </div>
      <div style="margin-top:8px;font-weight:700;">Total: ₹${order.total_amount}</div>
    </div>
  `).join('');
}

async function updateOrderStatus(orderId, status) {
  const { error } = await supabaseClient.from('orders').update({ status }).eq('id', orderId);
  if (error) {
    showToast('Failed to update status', 'error');
  } else {
    showToast('Order updated', 'success');
  }
}
