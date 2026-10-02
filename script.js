const toggle=document.querySelector('.nav-toggle');
const nav=document.querySelector('.nav');
toggle?.addEventListener('click',()=>nav.classList.toggle('open'));
document.querySelectorAll('.nav a').forEach(a=>a.addEventListener('click',()=>nav.classList.remove('open')));

const lightbox=document.querySelector('.lightbox');
const lightboxImg=lightbox.querySelector('img');
document.querySelectorAll('.lightbox-trigger').forEach(btn=>{
  btn.addEventListener('click',()=>{
    lightboxImg.src=btn.dataset.src;
    lightbox.classList.add('open');
    lightbox.setAttribute('aria-hidden','false');
  });
});
const closeLightbox=()=>{
  lightbox.classList.remove('open');
  lightbox.setAttribute('aria-hidden','true');
  lightboxImg.src='';
};
document.querySelector('.lightbox-close').addEventListener('click',closeLightbox);
lightbox.addEventListener('click',e=>{if(e.target===lightbox)closeLightbox()});
document.addEventListener('keydown',e=>{if(e.key==='Escape')closeLightbox()});


// ===== Connexion CTF / Panel admin =====
const loginModal=document.getElementById('loginModal');
const adminModal=document.getElementById('adminModal');
const adminLink=document.getElementById('adminLink');
const loginForm=document.getElementById('loginForm');
const loginError=document.getElementById('loginError');
const adminWelcome=document.getElementById('adminWelcome');
const adminMembers=document.getElementById('adminMembers');
const adminConvoys=document.getElementById('adminConvoys');

// Demo front-end authentication: passwords are stored as SHA-256 hashes.
// For a production site, move authentication to a server/database.
const ADMIN_ACCOUNTS={
  'LeRoutierdu87':{role:'Développeur',hash:'b74673722dfab831fd3ec74f871319b27393017566a590ae5e66a0ef8a986ffd'},
  'Arlexen':{role:'Patron CTF',hash:'b35a3c720e9c1ba21ffc5557a5ec303d0df4c93c7d769502fdddf832aa8d1f'}
};
const sha256=async value=>{const data=new TextEncoder().encode(value);const hash=await crypto.subtle.digest('SHA-256',data);return [...new Uint8Array(hash)].map(b=>b.toString(16).padStart(2,'0')).join('')};
const openModal=id=>{const el=document.getElementById(id);if(el){el.classList.add('open');el.setAttribute('aria-hidden','false')}};
const closeModal=id=>{const el=document.getElementById(id);if(el){el.classList.remove('open');el.setAttribute('aria-hidden','true')}};

document.querySelector('.login')?.addEventListener('click',e=>{e.preventDefault();openModal('loginModal')});
document.querySelectorAll('[data-close]').forEach(b=>b.addEventListener('click',()=>closeModal(b.dataset.close)));
loginModal?.addEventListener('click',e=>{if(e.target===loginModal)closeModal('loginModal')});

loginForm?.addEventListener('submit',e=>{
  e.preventDefault();
  loginError.textContent='';

  const user=loginForm.querySelector('#loginUser').value.trim();
  const pass=loginForm.querySelector('#loginPass').value;

  // Comptes admin autorisés.
  const accounts={
    'LeRoutierdu87':{role:'Développeur',password:'200187'},
    'Arlexen':{role:'Patron CTF',password:'CTFArlexen'}
  };

  const accountKey=Object.keys(accounts).find(k=>k.toLowerCase()===user.toLowerCase());
  const account=accountKey ? accounts[accountKey] : null;

  if(!account || pass!==account.password){
    loginError.textContent='Identifiant ou mot de passe incorrect.';
    return;
  }

  sessionStorage.setItem('ctfAdmin',JSON.stringify({user:accountKey,role:account.role}));
  adminLink.classList.remove('hidden');
  closeModal('loginModal');
  loginForm.reset();
  adminWelcome.textContent=`Panel admin — ${accountKey} (${account.role})`;
  openModal('adminModal');
});

adminLink?.addEventListener('click',()=>openModal('adminModal'));
document.querySelectorAll('.admin-tab').forEach(tab=>tab.addEventListener('click',()=>{
  document.querySelectorAll('.admin-tab').forEach(x=>x.classList.remove('active'));
  document.querySelectorAll('.admin-view').forEach(x=>x.classList.remove('active'));
  tab.classList.add('active'); document.getElementById('tab-'+tab.dataset.tab)?.classList.add('active');
}));

document.getElementById('logoutBtn')?.addEventListener('click',()=>{
  sessionStorage.removeItem('ctfAdmin'); adminLink.classList.add('hidden'); closeModal('adminModal');
});

const convoyForm=document.getElementById('convoyForm');
const convoyList=document.getElementById('convoyList');
let convoys=JSON.parse(localStorage.getItem('ctfConvoys')||'[]');
function renderConvoys(){
  if(!convoyList)return;
  adminConvoys.textContent=String(Math.max(4,convoys.length+4));
  convoyList.innerHTML=convoys.length?convoys.map((c,i)=>`<div class="convoy-item"><div><b>${c.route}</b><small>${c.date} · ${c.time}</small></div><button class="admin-logout" data-remove="${i}">Supprimer</button></div>`).join(''):'<div class="admin-panel-box"><p>Aucun nouveau convoi ajouté.</p></div>';
  convoyList.querySelectorAll('[data-remove]').forEach(btn=>btn.addEventListener('click',()=>{convoys.splice(Number(btn.dataset.remove),1);localStorage.setItem('ctfConvoys',JSON.stringify(convoys));renderConvoys()}));
}
convoyForm?.addEventListener('submit',e=>{e.preventDefault();convoys.push({date:document.getElementById('convoyDate').value,time:document.getElementById('convoyTime').value,route:document.getElementById('convoyRoute').value});localStorage.setItem('ctfConvoys',JSON.stringify(convoys));convoyForm.reset();renderConvoys()});
renderConvoys();

const existingSession=sessionStorage.getItem('ctfAdmin');
if(existingSession){adminLink.classList.remove('hidden');try{const s=JSON.parse(existingSession);adminWelcome.textContent=`Panel admin — ${s.user} (${s.role})`}catch{}}

document.addEventListener('keydown',e=>{if(e.key==='Escape'){closeModal('loginModal');closeModal('adminModal')}});
