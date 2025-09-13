document.addEventListener("DOMContentLoaded", function () {
  // --- صفحة Transaction.html ---
  const transactionBalanceEl = document.getElementById('totalBalance');
  const transactionBalanceEl2 = document.getElementById('totalBalance2');
  const transactionExpenseEl = document.getElementById('totalExpense');
  const transactionProgressBarEl = document.getElementById('progressBar');
  const transactionProgressTextEl = document.getElementById('progressText');
  const transactionContainer = document.querySelector('.transactions');

  const token = localStorage.getItem('token');

  if (!token) {
    alert('يرجى تسجيل الدخول أولاً');
    window.location.href = 'login.html';
    return;
  }

  // دالة لتنسيق التاريخ
  function formatDate(dateStr) {
    const date = new Date(dateStr);
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const monthName = date.toLocaleString('default', { month: 'long' });
    const day = date.getDate();
    return `${hours}:${minutes} - ${monthName} ${day}`;
  }

  // دالة عرض المعاملات
  function renderTransactions(list, container) {
    if (!container) return;
    container.innerHTML = '';

    if (list.length === 0) {
      container.innerHTML = '<p>لا توجد معاملات لعرضها.</p>';
      return;
    }

    list.forEach(tx => {
      const txDiv = document.createElement('div');
      txDiv.className = 'transaction';
      txDiv.innerHTML = `
        <div class="transaction-icon">${ tx.type === 'income' ? '💵' : '🛒' }</div>
        <div class="transaction-info">
          <strong>${tx.category.name}</strong>
          <div class="transaction-date">${formatDate(tx.date)}</div>
        </div>
        <div class="transaction-category">${tx.note || ''}</div>
        <div class="transaction-amount ${tx.type === 'expense' ? 'negative' : ''}">
          ${tx.type === 'expense' ? '-' : ''}$${Math.abs(tx.amount).toFixed(2)}
        </div>
      `;
      container.appendChild(txDiv);
    });
  }

  // فلترة المعاملات حسب الفترة
  function filterTransactions(period) {
    const now = new Date();
    let filtered;

    if (period === 'daily') {
      filtered = transactions.filter(tx => {
        const txDate = new Date(tx.date);
        return now.toDateString() === txDate.toDateString();
      });
    } else if (period === 'weekly') {
      filtered = transactions.filter(tx => {
        const txDate = new Date(tx.date);
        const diffTime = now - txDate;
        const diffDays = diffTime / (1000 * 60 * 60 * 24);
        return diffDays <= 7;
      });
    } else if (period === 'monthly') {
      filtered = transactions.filter(tx => {
        const txDate = new Date(tx.date);
        return now.getFullYear() === txDate.getFullYear() && now.getMonth() === txDate.getMonth();
      });
    } else {
      filtered = transactions;
    }

    if (transactionContainer) {
      renderTransactions(filtered, transactionContainer);
    }
  }

  // تهيئة أزرار الفلترة
  ['daily-btn','weekly-btn','monthly-btn'].forEach(id => {
    const btn = document.getElementById(id);
    if (btn) {
      btn.addEventListener('click', () => {
        filterTransactions(id.replace('-btn',''));
        document.querySelectorAll('.toggle button').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
      });
    }
  });

  let transactions = [];

  fetch('https://finance-j2lk.onrender.com/api/transactions', {
    headers: {
      Authorization: `Bearer ${token}`
    }
  })
  .then(res => res.json())
  .then(data => {
    if (data.status === 'success') {
      transactions = data.data.transactions;

      const totalBalanceValue = transactions.reduce((acc, tx) => {
        return tx.type === 'income' ? acc + tx.amount : acc - tx.amount;
      }, 0);

      const totalExpenseValue = transactions.reduce((acc, tx) => {
        return tx.type === 'expense' ? acc + tx.amount : acc;
      }, 0);

      if (transactionBalanceEl) {
        transactionBalanceEl.textContent = `$${totalBalanceValue.toFixed(2)}`;
      }
      if (transactionBalanceEl2) {
        transactionBalanceEl2.textContent = `$${totalBalanceValue.toFixed(2)}`;
      }
      if (transactionExpenseEl) {
        transactionExpenseEl.textContent = `-$${totalExpenseValue.toFixed(2)}`;
      }

      const progressPercent = totalBalanceValue > 0 ? Math.min((totalExpenseValue / totalBalanceValue) * 100, 100) : 0;

      if (transactionProgressBarEl) {
        transactionProgressBarEl.style.width = progressPercent + '%';
      }
      if (transactionProgressTextEl) {
        transactionProgressTextEl.textContent = `Used ${progressPercent.toFixed(1)}% of your balance`;
      }

      filterTransactions('monthly');
    } else {
      alert('تعذر جلب المعاملات، يرجى تسجيل الدخول مرة أخرى.');
      localStorage.clear();
      window.location.href = 'login.html';
    }
  })
  .catch(err => {
    console.error('خطأ في جلب المعاملات:', err);
    alert('تعذر الاتصال بالسيرفر، يرجى المحاولة لاحقًا.');
  });
});
