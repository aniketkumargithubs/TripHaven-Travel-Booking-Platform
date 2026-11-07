document.addEventListener("DOMContentLoaded", () => {
    const guestDisplay = document.getElementById("guestDisplay");
    const guestPanel = document.getElementById("guestPanel");
    const guestArrow = document.getElementById("guestArrow");
    const guestDone = document.getElementById("guestDone");

    const updateSummary = () => {
        const a = parseInt(document.getElementById("adults").value, 10) || 0;
        const c = parseInt(document.getElementById("children").value, 10) || 0;
        let text = `${a} Adult${a>1?"s":""}`;
        if (c > 0) text += `, ${c} Child${c>1?"ren":""}`;
        const txtEl = document.querySelector(".guest-text");
        if (txtEl) txtEl.textContent = text;
    };

    const setPanel = (show) => {
        if (show) {
            guestPanel.classList.add("show");
            guestDisplay.setAttribute("aria-expanded", "true");
            guestArrow.style.transform = "rotate(180deg)";
        } else {
            guestPanel.classList.remove("show");
            guestDisplay.setAttribute("aria-expanded", "false");
            guestArrow.style.transform = "rotate(0deg)";
        }
    };

    guestDisplay?.addEventListener("click", (e) => {
        e.stopPropagation();
        setPanel(!guestPanel.classList.contains("show"));
    });

    guestDone?.addEventListener("click", (e) => {
        e.preventDefault();
        setPanel(false);
    });

    // close when clicking outside
    document.addEventListener("click", (e) => {
        if (!guestPanel.contains(e.target) && !guestDisplay.contains(e.target)) {
            setPanel(false);
        }
    });

    // counter handling
    const buttons = document.querySelectorAll(".counter-btn");
    buttons.forEach((button) => {
        button.addEventListener("click", (e) => {
            const targetId = button.dataset.target;
            const input = document.getElementById(targetId);
            if (!input) return;
            const step = button.classList.contains("increment") ? 1 : -1;
            const min = parseInt(input.min, 10) || 0;
            const value = Math.max(min, parseInt(input.value, 10) + step);
            input.value = value;
            updateSummary();
        });
    });

    // initialize summary on load
    updateSummary();
});
