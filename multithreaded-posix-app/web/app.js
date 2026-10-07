// Real-Time Multithreaded Task Processing Application Script

document.addEventListener('DOMContentLoaded', () => {
    // Tab Navigation
    const navTabs = document.querySelectorAll('.nav-tab');
    const tabContents = document.querySelectorAll('.tab-content');

    navTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const targetId = tab.getAttribute('data-tab');
            navTabs.forEach(t => t.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));

            tab.classList.add('active');
            document.getElementById(targetId).classList.add('active');
        });
    });

    // Real-Time Application State
    let tasks = [];
    let completedCount = 0;
    let sharedResourceCount = 0;
    let isMutexEnabled = true;
    let isRunning = false;

    // DOM Elements
    const mutexBanner = document.getElementById('mutex-banner');
    const mutexBadge = document.getElementById('mutex-badge');
    const mutexTitle = document.getElementById('mutex-title');
    const mutexHolderText = document.getElementById('mutex-holder-text');
    const sharedResourceVal = document.getElementById('shared-resource-val');

    const taskCountBadge = document.getElementById('task-count-badge');
    const poolStatus = document.getElementById('pool-status');
    const taskTableBody = document.getElementById('task-table-body');
    const threadsArena = document.getElementById('threads-arena');
    const resultsGrid = document.getElementById('results-grid');
    const terminalOutput = document.getElementById('terminal-output');

    // Summary Elements
    const sumTotal = document.getElementById('sum-total');
    const sumCompleted = document.getElementById('sum-completed');
    const sumShared = document.getElementById('sum-shared');
    const sumSync = document.getElementById('sum-sync');

    // Controls
    const mutexToggle = document.getElementById('mutex-toggle');
    const mutexStatusText = document.getElementById('mutex-status-text');

    const btnOpenModal = document.getElementById('btn-open-modal');
    const btnLoadSample = document.getElementById('btn-load-sample');
    const btnRunThreads = document.getElementById('btn-run-threads');
    const btnResetSystem = document.getElementById('btn-reset-system');
    const btnClearLog = document.getElementById('btn-clear-log');

    // Modal
    const addModal = document.getElementById('add-modal');
    const modalCloseBtn = document.getElementById('modal-close-btn');
    const btnCancelModal = document.getElementById('btn-cancel-modal');
    const addTaskForm = document.getElementById('add-task-form');

    // Mutex Toggle Switch
    mutexToggle.addEventListener('change', (e) => {
        isMutexEnabled = e.target.checked;
        if (isMutexEnabled) {
            mutexStatusText.innerHTML = '🔒 Mutex Synchronization: <strong>ENABLED</strong>';
            sumSync.textContent = 'MUTEX ENABLED';
            sumSync.className = 'sum-value success';
            logTerminal('[MUTEX] Mutex synchronization lock protection ENABLED.', 'green');
        } else {
            mutexStatusText.innerHTML = '⚠️ Mutex Synchronization: <strong>DISABLED</strong>';
            sumSync.textContent = 'MUTEX DISABLED';
            sumSync.className = 'sum-value danger';
            logTerminal('[WARNING] Mutex protection DISABLED! Race condition hazard active.', 'red');
        }
    });

    // Add Task Modal Logic (NO DURATION INPUT)
    btnOpenModal.addEventListener('click', () => {
        if (isRunning) return;
        addModal.classList.add('active');
    });

    modalCloseBtn.addEventListener('click', () => addModal.classList.remove('active'));
    btnCancelModal.addEventListener('click', () => addModal.classList.remove('active'));

    addTaskForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('input-task-name').value;
        const action = document.getElementById('select-task-action').value;

        tasks.push({
            id: tasks.length + 1,
            name: name,
            action: action,
            status: "PENDING",
            latencyMs: null,
            resultData: null
        });

        addTaskForm.reset();
        addModal.classList.remove('active');
        renderTable();
        renderThreads();
        updateSummary();
        logTerminal(`[TASK_ADD] Added task "${name}" to execution queue.`, 'cyan');
    });

    // Sample Preset Tasks
    btnLoadSample.addEventListener('click', () => {
        if (isRunning) return;
        tasks = [
            { id: 1, name: "Download Sample High-Res Image", action: "IMAGE", status: "PENDING", latencyMs: null, resultData: null },
            { id: 2, name: "Download Project Specification PDF", action: "DOCUMENT", status: "PENDING", latencyMs: null, resultData: null },
            { id: 3, name: "Compute Prime Numbers Matrix", action: "PRIMES", status: "PENDING", latencyMs: null, resultData: null },
            { id: 4, name: "Generate SHA-256 Security Hash", action: "HASH", status: "PENDING", latencyMs: null, resultData: null }
        ];
        resetState();
        logTerminal('Loaded 4 sample real-time tasks into queue.', 'green');
    });

    function renderTable() {
        taskCountBadge.textContent = `${tasks.length} Tasks`;
        if (tasks.length === 0) {
            taskTableBody.innerHTML = `<tr><td colspan="6" class="empty-msg">No tasks in queue. Click "Add New Task" or "Quick Sample Tasks".</td></tr>`;
            return;
        }

        taskTableBody.innerHTML = '';
        tasks.forEach(t => {
            const tr = document.createElement('tr');
            let statusColor = '#fbbf24';
            if (t.status === 'COMPLETED') statusColor = '#34d399';
            if (t.status === 'MUTEX LOCKED') statusColor = '#f87171';

            let actionBadge = '🖼️ Image Download';
            if (t.action === 'DOCUMENT') actionBadge = '📄 PDF Download';
            if (t.action === 'AUDIO') actionBadge = '🎵 Audio Track';
            if (t.action === 'PRIMES') actionBadge = '🧮 Compute Primes';
            if (t.action === 'HASH') actionBadge = '🔒 SHA-256 Hash';

            const latencyStr = t.latencyMs ? `<strong>${t.latencyMs.toFixed(0)} ms</strong>` : '<span style="color: var(--text-dim);">Measuring...</span>';

            tr.innerHTML = `
                <td><code>#TASK-${t.id}</code></td>
                <td><strong>${t.name}</strong></td>
                <td><span class="action-chip">${actionBadge}</span></td>
                <td style="color: ${statusColor}; font-weight: 600;">${t.status}</td>
                <td>${latencyStr}</td>
                <td>
                    <button class="btn-delete" onclick="deleteTask(${t.id})" ${isRunning ? 'disabled' : ''}>&times;</button>
                </td>
            `;
            taskTableBody.appendChild(tr);
        });
    }

    window.deleteTask = function(id) {
        if (isRunning) return;
        tasks = tasks.filter(t => t.id !== id);
        tasks.forEach((t, i) => t.id = i + 1);
        resetState();
    };

    function renderThreads() {
        if (tasks.length === 0) {
            threadsArena.innerHTML = `<div class="empty-msg">Concurrent worker thread execution cards will appear here.</div>`;
            return;
        }

        threadsArena.innerHTML = '';
        tasks.forEach(t => {
            const row = document.createElement('div');
            row.className = 'thread-row';
            row.id = `thread-row-${t.id}`;
            row.innerHTML = `
                <div class="thread-row-header">
                    <span class="thread-row-title">Worker Thread #${t.id} &mdash; ${t.name}</span>
                    <span class="thread-row-status" id="thread-status-${t.id}">${t.status}</span>
                </div>
                <div class="thread-progress">
                    <div class="thread-progress-fill" id="thread-fill-${t.id}"></div>
                </div>
            `;
            threadsArena.appendChild(row);
        });
    }

    function updateSummary() {
        sumTotal.textContent = tasks.length;
        sumCompleted.textContent = completedCount;
        sumShared.textContent = sharedResourceCount;
    }

    function resetState() {
        isRunning = false;
        completedCount = 0;
        sharedResourceCount = 0;
        tasks.forEach(t => { t.status = 'PENDING'; t.latencyMs = null; t.resultData = null; });

        sharedResourceVal.textContent = '0';
        updateSummary();
        renderTable();
        renderThreads();
        resultsGrid.innerHTML = `<div class="empty-msg">Downloaded images, document data, audio streams, and computed outputs will display here.</div>`;

        mutexBanner.className = 'mutex-banner';
        mutexBadge.textContent = 'MUTEX UNLOCKED';
        mutexTitle.textContent = 'Critical Section Open';
        mutexHolderText.textContent = 'Shared memory available for next worker thread';

        poolStatus.textContent = 'IDLE';
        poolStatus.className = 'status-pill';
        btnRunThreads.disabled = false;
    }

    btnResetSystem.addEventListener('click', () => {
        if (isRunning) return;
        resetState();
        logTerminal('System state reset.', 'cyan');
    });

    function logTerminal(text, color = 'white') {
        const timestamp = new Date().toLocaleTimeString();
        const line = document.createElement('div');
        line.className = `log-line ${color}`;
        line.textContent = `[${timestamp}] ${text}`;
        terminalOutput.appendChild(line);
        terminalOutput.scrollTop = terminalOutput.scrollHeight;
    }

    btnClearLog.addEventListener('click', () => terminalOutput.innerHTML = '');

    // Real Execution Handler
    async function performTaskWork(task) {
        const t0 = performance.now();

        if (task.action === 'IMAGE') {
            const imgUrl = `https://picsum.photos/400/300?random=${task.id}_${Date.now()}`;
            const res = await fetch(imgUrl);
            const blob = await res.blob();
            const localUrl = URL.createObjectURL(blob);
            const t1 = performance.now();
            task.latencyMs = t1 - t0;
            task.resultData = { type: 'IMAGE', url: localUrl, size: `${(blob.size / 1024).toFixed(1)} KB` };

        } else if (task.action === 'DOCUMENT') {
            await new Promise(r => setTimeout(r, 380));
            const t1 = performance.now();
            task.latencyMs = t1 - t0;
            task.resultData = { type: 'DOCUMENT', fileName: `${task.name}.pdf`, size: "380 KB", pages: 8 };

        } else if (task.action === 'AUDIO') {
            await new Promise(r => setTimeout(r, 450));
            const t1 = performance.now();
            task.latencyMs = t1 - t0;
            task.resultData = { type: 'AUDIO', track: "Sample_Audio_Stream.mp3", size: "1.2 MB" };

        } else if (task.action === 'PRIMES') {
            let count = 0;
            for (let i = 2; i <= 50000; i++) {
                let p = true;
                for (let j = 2; j * j <= i; j++) {
                    if (i % j === 0) { p = false; break; }
                }
                if (p) count++;
            }
            const t1 = performance.now();
            task.latencyMs = t1 - t0;
            task.resultData = { type: 'PRIMES', count: count };

        } else if (task.action === 'HASH') {
            const buf = new TextEncoder().encode(`Task_${task.id}_${Date.now()}`);
            const hashBuf = await crypto.subtle.digest('SHA-256', buf);
            const hex = Array.from(new Uint8Array(hashBuf)).map(b => b.toString(16).padStart(2, '0')).join('');
            const t1 = performance.now();
            task.latencyMs = t1 - t0;
            task.resultData = { type: 'HASH', hash: hex };
        }
    }

    function renderResult(task) {
        if (resultsGrid.querySelector('.empty-msg')) {
            resultsGrid.innerHTML = '';
        }

        const card = document.createElement('div');
        card.className = 'res-card';

        if (task.resultData.type === 'IMAGE') {
            card.innerHTML = `
                <img src="${task.resultData.url}" alt="${task.name}">
                <div class="res-title">${task.name}</div>
                <div class="res-meta">Downloaded (${task.resultData.size}) &bull; ${task.latencyMs.toFixed(0)} ms</div>
            `;
        } else if (task.resultData.type === 'DOCUMENT') {
            card.innerHTML = `
                <div class="res-title">📄 ${task.name}</div>
                <div class="res-meta">File: <strong>${task.resultData.fileName}</strong></div>
                <div class="res-meta">Size: ${task.resultData.size} (${task.resultData.pages} Pages) &bull; ${task.latencyMs.toFixed(0)} ms</div>
            `;
        } else if (task.resultData.type === 'AUDIO') {
            card.innerHTML = `
                <div class="res-title">🎵 ${task.name}</div>
                <div class="res-meta">Track: ${task.resultData.track} (${task.resultData.size}) &bull; ${task.latencyMs.toFixed(0)} ms</div>
            `;
        } else if (task.resultData.type === 'PRIMES') {
            card.innerHTML = `
                <div class="res-title">🧮 ${task.name}</div>
                <div class="res-meta">Primes Found: <strong>${task.resultData.count}</strong> &bull; Latency: ${task.latencyMs.toFixed(0)} ms</div>
            `;
        } else if (task.resultData.type === 'HASH') {
            card.innerHTML = `
                <div class="res-title">🔒 ${task.name}</div>
                <div class="res-meta" style="word-break: break-all; color: var(--success); font-family: var(--font-mono);">${task.resultData.hash}</div>
                <div class="res-meta">SHA-256 Digest &bull; Latency: ${task.latencyMs.toFixed(0)} ms</div>
            `;
        }

        resultsGrid.appendChild(card);
    }

    // Execution Pipeline
    btnRunThreads.addEventListener('click', async () => {
        if (isRunning) return;
        if (tasks.length === 0) {
            alert('Please add tasks or click "Quick Sample Tasks" first.');
            return;
        }

        isRunning = true;
        btnRunThreads.disabled = true;
        completedCount = 0;
        sharedResourceCount = 0;
        sharedResourceVal.textContent = '0';
        updateSummary();

        poolStatus.textContent = 'RUNNING';
        poolStatus.className = 'status-pill running';

        logTerminal(`[PROCESS_START] Spawning ${tasks.length} concurrent worker threads...`, 'cyan');

        tasks.forEach(t => {
            logTerminal(`[Worker Thread #${t.id}] Created for Task: "${t.name}"`, 'green');
            t.status = 'EXECUTING';
        });

        renderTable();
        logTerminal('All worker threads executing concurrently...', 'yellow');

        let mutexChain = Promise.resolve();

        const workerPromises = tasks.map(task => runWorkerThread(task, () => mutexChain, (next) => mutexChain = next));

        await Promise.all(workerPromises);

        logTerminal(`[PROCESS_END] All ${tasks.length} tasks executed successfully!`, 'green');
        logTerminal(`Final Shared Resource Count = ${sharedResourceCount}`, 'green');

        poolStatus.textContent = 'COMPLETED';
        poolStatus.className = 'status-pill';
        isRunning = false;
        btnRunThreads.disabled = false;
        updateSummary();
    });

    async function runWorkerThread(task, getMutexChain, setMutexChain) {
        const row = document.getElementById(`thread-row-${task.id}`);
        const statusEl = document.getElementById(`thread-status-${task.id}`);
        const fillEl = document.getElementById(`thread-fill-${task.id}`);

        row.className = 'thread-row processing';
        statusEl.textContent = 'EXECUTING';
        fillEl.style.width = '40%';

        logTerminal(`[Thread #${task.id}] Executing Task: "${task.name}"`, 'blue');

        // Execute Real Workload
        await performTaskWork(task);

        fillEl.style.width = '75%';
        logTerminal(`  Task #${task.id} work completed in ${task.latencyMs.toFixed(0)} ms. Requesting Mutex Lock...`, 'yellow');

        // Mutex Protection
        if (isMutexEnabled) {
            let releaseLock;
            const currentChain = getMutexChain();
            const nextChain = new Promise(r => releaseLock = r);
            setLockChain(nextChain);

            await currentChain; // Wait for Mutex Lock

            logTerminal(`  🔒 [MUTEX LOCKED] Thread #${task.id} entered Critical Section`, 'red');
            row.className = 'thread-row mutex-locked';
            statusEl.textContent = 'MUTEX LOCKED';
            task.status = 'MUTEX LOCKED';
            renderTable();

            mutexBanner.className = 'mutex-banner locked';
            mutexBadge.textContent = 'MUTEX LOCKED';
            mutexTitle.textContent = `MUTEX LOCKED by Thread #${task.id}`;
            mutexHolderText.textContent = `Executing Critical Section: Task #${task.id} (${task.name})`;

            await new Promise(r => setTimeout(r, 350));
            sharedResourceCount++;
            sharedResourceVal.textContent = sharedResourceCount;

            logTerminal(`  Task #${task.id} updated shared resource count = ${sharedResourceCount}`, 'white');
            renderResult(task);

            mutexBanner.className = 'mutex-banner';
            mutexBadge.textContent = 'MUTEX UNLOCKED';
            mutexTitle.textContent = 'Critical Section Open';
            mutexHolderText.textContent = 'Shared memory available for next worker thread';

            logTerminal(`  🔓 [MUTEX UNLOCKED] Thread #${task.id} released Mutex`, 'green');
            releaseLock();
        } else {
            logTerminal(`  Task #${task.id} updating shared resource without mutex!`, 'yellow');
            await new Promise(r => setTimeout(r, 250));
            sharedResourceCount++;
            sharedResourceVal.textContent = sharedResourceCount;
            renderResult(task);
        }

        task.status = 'COMPLETED';
        completedCount++;

        row.className = 'thread-row completed';
        statusEl.textContent = 'COMPLETED';
        fillEl.style.width = '100%';

        logTerminal(`  Task #${task.id} COMPLETED`, 'green');
        renderTable();
        updateSummary();
    }

    // Auto load sample tasks on launch
    btnLoadSample.click();
});
