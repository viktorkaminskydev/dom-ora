(() => {
  const dialog = document.getElementById('inquiry-dialog');
  const form = document.getElementById('inquiry-form');
  if (!dialog || !form) return;

  const title = document.getElementById('inquiry-title');
  const intro = document.getElementById('inquiry-intro');
  const photo = document.getElementById('inquiry-photo');
  const status = document.getElementById('inquiry-status');
  let subject = 'Консультація щодо нерухомості';
  let previousOverflow = '';
  let opener;

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
      photo.src = cardImage || 'hero-poster.webp';
      form.reset();
      status.textContent = '';
      opener = trigger;
      previousOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      dialog.showModal();
      dialog.scrollTop = 0;
      // On phones show the photo first, without immediately opening the keyboard.
      if (matchMedia('(max-width:640px)').matches) {
        dialog.querySelector('[data-inquiry-close]').focus({preventScroll:true});
      } else {
        form.elements.clientName.focus({preventScroll:true});
      }
    });
  });

  dialog.querySelector('[data-inquiry-close]').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => {
    if (event.target !== dialog) return;
    const rect = dialog.getBoundingClientRect();
    if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close();
  });
  dialog.addEventListener('close', () => {
    document.body.style.overflow = previousOverflow;
    opener?.focus({preventScroll:true});
  });

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
