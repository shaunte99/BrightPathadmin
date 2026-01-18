import { db } from './firebase.js';
import { ref, onValue, push, set } from "firebase/database";

// References
const usersRef = ref(db,'users');
const studentsRef = ref(db,'students');
const appointmentsRef = ref(db,'appointments');
const invoicesRef = ref(db,'invoices');
const progressRef = ref(db,'progress');

// LOAD STATS
function loadStats(){
  let tutors=0, students=0;
  onValue(usersRef,snap=>{ tutors=0; snap.forEach(u=>{ if(u.val().role==='tutor') tutors++; }); document.getElementById('total-tutors').textContent=tutors; });
  onValue(studentsRef,snap=>{ students=snap.size; document.getElementById('total-students').textContent=students; });
}

// LOAD NOTIFICATIONS
function loadNotifications(){
  const list=document.getElementById('notifications-list'); list.innerHTML='';
  onValue(appointmentsRef,snap=>{ list.innerHTML=''; snap.forEach(a=>{ const apt=a.val(); if(apt.status==='pending'){ const li=document.createElement('li'); li.textContent=`Upcoming: ${apt.student} with ${apt.tutor} on ${apt.date} at ${apt.time}`; list.appendChild(li); } }); });
}

// LOAD DROPDOWNS
function loadDropdowns(){
  const studentSelect=document.getElementById('student-select');
  const tutorSelect=document.getElementById('tutor-select');
  studentSelect.innerHTML=''; tutorSelect.innerHTML='';
  onValue(studentsRef,snap=>{ snap.forEach(s=>{ const opt=document.createElement('option'); opt.value=opt.textContent=s.val().name; studentSelect.appendChild(opt); }); });
  onValue(usersRef,snap=>{ snap.forEach(u=>{ if(u.val().role==='tutor'){ const opt=document.createElement('option'); opt.value=opt.textContent=u.val().name; tutorSelect.appendChild(opt); } }); });
}

// ADD APPOINTMENT
document.getElementById('add-appointment-form').addEventListener('submit',e=>{
  e.preventDefault();
  const student=document.getElementById('student-select').value;
  const tutor=document.getElementById('tutor-select').value;
  const date=document.getElementById('apt-date').value;
  const time=document.getElementById('apt-time').value;
  const newRef=push(appointmentsRef);
  set(newRef,{student,tutor,date,time,status:'pending'});
  renderCalendar(); loadNotifications(); e.target.reset();
});

// CALENDAR
function renderCalendar(){
  const calendar=document.getElementById('calendar'); calendar.innerHTML='';
  const today=new Date(); const month=today.getMonth(); const year=today.getFullYear();
  const firstDay=new Date(year,month,1).getDay();
  const daysInMonth=new Date(year,month+1,0).getDate();
  let appointments={};
  onValue(appointmentsRef,snap=>{ if(snap.exists()){ snap.forEach(a=>{ const apt=a.val(); if(!appointments[apt.date]) appointments[apt.date]=[]; appointments[apt.date].push(apt); });
  for(let i=0;i<firstDay;i++){ const empty=document.createElement('div'); empty.className='day empty'; calendar.appendChild(empty);}
  for(let day=1;day<=daysInMonth;day++){ const dateStr=`${year}-${String(month+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
  const dayDiv=document.createElement('div'); dayDiv.className='day';
  const h=document.createElement('h4'); h.textContent=day; dayDiv.appendChild(h);
  if(appointments[dateStr]){ appointments[dateStr].forEach(apt=>{ const d=document.createElement('div'); d.className='appointment'; d.textContent=`${apt.student} (${apt.time})`; dayDiv.appendChild(d); }); }
  calendar.appendChild(dayDiv);} }});
}

// LOAD INVOICES
function loadInvoices(){
  const tbody=document.querySelector('#invoices-table tbody'); tbody.innerHTML='';
  onValue(invoicesRef,snap=>{ snap.forEach(invSnap=>{ const inv=invSnap.val();
    const tr=document.createElement('tr'); tr.innerHTML=`<td>${inv.student}</td><td>R${inv.amount}</td><td>${inv.status}</td><td><button class="mark-paid">Mark Paid</button></td>`;
    tr.querySelector('.mark-paid').addEventListener('click',()=>{ set(ref(db,'invoices/'+invSnap.key+'/status'),'paid'); });
    tbody.appendChild(tr);
  });});
}

// LOAD PROGRESS
function loadProgress(){
  const tbody=document.querySelector('#progress-table tbody'); tbody.innerHTML='';
  onValue(progressRef,snap=>{ snap.forEach(pSnap=>{ const p=pSnap.val(); const tr=document.createElement('tr'); tr.innerHTML=`<td>${p.student}</td><td>${p.subject}</td><td>${p.progress}</td><td></td>`; tbody.appendChild(tr); }); });
}

// INITIALIZE
loadStats(); loadDropdowns(); loadNotifications(); renderCalendar(); loadInvoices(); loadProgress();
