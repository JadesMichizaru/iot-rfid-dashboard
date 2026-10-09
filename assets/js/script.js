        // --- 1. Navigation & View Switching ---
        function switchPage(pageId) {
            // Hide all pages
            document.querySelectorAll('.page-section').forEach(section => {
                section.classList.add('hidden');
            });
            // Show target page
            document.getElementById(`page-${pageId}`).classList.remove('hidden');

            // Update sidebar active state
            document.querySelectorAll('.nav-item').forEach(item => {
                item.classList.remove('bg-primary', 'text-white');
                item.classList.add('text-slate-300', 'hover:bg-slate-800', 'hover:text-white');
                if(item.dataset.page === pageId) {
                    item.classList.remove('text-slate-300', 'hover:bg-slate-800', 'hover:text-white');
                    item.classList.add('bg-primary', 'text-white');
                }
            });

            // Close mobile sidebar if open
            if(window.innerWidth < 1024) {
                toggleMobileSidebar();
            }
        }

        function toggleMobileSidebar() {
            const sidebar = document.getElementById('sidebar');
            const overlay = document.getElementById('mobile-overlay');
            sidebar.classList.toggle('-translate-x-full');
            overlay.classList.toggle('hidden');
        }

        function toggleModal(modalId) {
            const modal = document.getElementById(modalId);
            modal.classList.toggle('hidden');
        }

        // --- 2. Real-time GMT Clock ---
        function updateClock() {
            const now = new Date();
            const pad = (n) => n.toString().padStart(2, '0');
            const gmtString = `${now.getUTCFullYear()}-${pad(now.getUTCMonth()+1)}-${pad(now.getUTCDate())} ${pad(now.getUTCHours())}:${pad(now.getUTCMinutes())}:${pad(now.getUTCSeconds())} GMT`;
            document.getElementById('gmt-clock').textContent = gmtString;
        }
        setInterval(updateClock, 1000);
        updateClock();

        // --- 3. Chart.js Initialization ---
        document.addEventListener('DOMContentLoaded', () => {
            // Weekly Trend Chart
            const ctxTrend = document.getElementById('weeklyTrendChart').getContext('2d');
            new Chart(ctxTrend, {
                type: 'line',
                data: {
                    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                    datasets: [{
                        label: 'Present',
                        data: [1150, 1180, 1120, 1190, 1102, 400, 150],
                        borderColor: '#3b82f6',
                        backgroundColor: 'rgba(59, 130, 246, 0.1)',
                        tension: 0.4,
                        fill: true
                    }, {
                        label: 'Late',
                        data: [30, 25, 40, 20, 45, 10, 5],
                        borderColor: '#f59e0b',
                        backgroundColor: 'rgba(245, 158, 11, 0.1)',
                        tension: 0.4,
                        fill: true
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { position: 'bottom' } },
                    scales: { y: { beginAtZero: true, grid: { color: '#f1f5f9' } }, x: { grid: { display: false } } }
                }
            });

            // Today's Breakdown Chart
            const ctxBreakdown = document.getElementById('todayBreakdownChart').getContext('2d');
            new Chart(ctxBreakdown, {
                type: 'doughnut',
                data: {
                    labels: ['Hadir', 'Terlambat', 'Tidak Hadir'],
                    datasets: [{
                        data: [1102, 45, 101],
                        backgroundColor: ['#10b981', '#f59e0b', '#ef4444'],
                        borderWidth: 0,
                        hoverOffset: 4
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { position: 'bottom' } },
                    cutout: '70%'
                }
            });

            // Seed initial log data
            seedInitialLogs();
            startSimulatedRFID();
        });

        // --- 4. Simulated Realtime RFID Tap-In ---
        const studentPool = [
            { name: "Ahmad Rizky", class: "XII RPL 1", uid: "A4:F2:11:9C" },
            { name: "Siti Aminah", class: "XII RPL 2", uid: "B1:33:AA:01" },
            { name: "Budi Santoso", class: "XI TKJ 1", uid: "C9:12:FF:88" },
            { name: "Dewi Lestari", class: "XII MM 1", uid: "D4:55:00:12" },
            { name: "Eko Prasetyo", class: "XI RPL 2", uid: "E1:99:AB:CD" }
        ];

        function getGMTTime() {
            const now = new Date();
            const pad = (n) => n.toString().padStart(2, '0');
            return `${pad(now.getUTCHours())}:${pad(now.getUTCMinutes())}:${pad(now.getUTCSeconds())} GMT`;
        }

        function createLogEntry(student, status = 'Hadir') {
            const time = getGMTTime();
            const statusColors = {
                'Hadir': 'bg-green-100 text-green-700',
                'Terlambat': 'bg-yellow-100 text-yellow-700',
                'Tidak Hadir': 'bg-red-100 text-red-700'
            };

            // Add to live feed banner
            const feedContainer = document.getElementById('live-feed-container');
            const feedItem = document.createElement('div');
            feedItem.className = 'flex-shrink-0 bg-slate-800 border border-slate-700 rounded-lg p-3 min-w-[200px] animate-pulse';
            feedItem.innerHTML = `
                <div class="flex justify-between items-start mb-1">
                    <span class="text-xs font-mono text-slate-400">${student.uid}</span>
                    <span class="text-[10px] text-slate-500">${time}</span>
                </div>
                <p class="text-sm font-bold text-white truncate">${student.name}</p>
                <p class="text-xs text-slate-400">${student.class}</p>
            `;
            feedContainer.prepend(feedItem);
            if(feedContainer.children.length > 5) feedContainer.lastElementChild.remove();
            setTimeout(() => feedItem.classList.remove('animate-pulse'), 1000);

            // Add to table
            const tbody = document.getElementById('log-table-body');
            const row = document.createElement('tr');
            row.className = 'hover:bg-slate-50 transition-colors fade-in';
            row.innerHTML = `
                <td class="px-6 py-4 font-mono text-xs text-slate-600">${time}</td>
                <td class="px-6 py-4 font-mono text-xs font-medium text-slate-800">${student.uid}</td>
                <td class="px-6 py-4 font-medium text-slate-800">${student.name}</td>
                <td class="px-6 py-4 text-slate-600">${student.class}</td>
                <td class="px-6 py-4"><span class="status-badge ${statusColors[status]} px-2 py-1 rounded-full text-xs font-semibold">${status}</span></td>
                <td class="px-6 py-4 text-right space-x-1">
                    <button onclick="updateStatus(this, 'Hadir')" class="text-xs bg-green-50 text-green-600 hover:bg-green-100 px-2 py-1 rounded border border-green-200" title="Konfirmasi Hadir">H</button>
                    <button onclick="updateStatus(this, 'Terlambat')" class="text-xs bg-yellow-50 text-yellow-600 hover:bg-yellow-100 px-2 py-1 rounded border border-yellow-200" title="Terlambat">T</button>
                    <button onclick="updateStatus(this, 'Tidak Hadir')" class="text-xs bg-red-50 text-red-600 hover:bg-red-100 px-2 py-1 rounded border border-red-200" title="Tidak Hadir">X</button>
                </td>
            `;
            tbody.prepend(row);
            if(tbody.children.length > 10) tbody.lastElementChild.remove();
        }

        function seedInitialLogs() {
            createLogEntry(studentPool[0], 'Hadir');
            createLogEntry(studentPool[2], 'Terlambat');
        }

        function startSimulatedRFID() {
            setInterval(() => {
                const randomStudent = studentPool[Math.floor(Math.random() * studentPool.length)];
                const isLate = Math.random() > 0.8;
                createLogEntry(randomStudent, isLate ? 'Terlambat' : 'Hadir');
            }, 8000); // New tap every 8 seconds
        }

        // --- 5. Table Actions & Logic ---
        function updateStatus(btn, newStatus) {
            const row = btn.closest('tr');
            const badge = row.querySelector('.status-badge');
            const statusColors = {
                'Hadir': 'bg-green-100 text-green-700',
                'Terlambat': 'bg-yellow-100 text-yellow-700',
                'Tidak Hadir': 'bg-red-100 text-red-700'
            };

            badge.className = `status-badge ${statusColors[newStatus]} px-2 py-1 rounded-full text-xs font-semibold`;
            badge.textContent = newStatus;

            // Visual feedback
            btn.classList.add('ring-2 ring-offset-1 ring-slate-400');
            setTimeout(() => btn.classList.remove('ring-2 ring-offset-1 ring-slate-400'), 300);
        }

        function filterLogs() {
            const filterValue = document.getElementById('status-filter').value.toLowerCase();
            const rows = document.querySelectorAll('#log-table-body tr');

            rows.forEach(row => {
                const status = row.querySelector('.status-badge').textContent.toLowerCase();
                if (filterValue === 'all' || status.includes(filterValue)) {
                    row.style.display = '';
                } else {
                    row.style.display = 'none';
                }
            });
        }

        function filterTable(tableId, query) {
            const filter = query.toLowerCase();
            const rows = document.querySelectorAll(`#${tableId} tbody tr`);

            rows.forEach(row => {
                const text = row.textContent.toLowerCase();
                row.style.display = text.includes(filter) ? '' : 'none';
            });
        }

        function handleGlobalSearch(query) {
            // Simple global search simulation: switches to overview and filters the log table
            if(query.length > 2) {
                switchPage('overview');
                filterTable('log-table', query);
            }
        }

        // --- 6. Export to CSV ---
        function exportToCSV(tableId, filename) {
            const table = document.getElementById(tableId);
            let csv = [];

            // Get headers
            const headers = [];
            table.querySelectorAll('thead th').forEach(th => {
                headers.push(`"${th.textContent.trim()}"`);
            });
            csv.push(headers.join(','));

            // Get rows
            table.querySelectorAll('tbody tr').forEach(tr => {
                if(tr.style.display === 'none') return; // Skip filtered rows
                const row = [];
                tr.querySelectorAll('td').forEach((td, index) => {
                    // Skip the action column (last column)
                    if(index < tr.querySelectorAll('td').length - 1) {
                        row.push(`"${td.textContent.trim()}"`);
                    }
                });
                csv.push(row.join(','));
            });

            const csvString = csv.join('\n');
            const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = filename;
            link.click();
        }

        // --- 7. Scan New Card Simulation ---
        function simulateNewCardScan() {
            const resultDiv = document.getElementById('scan-result');
            const uidSpan = document.getElementById('new-card-uid');

            resultDiv.classList.remove('hidden');
            uidSpan.textContent = "SCANNING...";

            setTimeout(() => {
                const randomHex = () => Math.floor(Math.random()*255).toString(16).padStart(2, '0').toUpperCase();
                uidSpan.textContent = `${randomHex()}:${randomHex()}:${randomHex()}:${randomHex()}`;
            }, 800);
        }
