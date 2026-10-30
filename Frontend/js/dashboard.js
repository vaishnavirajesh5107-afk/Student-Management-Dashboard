const RESULT_API_BASE = "https://student-management-dashboard-1-vuwt.onrender.com/api";
const currentRegisterNo = localStorage.getItem("studentRegisterNo");
function requireLogin(){ if(!currentRegisterNo){ window.location.href="login.html"; return false;} return true; }
async function apiGet(path){
  const response = await fetch(`${RESULT_API_BASE}${path}`);
  const result = await response.json();
  if(!response.ok || !result.success) throw new Error(result.message || "Request failed");
  return result.data;
}
function safeText(value){return String(value ?? "").replace(/[&<>"']/g, c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}
function setUser(name, registerNo){
  document.querySelectorAll("[data-student-name]").forEach(el=>el.textContent=name);
  document.querySelectorAll("[data-register-no]").forEach(el=>el.textContent=registerNo);
  document.querySelectorAll("[data-avatar]").forEach(el=>el.textContent=(name||"S").trim().charAt(0).toUpperCase());
}
function gradeFor(m){return m>=90?"O":m>=80?"A+":m>=70?"A":m>=60?"B+":m>=50?"B":"RA";}
function mountTheme(){
  if(localStorage.getItem("dashboardTheme")==="dark")document.body.classList.add("dark");
  document.querySelectorAll("[data-theme-toggle]").forEach(btn=>btn.addEventListener("click",()=>{
    document.body.classList.toggle("dark");
    localStorage.setItem("dashboardTheme",document.body.classList.contains("dark")?"dark":"light");
  }));
}
function mountCommon(){
  mountTheme();
  document.querySelectorAll("[data-logout]").forEach(btn=>btn.addEventListener("click",()=>{
    localStorage.removeItem("studentRegisterNo");localStorage.removeItem("studentName");window.location.href="login.html";
  }));
}
async function loadDashboard(){
  if(!requireLogin())return;
  mountCommon();
  try{
    const [student, subjects, attendance, results, notifications] = await Promise.all([
      apiGet(`/student/${encodeURIComponent(currentRegisterNo)}`),
      apiGet(`/subjects/${encodeURIComponent(currentRegisterNo)}`),
      apiGet(`/attendance/${encodeURIComponent(currentRegisterNo)}`),
      apiGet(`/results/${encodeURIComponent(currentRegisterNo)}`),
      apiGet(`/notifications/${encodeURIComponent(currentRegisterNo)}`)
    ]);
    setUser(student.name,student.register_no);
    const average=results.average||0;
    const attendanceAvg=attendance.length?Math.round(attendance.reduce((s,a)=>s+a.percentage,0)/attendance.length):0;
    put("statSubjects",subjects.length);put("statAverage",`${average}%`);put("statAttendance",`${attendanceAvg}%`);put("statGrade",results.grade);
    const rows=subjects.slice(0,5).map(s=>`<tr><td><strong>${safeText(s.subject_name)}</strong><br><small class="muted">${safeText(s.subject_code)}</small></td><td>${s.credits}</td><td>${s.marks}%</td><td><span class="pill">${gradeFor(s.marks)}</span></td></tr>`).join("");
    const table=document.querySelector("#recentSubjects");if(table)table.innerHTML=rows||'<tr><td colspan="4">No subjects yet.</td></tr>';
    const noticeBox=document.querySelector("#notifications");
    if(noticeBox)noticeBox.innerHTML=notifications.map(n=>`<div class="notice"><strong>${safeText(n.title)}</strong><p>${safeText(n.message)}</p></div>`).join("")||'<p class="muted">No notifications.</p>';
    const chart=document.querySelector("#performanceChart");
    if(chart)chart.innerHTML=subjects.map(s=>`<div class="bar-col"><b>${s.marks}%</b><div class="bar" style="height:${Math.max(5,s.marks)}%"></div><small>${safeText(s.subject_code||s.subject_name.slice(0,7))}</small></div>`).join("");
  }catch(e){const box=document.querySelector("#pageMessage");if(box){box.className="alert";box.textContent=e.message+" — Make sure backend/app.py is running.";} }
}
function put(id,value){const el=document.getElementById(id);if(el)el.textContent=value;}
document.addEventListener("DOMContentLoaded",()=>{if(document.body.dataset.page==="dashboard")loadDashboard();else mountCommon();});