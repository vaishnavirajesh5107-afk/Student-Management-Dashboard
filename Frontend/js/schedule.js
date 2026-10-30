const API_BASE="https://student-management-dashboard-1-vuwt.onrender.com/api";
document.addEventListener("DOMContentLoaded",async()=>{
 const reg=localStorage.getItem("studentRegisterNo");if(!reg){location.href="login.html";return;}
 if(localStorage.getItem("dashboardTheme")==="dark")document.body.classList.add("dark");
 document.querySelectorAll("[data-theme-toggle]").forEach(b=>b.onclick=()=>{document.body.classList.toggle("dark");localStorage.setItem("dashboardTheme",document.body.classList.contains("dark")?"dark":"light")});
 document.querySelectorAll("[data-logout]").forEach(b=>b.onclick=()=>{localStorage.clear();location.href="login.html"});
 try{const r=await fetch(`${API_BASE}/schedule/${encodeURIComponent(reg)}`),d=await r.json();if(!r.ok||!d.success)throw new Error(d.message);const days=["Monday","Tuesday","Wednesday","Thursday","Friday"];const rows=d.data;document.querySelector("#scheduleGrid").innerHTML=days.map(day=>`<div class="card"><div class="card-heading"><h2>${day}</h2><span class="pill">${rows.filter(x=>x.day_name===day).length} classes</span></div>${rows.filter(x=>x.day_name===day).map(x=>`<div class="notice"><strong>${x.start_time}–${x.end_time}</strong><p>${x.subject_name}</p><p>Room: ${x.room||"TBA"}</p></div>`).join("")||'<p class="muted">No classes scheduled.</p>'}</div>`).join("");}
 catch(e){document.querySelector("#scheduleMessage").className="alert";document.querySelector("#scheduleMessage").textContent=(e.message||"Could not load schedule")+" — Start backend/app.py first.";}
});