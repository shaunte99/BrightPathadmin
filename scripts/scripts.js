// ================= FIREBASE INIT =================
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "brightpath-d34ab.firebaseapp.com",
  databaseURL: "https://brightpath-d34ab-default-rtdb.firebaseio.com",
  projectId: "brightpath-d34ab",
  storageBucket: "brightpath-d34ab.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};
firebase.initializeApp(firebaseConfig);
const db = firebase.database();

// ================= UTILS =================
function uid() { return 'id' + Date.now() + Math.floor(Math.random()*1000); }
async function loadData(path) {
  const snapshot = await db.ref(path).get();
  return snapshot.exists() ? snapshot.val() : [];
}
function saveData(path, data) {
  db.ref(path).set(data);
}

// ================= NAVIGATION =================
document.querySelectorAll('.nav-links li a').forEach(a=>{
  a.addEventListener('click', e=>{
    e.preventDefault();
    const panelId = a.dataset.panel;
    document.querySelectorAll('.panel').forEach(p=>p.classList.remove('active'));
    document.getElementById(panelId).classList.add('active');
  });
});

// ================= CHILDREN =================
async function renderChildren() {
  const children = await loadData('children') || [];
  const tbody = document.getElementById('childTable').querySelector('tbody');
  const selects = [document.getElementById('invoiceChild'), document.getElementById('signinChild'), document.getElementById('eventChild'), document.getElementById('progressChild')];
  
  tbody.innerHTML = children.map(c=>`
    <tr>
      <td>${c.name}</td><td>${c.age}</td><td>${c.notes}</td>
      <td>
        <button data-id="${c.id}" class="editChild">Edit</button>
        <button data-id="${c.id}" class="deleteChild">Delete</button>
      </td>
    </tr>`).join('');
  
  selects.forEach(sel=>{
    if(!sel) return;
    sel.innerHTML = children.map(c=>`<option value="${c.id}">${c.name}</option>`).join('') || '<option>No children</option>';
  });

  document.querySelectorAll('.editChild').forEach(btn=>{
    btn.onclick = async ()=>{
      const id = btn.dataset.id;
      const cIndex = children.findIndex(x=>x.id===id); if(cIndex===-1) return;
      const name = prompt('Name', children[cIndex].name); if(name) children[cIndex].name=name;
      const age = prompt('Age', children[cIndex].age); if(age) children[cIndex].age=Number(age);
      const notes = prompt('Notes', children[cIndex].notes); if(notes) children[cIndex].notes=notes;
      saveData('children', children); renderChildren();
    }
  });
  document.querySelectorAll('.deleteChild').forEach(btn=>{
    btn.onclick = async ()=>{
      if(!confirm('Delete this child?')) return;
      saveData('children', children.filter(x=>x.id!==btn.dataset.id));
      renderChildren();
    }
  });
}

document.getElementById('addChild').onclick = async ()=>{
  const name = document.getElementById('childName').value.trim(); if(!name) return alert('Enter name');
  const age = Number(document.getElementById('childAge').value);
  const notes = document.getElementById('childNotes').value.trim();
  const children = await loadData('children') || [];
  children.push({id: uid(), name, age, notes});
  saveData('children', children);
  document.getElementById('childName').value=''; document.getElementById('childAge').value=''; document.getElementById('childNotes').value='';
  renderChildren();
};

// ================= TUTORS =================
async function renderTutors() {
  const tutors = await loadData('tutors') || [];
  const tbody = document.getElementById('tutorTable').querySelector('tbody');
  tbody.innerHTML = tutors.map(t=>`
    <tr>
      <td>${t.name}</td><td>${t.subject}</td><td>${t.contact}</td>
      <td>
        <button data-id="${t.id}" class="editTutor">Edit</button>
        <button data-id="${t.id}" class="deleteTutor">Delete</button>
      </td>
    </tr>`).join('');
  
  document.querySelectorAll('.editTutor').forEach(btn=>{
    btn.onclick = async ()=>{
      const tIndex = tutors.findIndex(x=>x.id===btn.dataset.id); if(tIndex===-1) return;
      const name = prompt('Name', tutors[tIndex].name); if(name) tutors[tIndex].name=name;
      const subject = prompt('Subject', tutors[tIndex].subject); if(subject) tutors[tIndex].subject=subject;
      const contact = prompt('Contact', tutors[tIndex].contact); if(contact) tutors[tIndex].contact=contact;
      saveData('tutors', tutors); renderTutors();
    }
  });
  document.querySelectorAll('.deleteTutor').forEach(btn=>{
    btn.onclick = async ()=>{
      if(!confirm('Delete this tutor?')) return;
      saveData('tutors', tutors.filter(x=>x.id!==btn.dataset.id));
      renderTutors();
    }
  });
}

document.getElementById('addTutor').onclick = async ()=>{
  const name = document.getElementById('tutorName').value.trim(); if(!name) return alert('Enter name');
  const subject = document.getElementById('tutorSubject').value.trim();
  const contact = document.getElementById('tutorContact').value.trim();
  const tutors = await loadData('tutors') || [];
  tutors.push({id: uid(), name, subject, contact});
  saveData('tutors', tutors);
  document.getElementById('tutorName').value=''; document.getElementById('tutorSubject').value=''; document.getElementById('tutorContact').value='';
  renderTutors();
};

