// frontend/script.js

// 🔹 Replace with your ngrok HTTPS URL pointing to backend
const API_BASE = "https://spongy-unharrowed-cristina.ngrok-free.dev"; // ngrok HTTPS URL

// ----------------- AUTH -----------------

// Login
async function login() {
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  try {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();
    console.log(data);

    if (res.ok) {
      localStorage.setItem('token', data.token);
      alert('Logged in!');
      location.href = 'payment.html';
    } else {
      alert(data.error || 'Login failed');
    }
  } catch (err) {
    console.error('Login error:', err);
    alert('Server error. Check console.');
  }
}

// Register
async function register() {
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  try {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();
    console.log(data);

    if (res.ok) {
      alert('Registered! Please login.');
    } else {
      alert(data.error || 'Registration failed');
    }
  } catch (err) {
    console.error('Register error:', err);
    alert('Server error. Check console.');
  }
}

// ----------------- TRANSACTIONS -----------------

async function getTransactions() {
  const token = localStorage.getItem('token');
  if (!token) return [];

  try {
    const res = await fetch(`${API_BASE}/transactions`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return await res.json();
  } catch (err) {
    console.error('Fetching transactions failed:', err);
    return [];
  }
}

async function showTransactions() {
  const txs = await getTransactions();
  const container = document.getElementById('transactions');
  container.innerHTML = '';

  txs.forEach(tx => {
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
      <div class="front">₹${tx.amount} → ${tx.to}</div>
      <div class="back">
        <textarea placeholder="Add note">${tx.note || ''}</textarea>
        <button onclick="updateNote('${tx._id}', this.previousElementSibling.value)">Save</button>
      </div>
    `;
    container.appendChild(card);
  });
}

async function updateNote(id, note) {
  const token = localStorage.getItem('token');
  try {
    const res = await fetch(`${API_BASE}/transactions/${id}`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ note })
    });

    const data = await res.json();
    console.log(data);

    if (res.ok) alert('Note saved!');
    else alert(data.error || 'Failed to save note');
  } catch (err) {
    console.error('Update note error:', err);
    alert('Server error. Check console.');
  }
}

// ----------------- EXPENSE CHART -----------------


async function showCategoryChart() {
  const token = localStorage.getItem('token');
  if (!token) return;

  try {
    const res = await fetch(`${API_BASE}/transactions/analytics/category`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    const data = await res.json();
    console.log('Chart data:', data);

    const ctx = document.getElementById('categoryChart').getContext('2d');
    new Chart(ctx, {
      type: 'pie',
      data: {
        labels: data.map(d => d._id),
        datasets: [{
          data: data.map(d => d.total),
          backgroundColor: ['#FF6384','#36A2EB','#FFCE56','#4BC0C0','#9966FF','#FF9F40']
        }]
      }
    });
  } catch (err) {
    console.error('Chart error:', err);
  }
}

// ----------------- AUTO LOAD -----------------
document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('transactions')) showTransactions();
  if (document.getElementById('categoryChart')) showCategoryChart();
});
