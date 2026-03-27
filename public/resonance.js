// resonance.js — handles homepage popup and ticket logic using /content.json
document.addEventListener('DOMContentLoaded', () => {
  // Always update event dates based on data-event-date attributes
  const updateBuyLinks = () => {
    const links = document.querySelectorAll('a.resonance-buy');
    links.forEach(a => {
      const eventDateStr = a.getAttribute('data-event-date');
      if (!eventDateStr) return;
      
      const eventDate = new Date(eventDateStr);
      const now = new Date();
      const isPassed = now > eventDate;
      
      const btn = a.querySelector('button') || a;
      if (isPassed) {
        a.href = '#';
        a.disabled = true;
        a.style.pointerEvents = 'none';
        a.style.opacity = '0.6';
        if (btn) { 
          btn.textContent = 'Event Has Passed'; 
          btn.disabled = true;
        }
      } else {
        if (btn) { 
          btn.disabled = false; 
        }
      }
    });
  };

  updateBuyLinks();

  // Handle popup and homepage features from content.json
  fetch('/content.json').then(r => r.json()).then(data => {
    const ticket = data && data.resonance_ticket;
    if (!ticket || !ticket.enabled) return;

    const eventDate = new Date(ticket.date);
    const now = new Date();
    const isExpired = now > eventDate;

    // Create popup overlay
    const popup = document.createElement('div');
    popup.id = 'resonance-popup';
    Object.assign(popup.style, {
      position: 'fixed', left: '0', top: '0', width: '100%', height: '100%',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'rgba(0,0,0,0.6)', zIndex: '9999'
    });

    const card = document.createElement('div');
    Object.assign(card.style, {
      background: '#fff', padding: '22px', maxWidth: '540px', width: '92%',
      borderRadius: '6px', boxShadow: '0 8px 24px rgba(0,0,0,0.2)', color: '#111'
    });

    const title = document.createElement('h3');
    title.textContent = ticket.title || 'Resonance Show';
    card.appendChild(title);

    const when = document.createElement('p');
    when.textContent = 'Date: ' + (isNaN(eventDate) ? ticket.date : eventDate.toLocaleString());
    card.appendChild(when);

    const price = document.createElement('p');
    price.textContent = 'Price: ₦' + (ticket.price_naira != null ? Number(ticket.price_naira).toLocaleString() : '0');
    card.appendChild(price);

    const btnWrap = document.createElement('div');
    btnWrap.style.marginTop = '12px';

    const buyBtnLink = document.createElement('a');
    buyBtnLink.href = isExpired ? '#' : (ticket.purchase_link || '#');
    buyBtnLink.target = '_blank';
    buyBtnLink.rel = 'noopener';
    buyBtnLink.style.textDecoration = 'none';

    const buyButtonEl = document.createElement('button');
    buyButtonEl.textContent = isExpired ? 'Event Ended' : ('Purchase in ₦ ' + (ticket.price_naira != null ? Number(ticket.price_naira).toLocaleString() : '0'));
    buyButtonEl.disabled = !!isExpired;
    buyButtonEl.style.padding = '8px 14px';
    buyButtonEl.style.marginRight = '10px';
    buyBtnLink.appendChild(buyButtonEl);
    btnWrap.appendChild(buyBtnLink);

    const moreLink = document.createElement('a');
    moreLink.href = '/resonance';
    moreLink.style.marginLeft = '8px';
    moreLink.textContent = 'More info';
    btnWrap.appendChild(moreLink);

    card.appendChild(btnWrap);

    const close = document.createElement('button');
    close.textContent = 'Close';
    close.style.marginTop = '12px';
    close.onclick = () => popup.remove();
    card.appendChild(close);

    popup.appendChild(card);

    // Only show popup on homepage (body.home)
    if (document.body && document.body.classList && document.body.classList.contains('home')) {
      document.body.appendChild(popup);
    }
  }).catch(err => console.error('resonance.js load error', err));
});

// Attach click handlers to resonance-buy links to show "Event Passed" message or start Stripe Checkout
document.addEventListener('click', (e) => {
  const a = e.target.closest && e.target.closest('a.resonance-buy');
  if (!a) return;
  e.preventDefault();
  
  // Check if event has passed
  const eventDateStr = a.getAttribute('data-event-date');
  if (eventDateStr) {
    const eventDate = new Date(eventDateStr);
    const now = new Date();
    if (now > eventDate) {
      alert('This event has passed.');
      return;
    }
  }
  
  // Start checkout on the server
  fetch('/create-resonance-session', { method: 'POST', headers: { 'Content-Type': 'application/json' } })
    .then(r => r.json())
    .then(data => {
      if (data && data.url) {
        // Redirect user to Stripe Checkout
        window.location = data.url;
      } else {
        alert('Failed to start payment.');
      }
    }).catch(err => { console.error(err); alert('Payment start error'); });
});
