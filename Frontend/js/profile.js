const API_BASE = "http://127.0.0.1:5000/api";

document.addEventListener("DOMContentLoaded", async () => {
    const reg = localStorage.getItem("studentRegisterNo");

    if (!reg) {
        location.href = "login.html";
        return;
    }

    if (localStorage.getItem("dashboardTheme") === "dark") {
        document.body.classList.add("dark");
    }

    document.querySelectorAll("[data-theme-toggle]").forEach(button => {
        button.addEventListener("click", () => {
            document.body.classList.toggle("dark");

            localStorage.setItem(
                "dashboardTheme",
                document.body.classList.contains("dark") ? "dark" : "light"
            );
        });
    });

    document.querySelectorAll("[data-logout]").forEach(button => {
        button.addEventListener("click", () => {
            localStorage.clear();
            location.href = "login.html";
        });
    });

    const form = document.querySelector("#profileForm");
    const message = document.querySelector("#profileMessage");

    try {
        const response = await fetch(
            `${API_BASE}/student/${encodeURIComponent(reg)}`
        );

        const result = await response.json();

        if (!response.ok || !result.success) {
            throw new Error(result.message || "Unable to load profile.");
        }

        const student = result.data;

        form.elements["name"].value = student.name || "";
        form.elements["email"].value = student.email || "";
        form.elements["phone"].value = student.phone || "";

        if (form.elements["year_level"]) {
            form.elements["year_level"].value =
                student.year_level || "III Year";
        }

        if (form.elements["semester"]) {
            form.elements["semester"].value =
                student.semester || "Semester 5";
        }

        document.querySelector("#profileRegister").textContent =
            student.register_no || "—";

        document.querySelector("#profileDepartment").textContent =
            student.department || "—";

        document.querySelector("#profileYear").textContent =
            student.year_level || "III Year";

        document.querySelector("#profileSemester").textContent =
            student.semester || "Semester 5";

    } catch (error) {
        message.className = "alert";
        message.textContent = error.message;
    }

    form.addEventListener("submit", async event => {
        event.preventDefault();

        try {
            const response = await fetch(
                `${API_BASE}/student/${encodeURIComponent(reg)}`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        name: form.elements["name"].value,
                        email: form.elements["email"].value,
                        phone: form.elements["phone"].value,
                        year_level: form.elements["year_level"].value,
                        semester: form.elements["semester"].value
                    })
                }
            );

            const result = await response.json();

            if (!response.ok || !result.success) {
                throw new Error(result.message || "Profile update failed.");
            }

            const student = result.data;

            document.querySelector("#profileYear").textContent =
                student.year_level;

            document.querySelector("#profileSemester").textContent =
                student.semester;

            localStorage.setItem("studentName", student.name);

            message.className = "alert success";
            message.textContent = "Profile updated successfully!";

        } catch (error) {
            message.className = "alert";
            message.textContent = error.message;
        }
    });
});