// ================= INVOICES =================
async function renderInvoices(){
  const invoices = await loadData('invoices') || [];
  const children = await loadData('children') || [];
  const tbody = document.getElementById('invoicesTable').querySelector('tbody');
  tbody.innerHTML = invoices.map(inv=>{
    const childName = children.find(c=>c.id===inv.childId)?.name || 'Unknown';
    return `<tr>
      <td>${inv.number}</td><td>${childName}</td><td>R${inv.total}</td><td>${inv.paid ? 'Paid':'Unpaid'}</td>
      <td>
        <button data-id="${inv.id}" class="deleteInvoice">Delete</button>
      </td>
    </tr>`;
  }).join('');

  document.querySelectorAll('.deleteInvoice').forEach(btn=>{
    btn.onclick = async ()=>{
      if(!confirm('Delete this invoice?')) return;
      saveData('invoices', invoices.filter(x=>x.id!==btn.dataset.id));
      renderInvoices();
    }
  });
}

document.getElementById('addInvoice').onclick = async ()=>{
  const childId = document.getElementById('invoiceChild').value;
  const number = document.getElementById('invoiceNumber').value.trim();
  const description = document.getElementById('invoiceDescription').value.trim();
  const rate = Number(document.getElementById('rate').value);
  const sessions = Number(document.getElementById('sessions').value);
  const tax = Number(document.getElementById('tax').value);
  const discount = Number(document.getElementById('discount').value);
  const paid = document.getElementById('markPaid').checked;
  if(!number || !childId) return alert('Enter required fields');
  const total = (rate*sessions) + ((rate*sessions)*tax/100) - discount;
  const invoices = await loadData('invoices') || [];
  invoices.push({id: uid(), childId, number, description, rate, sessions, tax, discount, total, paid});
  saveData('invoices', invoices);
  document.getElementById('invoiceNumber').value=''; document.getElementById('invoiceDescription').value=''; document.getElementById('rate').value='0'; document.getElementById('sessions').value='0'; document.getElementById('tax').value='0'; document.getElementById('discount').value='0'; document.getElementById('markPaid').checked=false;
  renderInvoices();
};

// ================= SIGN-INS =================
async function renderSignins() {
  const signins = await loadData('signins') || [];
  const children = await loadData('children') || [];
  const tbody = document.getElementById('signinTable').querySelector('tbody');
  tbody.innerHTML = signins.map(s=>{
    const childName = children.find(c=>c.id===s.childId)?.name || 'Unknown';
    return `<tr><td>${childName}</td><td>${s.signin || '-'}</td><td>${s.signout || '-'}</td><td>${s.date}</td></tr>`;
  }).join('');
  document.getElementById('todaySignins').textContent = signins.filter(s=>s.date===new Date().toISOString().split('T')[0]).length;
}

document.getElementById('signInChild').onclick = async ()=>{
  const childId = document.getElementById('signinChild').value;
  if(!childId) return alert('Select child');
  const signins = await loadData('signins') || [];
  const today = new Date().toISOString().split('T')[0];
  signins.push({id: uid(), childId, signin:new Date().toLocaleTimeString(), signout:'', date: today});
  saveData('signins', signins); renderSignins();
}

document.getElementById('signOutChild').onclick = async ()=>{
  const childId = document.getElementById('signinChild').value;
  if(!childId) return alert('Select child');
  const signins = await loadData('signins') || [];
  const today = new Date().toISOString().split('T')[0];
  const record = signins.find(s=>s.childId===childId && s.date===today && !s.signout);
  if(record) record.signout = new Date().toLocaleTimeString();
  saveData('signins', signins); renderSignins();
};

// ================= PROGRESS =================
async function renderProgress() {
  const progress = await loadData('progress') || [];
  const children = await loadData('children') || [];
  const tbody = document.getElementById('progressTable').querySelector('tbody');
  tbody.innerHTML = progress.map(p=>{
    const childName = children.find(c=>c.id===p.childId)?.name || 'Unknown';
    return `<tr><td>${childName}</td><td>${p.weekStart}</td><td>${p.score}</td><td>${p.summary}</td></tr>`;
  }).join('');
}

document.getElementById('addProgress').onclick = async ()=>{
  const childId = document.getElementById('progressChild').value;
  const weekStart = document.getElementById('weekStart').value;
  const score = Number(document.getElementById('progressScore').value);
  const summary = document.getElementById('progressSummary').value.trim();
  if(!childId || !weekStart) return alert('Enter required fields');
  const progress = await loadData('progress') || [];
  progress.push({id: uid(), childId, weekStart, score, summary});
  saveData('progress', progress);
  renderProgress();
};

// ================= CALENDAR =================
let calendarMonth = 0; // 0-11
let calendarYear = 2026;

function renderCalendar(month=calendarMonth, year=calendarYear){
  const monthNames = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  document.getElementById('calendarMonth').textContent = `${monthNames[month]} ${year}`;
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month+1,0).getDate();
  const grid = document.getElementById('calendarGrid'); grid.innerHTML='';
  const emptyCells = firstDay===0?6:firstDay-1; // Mon-start
  for(let i=0;i<emptyCells;i++) grid.innerHTML+='<div class="calendar-cell empty"></div>';
  for(let d=1;d<=daysInMonth;d++) grid.innerHTML+=`<div class="calendar-cell">${d}</div>`;
}

document.getElementById('prevMonth').onclick = ()=>{ calendarMonth--; if(calendarMonth<0){calendarMonth=11;calendarYear--;} renderCalendar(); }
document.getElementById('nextMonth').onclick = ()=>{ calendarMonth++; if(calendarMonth>11){calendarMonth=0;calendarYear++;} renderCalendar(); }

// ================= INITIAL RENDER =================
(async function(){
  await renderChildren();
  await renderTutors();
  await renderInvoices();
  await renderSignins();
  await renderProgress();
  renderCalendar();
})();
