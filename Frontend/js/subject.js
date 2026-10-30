const API_BASE = "http://127.0.0.1:5000/api";
const reg = localStorage.getItem("studentRegisterNo");
const esc = v => String(v ?? "").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
async function request(path, options={}) {
  const res=await fetch(API_BASE+path,options);const data=await res.json();
  if(!res.ok||!data.success)throw new Error(data.message||"Request failed");return data.data;
}
function common(){if(!reg){location.href="login.html";return false;}if(localStorage.getItem("dashboardTheme")==="dark")document.body.classList.add("dark");document.querySelectorAll("[data-theme-toggle]").forEach(b=>b.onclick=()=>{document.body.classList.toggle("dark");localStorage.setItem("dashboardTheme",document.body.classList.contains("dark")?"dark":"light")});document.querySelectorAll("[data-logout]").forEach(b=>b.onclick=()=>{localStorage.clear();location.href="login.html"});return true;}
async function loadSubjects(){
 if(!common())return;
 const tbody=document.querySelector("#subjectsTable tbody"),message=document.querySelector("#subjectMessage");
 try{
  const [subjects,student]=await Promise.all([request(`/subjects/${encodeURIComponent(reg)}`),request(`/student/${encodeURIComponent(reg)}`)]);
  document.querySelectorAll("[data-student-name]").forEach(e=>e.textContent=student.name);
  tbody.innerHTML=subjects.map(s=>`<tr><td>${esc(s.subject_code)}</td><td><strong>${esc(s.subject_name)}</strong></td><td>${s.credits}</td><td><input aria-label="Marks for ${esc(s.subject_name)}" type="number" min="0" max="100" value="${s.marks}" data-mark="${s.id}" style="width:80px;padding:7px;border:1px solid var(--line);border-radius:8px;background:var(--bg);color:var(--text)"></td><td><button class="btn small primary" data-save-mark="${s.id}">Save</button></td></tr>`).join("");
  document.querySelectorAll("[data-save-mark]").forEach(b=>b.onclick=async()=>{
   const id=b.dataset.saveMark,input=document.querySelector(`[data-mark="${id}"]`),marks=Number(input.value);
   if(!Number.isFinite(marks)||marks<0||marks>100){message.className="alert";message.textContent="Marks must be between 0 and 100.";return;}
   try{await request(`/subjects/item/${id}`,{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify({marks})});message.className="alert success";message.textContent="Marks saved successfully.";}catch(e){message.className="alert";message.textContent=e.message;}
  });
 }catch(e){message.className="alert";message.textContent=e.message+" — Start backend/app.py first.";}
 const form=document.querySelector("#addSubjectForm");
 if(form)form.onsubmit=async e=>{e.preventDefault();try{await request(`/subjects/${encodeURIComponent(reg)}`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({subject_code:form.subject_code.value,subject_name:form.subject_name.value,credits:form.credits.value,marks:form.marks.value})});message.className="alert success";message.textContent="Subject added.";form.reset();loadSubjects();}catch(err){message.className="alert";message.textContent=err.message;}};
}
document.addEventListener("DOMContentLoaded",loadSubjects);