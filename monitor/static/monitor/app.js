document.addEventListener("DOMContentLoaded", () => {
    const btnScan = document.getElementById("scan-btn");
    const btnPause = document.getElementById("pause-btn");
    const btnResume = document.getElementById("resume-btn");
    const btnStop = document.getElementById("stop-btn");
    const btnRestart = document.getElementById("restart-btn");
    const btnGraphToggle = document.getElementById("graph-toggle-btn");

    const output = document.getElementById("output");
    const ctx = document.getElementById("scanGraph");

    let paused = false;
    let stopped = false;
    let graphVisible = true;
    let currentIndex = 0;
    let processes = [];

    // -------------------------------
    // BAR GRAPH (Memory + Time)
    // -------------------------------
    const scanChart = new Chart(ctx, {
        type: "bar",
        data: {
            labels: [],
            datasets: [
                {
                    label: "Memory (MB)",
                    data: [],
                    backgroundColor: "rgba(59,130,246,0.6)",
                    borderColor: "#3b82f6",
                    borderWidth: 2,
                    borderRadius: 6
                },
                {
                    label: "Scan Time (ms)",
                    data: [],
                    backgroundColor: "rgba(168,85,247,0.6)",
                    borderColor: "#a855f7",
                    borderWidth: 2,
                    borderRadius: 6
                }
            ]
        },
        options: {
            responsive: true,
            animation: { duration: 350 },
            scales: {
                x: { ticks: { color: "#e5e7eb" } },
                y: { ticks: { color: "#e5e7eb" } }
            },
            plugins: { legend: { labels: { color: "white" } } }
        }
    });

    function updateGraph(memoryMB, scanTime) {
        const now = new Date().toLocaleTimeString();

        scanChart.data.labels.push(now);
        scanChart.data.datasets[0].data.push(memoryMB);
        scanChart.data.datasets[1].data.push(scanTime);

        if (scanChart.data.labels.length > 20) {
            scanChart.data.labels.shift();
            scanChart.data.datasets[0].data.shift();
            scanChart.data.datasets[1].data.shift();
        }

        scanChart.update();
    }

    // -------------------------------
    // MAIN SCANNING FUNCTION
    // -------------------------------
    async function processLoop() {
        while (currentIndex < processes.length) {
            if (stopped) return;
            if (paused) {
                await new Promise(r => setTimeout(r, 200));
                continue;
            }

            const p = processes[currentIndex];
            currentIndex++;

            const start = performance.now();
            const memoryMB = (p.memory / 1024 / 1024).toFixed(2);

            const item = document.createElement("div");
            item.className = "process-item";
            item.textContent = `🟢 ${p.pid} | ${p.name} | ${memoryMB} MB`;
            output.appendChild(item);

            setTimeout(() => item.classList.add("fade"), 500);
            setTimeout(() => item.remove(), 1800);

            const scanTime = (performance.now() - start).toFixed(2);

            if (graphVisible) updateGraph(memoryMB, scanTime);

            await new Promise(r => setTimeout(r, 200));
        }

        output.innerHTML += "\n\n✅ Scan complete!";
    }

    // -------------------------------
    // BUTTON ACTIONS
    // -------------------------------

    // SCAN
    btnScan.addEventListener("click", async () => {
        paused = false;
        stopped = false;
        currentIndex = 0;

        output.innerHTML = "⏳ Fetching processes...\n";

        const res = await fetch("/scan/");
        const data = await res.json();
        processes = data.results;

        output.innerHTML += `🔍 ${processes.length} Processes found.\n\n`;
        processLoop();
    });

    // PAUSE
    btnPause.addEventListener("click", () => {
        paused = true;
        output.innerHTML += "\n⏸ Paused...\n";
    });

    // RESUME
    btnResume.addEventListener("click", () => {
        if (!paused) return;
        paused = false;
        output.innerHTML += "▶ Resuming...\n";
    });

    // STOP
    btnStop.addEventListener("click", () => {
        stopped = true;
        paused = false;
        output.innerHTML += "\n⏹ Scan stopped.\n";
    });

    // RESTART (fresh scan)
    btnRestart.addEventListener("click", () => {
        stopped = true;
        paused = false;
        currentIndex = 0;

        scanChart.data.labels = [];
        scanChart.data.datasets[0].data = [];
        scanChart.data.datasets[1].data = [];
        scanChart.update();

        output.innerHTML = "🔄 Restarting scan...\n";

        btnScan.click();
    });

    // GRAPH ON / OFF
    btnGraphToggle.addEventListener("click", () => {
        graphVisible = !graphVisible;
        ctx.style.display = graphVisible ? "block" : "none";
        btnGraphToggle.style.opacity = graphVisible ? "1" : "0.5";
    });
});
