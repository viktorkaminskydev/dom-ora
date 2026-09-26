(() => {
  const dialog = document.getElementById('inquiry-dialog');
  const form = document.getElementById('inquiry-form');
  if (!dialog || !form) return;

  const title = document.getElementById('inquiry-title');
  const intro = document.getElementById('inquiry-intro');
  const photo = document.getElementById('inquiry-photo');
  const status = document.getElementById('inquiry-status');
  let subject = 'Консультація щодо нерухомості';

  document.querySelectorAll('[data-inquiry]').forEach(trigger => {
    trigger.addEventListener('click', event => {
      if (typeof dialog.showModal !== 'function') return; // mailto лишається запасним варіантом
      event.preventDefault();
      const cardTitle = trigger.querySelector('h3')?.textContent?.trim();
      const cardImage = trigger.querySelector('img')?.getAttribute('src');
      const isBooking = trigger.textContent.includes('Забронювати перегляд');
      subject = cardTitle ? `Запит щодо ${cardTitle}` : isBooking ? 'Запис на перегляд' : 'Консультація щодо нерухомості';
      title.textContent = cardTitle ? `Запитати про ${cardTitle}` : isBooking ? 'Забронювати перегляд' : 'Допоможемо знайти ваш дім';
      intro.textContent = 'Залиште ім’я та телефон, щоб ми могли зв’язатися з вами.';
      photo.src = cardImage || 'hero-poster.jpg';
      form.reset();
      status.textContent = '';
      dialog.showModal();
      form.elements.clientName.focus();
    });
  });

  dialog.querySelector('[data-inquiry-close]').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => { if (event.target === dialog) dialog.close(); });

  form.addEventListener('submit', event => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    const name = form.elements.clientName.value.trim();
    const phone = form.elements.clientPhone.value.trim();
    if (!name || !phone) return;
    const body = `Ім’я: ${name}\nТелефон: ${phone}\nТема: ${subject}`;
    status.textContent = 'Відкриваємо поштовий застосунок. Надішліть підготовлений лист, щоб передати звернення.';
    window.location.href = `mailto:hello@domora.ua?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  });
})();
