// ============================================================
//  script.js  –  Tractor Work Manager Frontend
// ============================================================

// const API = '';          // empty = same origin (served by Express)
// const API = window.location.origin;
const API = "https://t-app-7ykc.onrender.com";

// ── DOM References ──────────────────────────────────────────
const farmerForm      = document.getElementById('farmerForm');
const nameInput       = document.getElementById('name');
const hoursInput      = document.getElementById('hoursWorked');
const rateInput       = document.getElementById('ratePerHour');
const paidInput       = document.getElementById('paidAmount');
const submitBtn       = document.getElementById('submitBtn');
const refreshBtn      = document.getElementById('refreshBtn');
const tableBody       = document.getElementById('tableBody');
const recordsTable    = document.getElementById('recordsTable');
const loadingMsg      = document.getElementById('loadingMsg');
const emptyMsg        = document.getElementById('emptyMsg');
const preview         = document.getElementById('preview');
const previewTotal    = document.getElementById('previewTotal');
const previewRemaining= document.getElementById('previewRemaining');

// Stats
const statCount       = document.getElementById('statCount');
const statBilled      = document.getElementById('statBilled');
const statCollected   = document.getElementById('statCollected');
const statOutstanding = document.getElementById('statOutstanding');

// Modal
const payModal        = document.getElementById('payModal');
const modalFarmerName = document.getElementById('modalFarmerName');
const paymentAmount   = document.getElementById('paymentAmount');
const confirmPayBtn   = document.getElementById('confirmPayBtn');
const cancelPayBtn    = document.getElementById('cancelPayBtn');

let currentPayId      = null;  // holds the id of the farmer being paid
let currentPayBalance = 0;     // max sensible payment

// ── Toast Notification ──────────────────────────────────────
function showToast(msg, type = 'success') {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.className   = `toast ${type} show`;
  setTimeout(() => { toast.className = 'toast'; }, 3200);
}

// ── Currency Formatter ──────────────────────────────────────
const fmt = (n) => Number(n || 0).toLocaleString('en-IN');

// ── Live Preview while typing ───────────────────────────────
function updatePreview() {
  const h = parseFloat(hoursInput.value) || 0;
  const r = parseFloat(rateInput.value)  || 0;
  const p = parseFloat(paidInput.value)  || 0;

  if (h > 0 && r > 0) {
    const total     = h * r;
    const remaining = total - p;
    previewTotal.textContent     = `₹${fmt(total)}`;
    previewRemaining.textContent = `₹${fmt(remaining)}`;
    preview.classList.remove('hidden');
  } else {
    preview.classList.add('hidden');
  }
}

hoursInput.addEventListener('input', updatePreview);
rateInput .addEventListener('input', updatePreview);
paidInput .addEventListener('input', updatePreview);

