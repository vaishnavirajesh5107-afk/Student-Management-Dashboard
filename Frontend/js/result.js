const API_BASE = "https://student-management-dashboard-1-vuwt.onrender.com/api";
document.addEventListener("DOMContentLoaded",async()=>{
 const reg=localStorage.getItem("studentRegisterNo");if(!reg){location.href="login.html";return;}
 if(localStorage.getItem("dashboardTheme")==="dark")document.body.classList.add("dark");
 document.querySelectorAll("[data-theme-toggle]").forEach(b=>b.onclick=()=>{document.body.classList.toggle("dark");localStorage.setItem("dashboardTheme",document.body.classList.contains("dark")?"dark":"light")});
 document.querySelectorAll("[data-logout]").forEach(b=>b.onclick=()=>{localStorage.clear();location.href="login.html"});
 const message=document.querySelector("#resultMessage");
 try{
  const res=await fetch(`${API_BASE}/results/${encodeURIComponent(reg)}`),data=await res.json();if(!res.ok||!data.success)throw new Error(data.message||"Unable to load results");
  const r=data.data;document.querySelector("#averageMarks").textContent=`${r.average}%`;document.querySelector("#overallGrade").textContent=r.grade;
  document.querySelector("#resultsTable tbody").innerHTML=r.subjects.map(s=>{const m=Number(s.marks);return `<tr><td>${s.subject_code||"—"}</td><td>${s.subject_name}</td><td>${s.credits}</td><td>${m}%</td><td><span class="pill">${s.grade}</span></td></tr>`}).join("");
  const search=document.querySelector("#resultSearch");search?.addEventListener("input",()=>document.querySelectorAll("#resultsTable tbody tr").forEach(row=>row.hidden=!row.textContent.toLowerCase().includes(search.value.toLowerCase())));
 }catch(e){message.className="alert";message.textContent=e.message+" — Start backend/app.py first.";}
 document.querySelector("#printResults")?.addEventListener("click",()=>window.print());
 document.querySelector("#exportResults")?.addEventListener("click",()=>{const rows=[["Subject Code","Subject Name","Credits","Marks","Grade"],...Array.from(document.querySelectorAll("#resultsTable tbody tr")).map(tr=>Array.from(tr.children).map(td=>td.innerText))];const csv="\uFEFF"+rows.map(r=>r.map(v=>`"${String(v).replace(/"/g,'""')}"`).join(",")).join("\r\n");const a=document.createElement("a");a.href=URL.createObjectURL(new Blob([csv],{type:"text/csv;charset=utf-8;"}));a.download="semester-results.csv";a.click();URL.revokeObjectURL(a.href);});
});