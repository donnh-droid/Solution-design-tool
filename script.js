document.addEventListener('DOMContentLoaded', () => {
    // Initialize Chart
    const ctx = document.getElementById('opsTrendChart').getContext('2d');
    
    // Gradient for the chart
    const blueGradient = ctx.createLinearGradient(0, 0, 0, 400);
    blueGradient.addColorStop(0, 'rgba(88, 166, 255, 0.4)');
    blueGradient.addColorStop(1, 'rgba(88, 166, 255, 0)');

    const emeraldGradient = ctx.createLinearGradient(0, 0, 0, 400);
    emeraldGradient.addColorStop(0, 'rgba(63, 185, 80, 0.4)');
    emeraldGradient.addColorStop(1, 'rgba(63, 185, 80, 0)');

    const opsTrendChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'CN'],
            datasets: [
                {
                    label: 'GTC (%)',
                    data: [92.5, 93.1, 94.2, 93.8, 94.5, 95.2, 94.5],
                    borderColor: '#3fb950',
                    backgroundColor: emeraldGradient,
                    fill: true,
                    tension: 0.4,
                    borderWidth: 3,
                    pointRadius: 4,
                    pointBackgroundColor: '#3fb950'
                },
                {
                    label: 'Giao ngày đầu (%)',
                    data: [80.2, 81.5, 82.3, 80.8, 82.1, 83.5, 82.3],
                    borderColor: '#58a6ff',
                    backgroundColor: blueGradient,
                    fill: true,
                    tension: 0.4,
                    borderWidth: 3,
                    pointRadius: 4,
                    pointBackgroundColor: '#58a6ff'
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                    labels: {
                        color: '#8b949e',
                        font: {
                            family: 'Inter',
                            size: 12
                        },
                        usePointStyle: true,
                        padding: 20
                    }
                },
                tooltip: {
                    backgroundColor: '#161b22',
                    titleColor: '#f0f6fc',
                    bodyColor: '#8b949e',
                    borderColor: 'rgba(255, 255, 255, 0.1)',
                    borderWidth: 1,
                    padding: 12,
                    displayColors: true,
                    callbacks: {
                        label: function(context) {
                            return ` ${context.dataset.label}: ${context.parsed.y}%`;
                        }
                    }
                }
            },
            scales: {
                y: {
                    grid: {
                        color: 'rgba(255, 255, 255, 0.05)',
                        drawBorder: false
                    },
                    ticks: {
                        color: '#8b949e',
                        callback: function(value) {
                            return value + '%';
                        }
                    },
                    min: 75,
                    max: 100
                },
                x: {
                    grid: {
                        display: false
                    },
                    ticks: {
                        color: '#8b949e'
                    }
                }
            },
            interaction: {
                intersect: false,
                mode: 'index'
            }
        }
    });

    // Sidebar Navigation Interactivity
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            navItems.forEach(i => i.classList.remove('active'));
            item.classList.add('active');
        });
    });

    // Filter Buttons Interactivity
    const filterBtns = document.querySelectorAll('.filter-btn');
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            // Randomize data to simulate filter change
            opsTrendChart.data.datasets.forEach(dataset => {
                dataset.data = dataset.data.map(val => val + (Math.random() * 2 - 1));
            });
            opsTrendChart.update();
        });
    });

    // --- Persistence & State Management ---
    let savedTasks;
    try {
        savedTasks = JSON.parse(localStorage.getItem('ops-tasks'));
        if (!Array.isArray(savedTasks) || savedTasks.length !== 4) {
            savedTasks = [false, false, false, false];
        }
    } catch (e) {
        savedTasks = [false, false, false, false];
    }

    const state = {
        backlog: parseInt(localStorage.getItem('ops-backlog'), 10) || 1248,
        gtc: parseFloat(localStorage.getItem('ops-gtc')) || 94.5,
        firstDay: parseFloat(localStorage.getItem('ops-first-day')) || 82.3,
        tasks: savedTasks
    };

    function updateUI() {
        document.querySelector('#card-backlog .kpi-value').innerText = state.backlog;
        document.querySelector('#card-gtc .kpi-value').innerText = state.gtc + '%';
        document.querySelector('#card-first-day .kpi-value').innerText = state.firstDay + '%';
        
        state.tasks.forEach((done, index) => {
            const cb = document.getElementById(`task-${index + 1}`);
            if (cb) cb.checked = done;
        });
    }

    // Handle Form Submit
    const kpiForm = document.getElementById('kpi-form');
    kpiForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const newBacklog = document.getElementById('input-backlog').value;
        const newGtc = document.getElementById('input-gtc').value;
        const newFirstDay = document.getElementById('input-first-day').value;

        if (newBacklog) {
            state.backlog = newBacklog;
            localStorage.setItem('ops-backlog', newBacklog);
        }
        if (newGtc) {
            state.gtc = newGtc;
            localStorage.setItem('ops-gtc', newGtc);
            // Update chart with new GTC point
            opsTrendChart.data.datasets[0].data[6] = parseFloat(newGtc);
            opsTrendChart.update();
        }
        if (newFirstDay) {
            state.firstDay = newFirstDay;
            localStorage.setItem('ops-first-day', newFirstDay);
            opsTrendChart.data.datasets[1].data[6] = parseFloat(newFirstDay);
            opsTrendChart.update();
        }

        updateUI();
        kpiForm.reset();
        showNotification('Đã cập nhật dữ liệu thành công!');
    });

    // Handle Task Checklist
    for (let i = 1; i <= 4; i++) {
        const cb = document.getElementById(`task-${i}`);
        cb.addEventListener('change', () => {
            state.tasks[i-1] = cb.checked;
            localStorage.setItem('ops-tasks', JSON.stringify(state.tasks));
        });
    }

    function showNotification(msg) {
        const toast = document.createElement('div');
        toast.style.position = 'fixed';
        toast.style.bottom = '20px';
        toast.style.right = '20px';
        toast.style.background = 'var(--accent-emerald)';
        toast.style.color = 'white';
        toast.style.padding = '12px 24px';
        toast.style.borderRadius = '12px';
        toast.style.zIndex = '1000';
        toast.style.boxShadow = 'var(--shadow-premium)';
        toast.innerText = msg;
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 3000);
    }

    // Initialize UI
    updateUI();
});

function animateValue(obj, start, end, duration, suffix) {
    let startTimestamp = null;
    const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        const value = progress * (end - start) + start;
        
        if (suffix === '%') {
            obj.textContent = value.toFixed(1) + suffix;
        } else {
            obj.textContent = Math.floor(value).toLocaleString();
        }
        
        if (progress < 1) {
            window.requestAnimationFrame(step);
        }
    };
    window.requestAnimationFrame(step);
}