// ── Fetch Helpers ───────────────────────────────────────────
async function apiFetch(url, options = {}) {
  const res  = await fetch(API + url, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Server error');
  return data;
}

// ── Load All Records ─────────────────────────────────────────
async function loadRecords() {
  loadingMsg.classList.remove('hidden');
  emptyMsg.classList.add('hidden');
  recordsTable.classList.add('hidden');
  tableBody.innerHTML = '';

  try {
    const { data } = await apiFetch('/all');
    renderTable(data);
    renderStats(data);
  } catch (err) {
    loadingMsg.textContent = '⚠️ Could not load records. Is the server running?';
    showToast(err.message, 'error');
  }
}

// ── Render Stats ─────────────────────────────────────────────
function renderStats(records) {
  const totalBilled      = records.reduce((s, r) => s + (r.totalAmount || 0), 0);
  const totalCollected   = records.reduce((s, r) => s + (r.paidAmount  || 0), 0);
  const totalOutstanding = records.reduce((s, r) => s + (r.remaining   || 0), 0);

  statCount      .textContent = records.length;
  statBilled     .textContent = fmt(totalBilled);
  statCollected  .textContent = fmt(totalCollected);
  statOutstanding.textContent = fmt(totalOutstanding);
}

// ── Render Table ─────────────────────────────────────────────
function renderTable(records) {
  loadingMsg.classList.add('hidden');

  if (!records.length) {
    emptyMsg.classList.remove('hidden');
    return;
  }

  recordsTable.classList.remove('hidden');

  tableBody.innerHTML = records.map((r, idx) => {
    const remaining = r.remaining || 0;
    let badgeClass, badgeText;
    if (remaining <= 0 && r.paidAmount > 0) {
      badgeClass = 'badge-settled'; badgeText = '✅ Settled';
    } else if (remaining > 0) {
      badgeClass = 'badge-due';     badgeText = '⏳ Due';
    } else {
      badgeClass = 'badge-over';    badgeText = '🔺 Overpaid';
    }

    return `
      <tr>
        <td>${idx + 1}</td>
        <td class="name-cell">${escHtml(r.name)}</td>
        <td>${r.hoursWorked}</td>
        <td>₹${fmt(r.ratePerHour)}</td>
        <td><strong>₹${fmt(r.totalAmount)}</strong></td>
        <td>₹${fmt(r.paidAmount)}</td>
        <td>
          <span class="badge ${badgeClass}">
            ${remaining > 0 ? '₹' + fmt(remaining) + ' ' : ''}${badgeText}
          </span>
        </td>
        <td class="actions-cell">
          <button class="btn btn-amber"
                  onclick="openPayModal('${r._id}', '${escHtml(r.name)}', ${remaining})">
            💰 Pay
          </button>
          <button class="btn btn-danger"
                  onclick="deleteRecord('${r._id}', '${escHtml(r.name)}')">
            🗑 Delete
          </button>
        </td>
      </tr>`;
  }).join('');
}

// ── HTML Escaping ─────────────────────────────────────────────
function escHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// ── Add Farmer Form Submit ─────────────────────────────────────
farmerForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const name        = nameInput.value.trim();
  const hoursWorked = parseFloat(hoursInput.value);
  const ratePerHour = parseFloat(rateInput.value);
  const paidAmount  = parseFloat(paidInput.value) || 0;

  // Basic validation
  [nameInput, hoursInput, rateInput].forEach(i => i.classList.remove('error'));
  let valid = true;
  if (!name)          { nameInput .classList.add('error'); valid = false; }
  if (isNaN(hoursWorked) || hoursWorked < 0) { hoursInput.classList.add('error'); valid = false; }
  if (isNaN(ratePerHour) || ratePerHour < 0) { rateInput .classList.add('error'); valid = false; }
  if (!valid) { showToast('Please fill all required fields correctly.', 'error'); return; }

  submitBtn.disabled = true;
  submitBtn.innerHTML = '<span class="spinner"></span> Saving…';

  try {
    await apiFetch('/add', {
      method: 'POST',
      body:   JSON.stringify({ name, hoursWorked, ratePerHour, paidAmount }),
    });
    showToast(`✅ Record for ${name} added!`);
    farmerForm.reset();
    preview.classList.add('hidden');
    await loadRecords();
  } catch (err) {
    showToast(err.message, 'error');
  } finally {
    submitBtn.disabled = false;
    submitBtn.innerHTML = '<span class="btn-icon">💾</span> Save Record';
  }
});

// ── Open Payment Modal ─────────────────────────────────────────
function openPayModal(id, name, balance) {
  currentPayId      = id;
  currentPayBalance = balance;
  modalFarmerName.textContent = `Farmer: ${name}  |  Balance: ₹${fmt(balance)}`;
  paymentAmount.value = '';
  payModal.classList.remove('hidden');
  setTimeout(() => paymentAmount.focus(), 100);
}

// ── Close Modal ─────────────────────────────────────────────
function closeModal() {
  payModal.classList.add('hidden');
  currentPayId = null;
}

cancelPayBtn.addEventListener('click', closeModal);
payModal.addEventListener('click', (e) => { if (e.target === payModal) closeModal(); });
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeModal(); });

// ── Confirm Payment ──────────────────────────────────────────
confirmPayBtn.addEventListener('click', async () => {
  const amount = parseFloat(paymentAmount.value);
  if (!amount || amount <= 0) {
    showToast('Enter a valid payment amount.', 'error');
    paymentAmount.focus();
    return;
  }

  confirmPayBtn.disabled = true;
  confirmPayBtn.innerHTML = '<span class="spinner"></span>';

  try {
    await apiFetch(`/pay/${currentPayId}`, {
      method: 'PUT',
      body:   JSON.stringify({ amount }),
    });
    showToast(`💰 Payment of ₹${fmt(amount)} recorded!`);
    closeModal();
    await loadRecords();
  } catch (err) {
    showToast(err.message, 'error');
  } finally {
    confirmPayBtn.disabled = false;
    confirmPayBtn.innerHTML = '✅ Confirm';
  }
});

// ── Delete Record ─────────────────────────────────────────────
async function deleteRecord(id, name) {
  if (!confirm(`Delete record for "${name}"? This cannot be undone.`)) return;

  try {
    await apiFetch(`/delete/${id}`, { method: 'DELETE' });
    showToast(`🗑 Record for ${name} deleted.`);
    await loadRecords();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

// ── Refresh Button ────────────────────────────────────────────
refreshBtn.addEventListener('click', async () => {
  refreshBtn.textContent = '⏳ Loading…';
  refreshBtn.disabled    = true;
  await loadRecords();
  refreshBtn.textContent = '🔄 Refresh';
  refreshBtn.disabled    = false;
});

// ── Initial Load ───────────────────────────────────────────
document.addEventListener('DOMContentLoaded', loadRecords);