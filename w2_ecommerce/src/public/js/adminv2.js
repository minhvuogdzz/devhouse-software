document.addEventListener('DOMContentLoaded', () => {
    // Donut Chart
    const donutChart = new Chart(document.getElementById('donutChart'), {
        type: 'doughnut',
        data: {
            labels: ['In-Store Sales', 'Other'],
            datasets: [{
                data: [30, 70],
                backgroundColor: ['#007bff', '#6f42c1'],
                borderWidth: 0
            }]
        },
        options: {
            cutout: '70%',
            plugins: {
                legend: {
                    display: false
                }
            }
        }
    });

    // Area Chart
    const areaChart = new Chart(document.getElementById('areaChart'), {
        type: 'line',
        data: {
            labels: window.mostRecentlyMonth?.label || [], // Sử dụng window để truy cập biến toàn cục hoặc fallback về mảng rỗng
            datasets: [{
                label: 'Users',
                data: window.mostRecentlyMonth?.users || [],
                fill: true,
                backgroundColor: 'rgba(111, 66, 193, 0.2)',
                borderColor: '#6f42c1',
                tension: 0.4
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true
                }
            },
            plugins: {
                legend: {
                    display: true // Hiển thị legend cho rõ ràng
                }
            }
        }
    });

    // Bar Chart
    const barChart = new Chart(document.getElementById('barChart'), {
        type: 'bar',
        data: {
            labels: window.mostRecentlyMonth?.label || [],
            datasets: [{
                label: 'Orders',
                data: window.mostRecentlyMonth?.orders || [],
                backgroundColor: '#007bff'
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true
                }
            },
            plugins: {
                legend: {
                    display: true
                }
            }
        }
    });

    // Line Chart
    const lineChart = new Chart(document.getElementById('lineChart'), {
        type: 'line',
        data: {
            labels: window.mostRecentlyMonth?.label || [],
            datasets: [{
                label: 'Revenue',
                data: window.mostRecentlyMonth?.revenue || [],
                fill: true,
                backgroundColor: 'rgba(7, 46, 240, 0.2)', // Sửa lại để đồng bộ với borderColor
                borderColor: '#6f42c1',
                tension: 0.4
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true
                }
            },
            plugins: {
                legend: {
                    display: true
                }
            }
        }
    });
});