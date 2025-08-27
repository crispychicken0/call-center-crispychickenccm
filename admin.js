let offers = [];
let pwd = '';

// --- Form Data ---
function getForm(){
  return {
    title_ar: document.getElementById('title_ar').value.trim(),
    title_en: document.getElementById('title_en').value.trim(),
    description_ar: document.getElementById('description_ar').value.trim(),
    description_en: document.getElementById('description_en').value.trim(),
    discount_percent: Number(document.getElementById('discount_percent').value || 0),
    min_order_aed: Number(document.getElementById('min_order_aed').value || 0),
    menu_url: document.getElementById('menu_url').value.trim(),
    validity: {
      start_date: document.getElementById('start_date').value || null,
      end_date: document.getElementById('end_date').value || null,
    },
    contacts: {
      hotline: document.getElementById('hotline').value.trim(),
      mobile_display: document.getElementById('mobile_display').value.trim(),
      whatsapp: document.getElementById('whatsapp').value.trim(),
      email: document.getElementById('email').value.trim(),
    },
    social: {
      facebook: document.getElementById('facebook').value.trim(),
      instagram: document.getElementById('instagram').value.trim(),
      tiktok: document.getElementById('tiktok').value.trim(),
      x: document.getElementById('x').value.trim(),
    }
  };
}

function toItem(o){ return { id: o.id || Date.now(), ...o }; }

// --- Render Offers List ---
function renderList(){
  const wrap = document.getElementById('offersList');
  if(!offers.length){ wrap.innerHTML = '<p class="text-sm opacity-60">No offers yet.</p>'; return; }
  wrap.innerHTML = offers.map(o=>`
    <div class="p-3 rounded-xl border flex items-start justify-between gap-3">
      <div>
        <div class="font-semibold">${o.title_en || o.title_ar}</div>
        <div class="text-xs opacity-60">ID: ${o.id}</div>
        <div class="text-sm mt-1">${o.description_en || ''}</div>
      </div>
      <div class="flex gap-2">
        <button class="px-3 py-1 rounded-xl border" onclick="editOffer(${o.id})">Edit</button>
        <button class="px-3 py-1 rounded-xl border" onclick="removeOffer(${o.id})">Delete</button>
      </div>
    </div>
  `).join('');
}

// --- Edit Offer ---
function editOffer(id){
  const o = offers.find(x=>x.id===id);
  if(!o) return;
  for(const key of ['title_ar','title_en','description_ar','description_en','discount_percent','min_order_aed','menu_url']){
    document.getElementById(key).value = o[key] || '';
  }
  document.getElementById('start_date').value = o.validity?.start_date || '';
  document.getElementById('end_date').value = o.validity?.end_date || '';
  for(const key of ['hotline','mobile_display','whatsapp','email']){
    document.getElementById(key).value = o.contacts?.[key] || '';
  }
  for(const key of ['facebook','instagram','tiktok','x']){
    document.getElementById(key).value = o.social?.[key] || '';
  }
}

// --- Remove Offer ---
function removeOffer(id){
  if(!confirm('Are you sure you want to delete this offer?')) return;
  offers = offers.filter(o=>o.id!==id);
  renderList();
}

// --- Add or Update Offer ---
function addOrUpdate(){
  const data = getForm();
  if(!data.title_en && !data.title_ar){ alert('Title (Arabic or English) is required'); return; }
  if(data.discount_percent < 0 || data.min_order_aed < 0){ alert('Discount and Min Order must be >= 0'); return; }
  
  let existing = offers.find(o => o.id === Number(document.getElementById('editing_id')?.value || 0));
  if(existing){ 
    Object.assign(existing, data); 
    alert('Offer updated successfully!');
  } else { 
    offers.unshift(toItem(data)); 
    alert('Offer added successfully!');
  }
  renderList();
}

// --- Download JSON ---
function downloadOffers(){
  const out = JSON.stringify({ pwd, offers }, null, 2);
  const blob = new Blob([out], {type:'application/json'});
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'offers.json';
  a.click();
  URL.revokeObjectURL(a.href);
}

// --- Copy cURL for GitHub ---
function copyCurl(){
  const content = btoa(JSON.stringify({ pwd, offers }));
  const user = document.getElementById('gh_user').value.trim() || 'USERNAME';
  const repo = document.getElementById('gh_repo').value.trim() || 'REPO';
  const path = document.getElementById('gh_path').value.trim() || 'data/offers.json';
  const cmd = `curl -X PUT -H "Authorization: token YOUR_GITHUB_TOKEN" -H "Accept: application/vnd.github.v3+json" https://api.github.com/repos/${user}/${repo}/contents/${path} -d '{"message":"update offers.json","content":"${content}"}'`;
  navigator.clipboard.writeText(cmd);
  alert('cURL command copied to clipboard');
}

// --- Upload to GitHub ---
async function uploadToGitHub(){
  const token = document.getElementById('gh_token').value.trim();
  const user = document.getElementById('gh_user').value.trim();
  const repo = document.getElementById('gh_repo').value.trim();
  const path = document.getElementById('gh_path').value.trim() || 'data/offers.json';
  const pwdInput = document.getElementById('admin_pwd').value.trim();
  const status = document.getElementById('uploadStatus');

  if(!token || !user || !repo){ status.textContent = 'Please fill token, user and repo.'; status.className='text-red-600'; return; }
  if(pwdInput !== pwd){ status.textContent = 'Admin password mismatch.'; status.className='text-red-600'; return; }

  status.textContent = 'Uploading...'; status.className='text-zinc-700';
  const url = `https://api.github.com/repos/${user}/${repo}/contents/${path}`;
  let sha = null;

  try{
    const getRes = await fetch(url, { headers: { 'Authorization': `token ${token}`, 'Accept':'application/vnd.github.v3+json' } });
    if(getRes.ok){ const j = await getRes.json(); sha = j.sha || null; }
  }catch(e){}

  const body = {
    message: 'Add/Update offers.json via Admin UI',
    content: btoa(JSON.stringify({ pwd, offers })),
    ...(sha ? { sha } : {})
  };

  const res = await fetch(url, { method:'PUT', headers:{ 'Authorization':`token ${token}`, 'Accept':'application/vnd.github.v3+json' }, body: JSON.stringify(body) });
  if(res.ok){
    const j = await res.json();
    status.innerHTML = `✅ Uploaded. <a class="underline" target="_blank" href="${j.commit.html_url}">View commit</a>`;
    status.className = 'text-green-700';
  } else {
    const t = await res.text();
    status.textContent = `❌ Failed: ${res.status} ${t}`;
    status.className = 'text-red-600';
  }
}

// --- Load Offers JSON ---
async function load(){
  try{
    const r = await fetch('data/offers.json?_=' + Date.now());
    const j = await r.json();
    offers = j.offers || [];
    pwd = j.pwd || '';
  }catch(e){ offers = []; pwd = ''; }

  renderList();
  document.getElementById('btnAdd').addEventListener('click', addOrUpdate);
  document.getElementById('btnDownload').addEventListener('click', downloadOffers);
  document.getElementById('btnCopyCurl').addEventListener('click', copyCurl);
  document.getElementById('btnUpload').addEventListener('click', uploadToGitHub);
}
load();
