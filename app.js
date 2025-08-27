const state = { lang: 'en', offers: [] };
const today = new Date();
const fmtDate = s => s ? new Date(s).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : '';

function statusOf(o) {
  const s = o.validity?.start_date ? new Date(o.validity.start_date) : null;
  const e = o.validity?.end_date ? new Date(o.validity.end_date) : null;
  if (s && s > today) return 'upcoming';
  if (e && e < today) return 'expired';
  return 'active';
}

function badge(status) {
  const map = { active: 'bg-green-100 text-green-800', upcoming: 'bg-amber-100 text-amber-800', expired: 'bg-red-100 text-red-800' };
  const txt = { active: 'Active / ساري', upcoming: 'Upcoming / قادم', expired: 'Expired / منتهي' }[status];
  return `<span class="px-2 py-1 rounded-full text-xs ${map[status]}">${txt}</span>`;
}

function safeWhatsAppLink(e164) {
  if (!e164) return '';
  const digits = e164.replace(/[^\d+]/g, '');
  const path = digits.startsWith('+') ? digits.substring(1) : digits;
  return `https://wa.me/${path}`;
}

function contactBar(primary) {
  if (!primary) return '';
  const hotline = primary.hotline ? `<a class="underline" href="tel:${primary.hotline}">Call ${primary.hotline}</a>` : '';
  const wa = primary.whatsapp ? `<a class="underline" target="_blank" href="${safeWhatsAppLink(primary.whatsapp)}">WhatsApp</a>` : '';
  const email = primary.email ? `<a class="underline" href="mailto:${primary.email}">${primary.email}</a>` : '';
  const menu = primary.menu_url ? `<a class="underline" target="_blank" href="${primary.menu_url}">Menu</a>` : '';
  return `<div class="max-w-6xl mx-auto px-4 py-2 text-sm flex flex-wrap gap-4 items-center justify-between">
    <div class="flex gap-4">${hotline}${wa ? '<span>·</span>' + wa : ''}${email ? '<span>·</span>' + email : ''}</div>
    <div>${menu}</div>
  </div>`;
}

function floatingButtons(primary) {
  if (!primary) return '';
  const btn = (href, label) => href ? `<a href="${href}" target="${href.startsWith('http') ? '_blank' : '_self'}" class="px-4 py-2 rounded-full shadow bg-black text-white text-sm">${label}</a>` : '';
  const call = primary.hotline ? `tel:${primary.hotline}` : '';
  const wa = primary.whatsapp ? safeWhatsAppLink(primary.whatsapp) : '';
  const email = primary.email ? `mailto:${primary.email}` : '';
  return [btn(call, 'Call'), btn(wa, 'WhatsApp'), btn(email, 'Email')].filter(Boolean).join('');
}

function render() {
  document.getElementById('year').textContent = new Date().getFullYear();
  document.getElementById('dateLabel').textContent = new Date().toLocaleString();

  const first = state.offers.find(o => o.contacts && (o.contacts.hotline || o.contacts.whatsapp || o.contacts.email)) || {};
  const primary = {
    hotline: first.contacts?.hotline || '',
    whatsapp: first.contacts?.whatsapp || '',
    email: first.contacts?.email || '',
    menu_url: first.menu_url || ''
  };
  document.getElementById('contactBar').innerHTML = contactBar(primary);
  document.getElementById('floatingContacts').innerHTML = floatingButtons(primary);

  const q = (document.getElementById('search').value || '').toLowerCase();
  const filter = document.getElementById('filterStatus').value;

  let items = state.offers.slice();
  items = items.filter(o => {
    const s = statusOf(o);
    const matchStatus = (filter === 'all') || (s === filter);
    const text = [o.title_en, o.title_ar, o.description_en, o.description_ar].join(' ').toLowerCase();
    const matchText = !q || text.includes(q);
    return matchStatus && matchText;
  });

  const grid = document.getElementById('offersGrid');
  if (items.length === 0) {
    grid.innerHTML = `<p class="text-center text-gray-500">🚫 No offers available</p>`;
    return;
  }

  grid.innerHTML = items.map(o => {
    const s = statusOf(o);
    const title = state.lang === 'ar' ? o.title_ar : o.title_en;
    const desc = state.lang === 'ar' ? o.description_ar : o.description_en;
    const rtl = state.lang === 'ar' ? 'dir="rtl"' : '';
    return `<article class="bg-white rounded-2xl shadow p-4 flex flex-col gap-3" ${rtl}>
      <div class="flex items-center justify-between gap-2">
        <h3 class="text-lg font-semibold">${title}</h3>
        ${badge(s)}
      </div>
      <p class="text-sm whitespace-pre-wrap">${desc || ''}</p>
      <div class="text-sm grid grid-cols-2 gap-2">
        <div><span class="opacity-60">Discount:</span> ${o.discount_percent || 0}%</div>
        <div><span class="opacity-60">Min Order:</span> AED ${o.min_order_aed || 0}</div>
        <div><span class="opacity-60">Valid:</span> ${fmtDate(o.validity?.start_date)} → ${fmtDate(o.validity?.end_date)}</div>
        <div><span class="opacity-60">Menu:</span> ${o.menu_url ? `<a class="underline" href="${o.menu_url}" target="_blank">Open</a>` : ''}</div>
      </div>
      <div class="text-sm flex flex-wrap gap-3 pt-2 border-t">
        ${o.contacts?.hotline ? `<a class="underline" href="tel:${o.contacts.hotline}">${o.contacts.hotline}</a>` : ''}
        ${o.contacts?.whatsapp ? `<a class="underline" target="_blank" href="${safeWhatsAppLink(o.contacts.whatsapp)}">WhatsApp</a>` : ''}
        ${o.contacts?.email ? `<a class="underline" href="mailto:${o.contacts.email}">${o.contacts.email}</a>` : ''}
      </div>
      <div class="flex gap-2 text-sm pt-1">
        ${o.social?.facebook ? `<a class="underline" target="_blank" href="${o.social.facebook}">Facebook</a>` : ''}
        ${o.social?.instagram ? `<a class="underline" target="_blank" href="${o.social.instagram}">Instagram</a>` : ''}
        ${o.social?.tiktok ? `<a class="underline" target="_blank" href="${o.social.tiktok}">TikTok</a>` : ''}
        ${o.social?.x ? `<a class="underline" target="_blank" href="${o.social.x}">X</a>` : ''}
      </div>
    </article>`;
  }).join('');

  const activeCount = state.offers.filter(o => statusOf(o) === 'active').length;
  document.getElementById('activeCount').textContent = `${activeCount} active deals`;
}

async function load() {
  try {
    const res = await fetch('offers.json?_=' + Date.now());
    if (!res.ok) throw new Error("Failed to fetch offers.json");
    const json = await res.json();

    // يقبل الشكلين: [ {...} ] أو {offers:[...]}
    state.offers = Array.isArray(json) ? json : (json.offers || []);

    render();
  } catch (err) {
    console.error("Error loading offers:", err);
    document.getElementById('offersGrid').innerHTML =
      "<p class='text-center text-red-600'>⚠️ Error loading offers</p>";
  }
}

document.getElementById('langAr').addEventListener('click', () => { state.lang = 'ar'; render(); });
document.getElementById('langEn').addEventListener('click', () => { state.lang = 'en'; render(); });
document.getElementById('filterStatus').addEventListener('change', render);
document.getElementById('search').addEventListener('input', render);

load();
