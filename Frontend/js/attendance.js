const API_BASE="http://127.0.0.1:5000/api";
document.addEventListener("DOMContentLoaded",async()=>{
 const reg=localStorage.getItem("studentRegisterNo");if(!reg){location.href="login.html";return;}
 if(localStorage.getItem("dashboardTheme")==="dark")document.body.classList.add("dark");
 document.querySelectorAll("[data-theme-toggle]").forEach(b=>b.onclick=()=>{document.body.classList.toggle("dark");localStorage.setItem("dashboardTheme",document.body.classList.contains("dark")?"dark":"light")});
 document.querySelectorAll("[data-logout]").forEach(b=>b.onclick=()=>{localStorage.clear();location.href="login.html"});
 const message=document.querySelector("#attendanceMessage");
 try{
  const res=await fetch(`${API_BASE}/attendance/${encodeURIComponent(reg)}`),data=await res.json();if(!res.ok||!data.success)throw new Error(data.message||"Unable to load attendance");
  const rows=data.data;document.querySelector("#attendanceTable tbody").innerHTML=rows.map(a=>`<tr><td>${a.subject_name}</td><td>${a.attended_classes}</td><td>${a.total_classes}</td><td><strong>${a.percentage}%</strong><div class="progress"><span style="width:${a.percentage}%"></span></div></td><td><span class="pill">${a.percentage>=75?"Eligible":"Below 75%"}</span></td></tr>`).join("");
  const avg=rows.length?Math.round(rows.reduce((s,a)=>s+a.percentage,0)/rows.length):0;document.querySelector("#attendanceAverage").textContent=avg+"%";
  document.querySelector("#attendanceSearch")?.addEventListener("input",e=>document.querySelectorAll("#attendanceTable tbody tr").forEach(tr=>tr.hidden=!tr.textContent.toLowerCase().includes(e.target.value.toLowerCase())));
 }catch(e){message.className="alert";message.textContent=e.message+" — Start backend/app.py first.";}
 document.querySelector("#exportAttendance")?.addEventListener("click",()=>{const rows=[["Subject","Attended","Total","Percentage"],...Array.from(document.querySelectorAll("#attendanceTable tbody tr")).map(tr=>[...tr.children].slice(0,4).map(td=>td.innerText.replace(/\n/g," ")) )];const csv="\uFEFF"+rows.map(r=>r.map(v=>`"${String(v).replace(/"/g,'""')}"`).join(",")).join("\r\n");const a=document.createElement("a");a.href=URL.createObjectURL(new Blob([csv],{type:"text/csv;charset=utf-8;"}));a.download="attendance.csv";a.click();URL.revokeObjectURL(a.href);});
});