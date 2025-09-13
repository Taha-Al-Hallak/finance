document.addEventListener("DOMContentLoaded", function () {
  
  const signUpBtn = document.getElementById("Sign-Up");
  const forgotBtn = document.getElementById("forgot-password");
  const tahaBtn = document.getElementById("taha");
  const activbtn = document.getElementById("active");

  if (signUpBtn) {
    signUpBtn.addEventListener("click", () => window.location.href = "Create Account.html");
  }

  if (forgotBtn) {
    forgotBtn.addEventListener("click", () => window.location.href = "Forgot Password.html");
  }

  if (tahaBtn) {
    tahaBtn.addEventListener("click", () => window.location.href = "Transaction.html");
  }

  if (activbtn) {
    activbtn.addEventListener("click", () => window.location.href = "Home.html");
  }

  // تسجيل الدخول
  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', function (e) {
      e.preventDefault();
      const email = document.getElementById('email').value.trim();
      const password = document.getElementById('password').value;

      fetch('https://finance-j2lk.onrender.com/api/users/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })
      .then(res => res.json())
      .then(data => {
        if (data.status === 'success') {
          localStorage.setItem('user', JSON.stringify(data.data.user));
          localStorage.setItem('token', data.token);
          window.location.href = 'Home.html';
        } else {
          alert('فشل تسجيل الدخول: ' + (data.message || 'بيانات غير صحيحة'));
        }
      })
      .catch(err => {
        console.error('خطأ:', err);
        alert('تعذر الاتصال بالسيرفر');
      });
    });
  }

  // إنشاء حساب
  const signupForm = document.getElementById('signupForm');
  if (signupForm) {
    signupForm.addEventListener('submit', function (e) {
      e.preventDefault();

      const fullname = document.getElementById('fullname').value;
      const email = document.getElementById('email').value.trim();
      const mobile = document.getElementById('mobile').value.trim();
      const dob = document.getElementById('dob').value.trim();
      const password = document.getElementById('password').value.trim();
      const confirmpassword = document.getElementById('confirm-password').value.trim();

      if (password !== confirmpassword) {
        alert('كلمة المرور وتأكيدها غير متطابقين');
        return;
      }

      const stridata = {
        name: fullname,
        email,
        password,
        passwordConfirm: confirmpassword,
        dateOfBirth: dob,
        mobileNumber: mobile
      };

      fetch('https://finance-j2lk.onrender.com/api/users/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(stridata)
      })
      .then(res => res.json())
      .then(data => {
        if (data.status === 'success') {
          alert('تم إنشاء الحساب بنجاح');
          localStorage.setItem('user', JSON.stringify(data.data.user));
          localStorage.setItem('token', data.token);
          window.location.href = 'Home.html';
        } else {
          alert('فشل تسجيل الحساب: ' + (data.message || 'بيانات غير صحيحة'));
        }
      })
      .catch(err => {
        console.error('خطأ:', err);
        alert('تعذر الاتصال بالسيرفر');
      });
    });
  }

  // نسيت كلمة المرور
  const nextStepBtn = document.querySelector('.next-step');
  if (nextStepBtn) {
    nextStepBtn.addEventListener('click', function () {
      const email = document.getElementById('email').value.trim();

      if (!email) {
        alert('يرجى إدخال بريد إلكتروني صحيح');
        return;
      }

      fetch('https://finance-j2lk.onrender.com/api/users/forgotPassword', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })
      .then(res => res.json())
      .then(data => {
        if (data.status === 'success') {
          alert('تم إرسال رابط إعادة تعيين كلمة المرور');
          window.location.href = 'New password.html';
        } else {
          alert('حدث خطأ: ' + (data.message || 'يرجى المحاولة لاحقًا'));
        }
      })
      .catch(error => {
        console.error('خطأ:', error);
        alert('فشل الاتصال بالسيرفر');
      });
    });
  }


  const signupLink = document.querySelector('.signup');
  if (signupLink) {
    signupLink.addEventListener('click', () => {
      window.location.href = 'Create Account.html';
    });
  }

  //تحقق من التوكن
  const token = localStorage.getItem('token');
  if (!token && (window.location.href.includes("Home.html") || window.location.href.includes("Transaction.html"))) {
    alert('يرجى تسجيل الدخول أولاً');
    window.location.href = 'login.html';
    return;
  }

  // التاريخ
  function formatDate(dateStr) {
    const date = new Date(dateStr);
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const monthName = date.toLocaleString('default', { month: 'long' });
    const day = date.getDate();
    return `${hours}:${minutes} - ${monthName} ${day}`;
  }

  // --- دالة عرض المعاملات ---
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
        <div class="transaction-icon">${tx.type === 'income' ? '💵' : '🛒'}</div>
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

  // تحميل المعاملات حسب الصفحة
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

      const progressPercent = totalBalanceValue > 0 ? Math.min((totalExpenseValue / totalBalanceValue) * 100, 100) : 0;
      const progressText = `Used ${progressPercent.toFixed(1)}% of your balance`;

      // Home
      const balanceEl = document.getElementById('balance');
      const expenseEl = document.getElementById('expense');
      const progressEl = document.getElementById('homeProgressBar');
      const progressTextEl = document.getElementById('homeProgressText');
      const transactionsContainer = document.querySelector('.transactions');

      if (balanceEl && expenseEl && progressEl && progressTextEl && transactionsContainer) {
        balanceEl.textContent = `$${totalBalanceValue.toFixed(2)}`;
        expenseEl.textContent = `-$${totalExpenseValue.toFixed(2)}`;
        progressEl.style.width = progressPercent + '%';
        progressTextEl.textContent = progressText;
        renderTransactions(transactions, transactionsContainer);
      }

      // Transaction
      const transactionBalanceEl = document.getElementById('totalBalance');
      const transactionBalanceEl2 = document.getElementById('totalBalance2');
      const transactionExpenseEl = document.getElementById('totalExpense');
      const transactionProgressBarEl = document.getElementById('transactionProgressBar');
      const transactionProgressTextEl = document.getElementById('transactionProgressText');
      const transactionContainer = document.querySelector('.transactions');

      if (transactionBalanceEl && transactionExpenseEl && transactionProgressBarEl && transactionProgressTextEl && transactionContainer) {
        transactionBalanceEl.textContent = `$${totalBalanceValue.toFixed(2)}`;
        if (transactionBalanceEl2) transactionBalanceEl2.textContent = `$${totalBalanceValue.toFixed(2)}`;
        transactionExpenseEl.textContent = `-$${totalExpenseValue.toFixed(2)}`;
        transactionProgressBarEl.style.width = progressPercent + '%';
        transactionProgressTextEl.textContent = progressText;
        renderTransactions(transactions, transactionContainer);
      }

      // فلترة 
      ['daily-btn', 'weekly-btn', 'monthly-btn'].forEach(id => {
        const btn = document.getElementById(id);
        if (btn) {
          btn.addEventListener('click', () => {
            const now = new Date();
            let filtered = [];

            if (id === 'daily-btn') {
              filtered = transactions.filter(tx => new Date(tx.date).toDateString() === now.toDateString());
            } else if (id === 'weekly-btn') {
              filtered = transactions.filter(tx => (now - new Date(tx.date)) / (1000 * 60 * 60 * 24) <= 7);
            } else if (id === 'monthly-btn') {
              filtered = transactions.filter(tx => {
                const txDate = new Date(tx.date);
                return txDate.getFullYear() === now.getFullYear() && txDate.getMonth() === now.getMonth();
              });
            }

            document.querySelectorAll('.toggle button').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const container = transactionContainer || transactionsContainer;
            renderTransactions(filtered, container);
          });
        }
      });

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











  



