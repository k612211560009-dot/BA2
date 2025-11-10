// Data
const equipmentAreas = [
  {
    id: "assembly",
    name: "Khu Lắp ráp",
    risk: "high",
    avgRUL: 45,
    downtime: 12,
  },
  {
    id: "packaging",
    name: "Dây chuyền Đóng gói",
    risk: "moderate",
    avgRUL: 120,
    downtime: 6,
  },
  {
    id: "compression",
    name: "Hệ thống Nén Khí",
    risk: "low",
    avgRUL: 200,
    downtime: 2,
  },
  {
    id: "lineA",
    name: "Dây chuyền A",
    risk: "critical",
    avgRUL: 24,
    downtime: 18,
  },
];

const equipmentAlerts = {
  assembly: [
    {
      id: 1,
      name: "Máy bơm P-101",
      condition: "critical",
      rul: 24,
      probability: 85,
      timestamp: "2025-11-10 08:30",
    },
    {
      id: 2,
      name: "Động cơ M-203",
      condition: "moderate",
      rul: 72,
      probability: 65,
      timestamp: "2025-11-10 09:15",
    },
  ],
  packaging: [
    {
      id: 3,
      name: "Băng tải B-501",
      condition: "moderate",
      rul: 96,
      probability: 55,
      timestamp: "2025-11-10 07:45",
    },
  ],
  compression: [
    {
      id: 4,
      name: "Máy nén C-301",
      condition: "normal",
      rul: 180,
      probability: 25,
      timestamp: "2025-11-10 06:00",
    },
  ],
  lineA: [
    {
      id: 5,
      name: "Động cơ C-05",
      condition: "critical",
      rul: 18,
      probability: 92,
      timestamp: "2025-11-10 10:00",
    },
    {
      id: 6,
      name: "Robot R-102",
      condition: "critical",
      rul: 36,
      probability: 78,
      timestamp: "2025-11-10 09:30",
    },
  ],
};

let notifications = [];
let charts = {};

// Initialize
document.addEventListener("DOMContentLoaded", function () {
  initCharts();
  renderAreaList();

  document
    .getElementById("areaSelect")
    .addEventListener("change", function (e) {
      if (e.target.value === "overview") {
        showOverview();
      } else {
        showDetail(e.target.value);
      }
    });
});

function initCharts() {
  // Risk Distribution Chart
  const riskCtx = document.getElementById("riskChart").getContext("2d");
  charts.risk = new Chart(riskCtx, {
    type: "pie",
    data: {
      labels: ["Critical", "High", "Moderate", "Low"],
      datasets: [
        {
          data: [15, 25, 35, 25],
          backgroundColor: ["#ef4444", "#f97316", "#eab308", "#22c55e"],
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: {
          position: "bottom",
        },
      },
    },
  });
}

function renderAreaList() {
  const list = document.getElementById("areaList");
  list.innerHTML = equipmentAreas
    .map(
      (area) => `
                <div class="area-item" onclick="showDetail('${area.id}')">
                    <div class="area-info">
                        <div class="risk-indicator risk-${area.risk}"></div>
                        <div>
                            <div style="font-weight: 500;">${area.name}</div>
                            <div style="font-size: 0.875rem; color: #6b7280;">RUL: ${area.avgRUL}h | DT: ${area.downtime}h</div>
                        </div>
                    </div>
                    <span style="font-size: 0.875rem; color: #6b7280; text-transform: uppercase;">${area.risk}</span>
                </div>
            `
    )
    .join("");
}

function showOverview() {
  document.getElementById("overviewScreen").classList.remove("hidden");
  document.getElementById("detailScreen").classList.add("hidden");
  document.getElementById("areaSelect").value = "overview";
}

function showDetail(areaId) {
  const area = equipmentAreas.find((a) => a.id === areaId);
  document.getElementById("overviewScreen").classList.add("hidden");
  document.getElementById("detailScreen").classList.remove("hidden");
  document.getElementById("areaSelect").value = areaId;

  // Update KPIs
  document.getElementById("detailRUL").textContent = area.avgRUL + "h";
  document.getElementById("detailDowntime").textContent = area.downtime + "h";
  document.getElementById("rulProgress").style.width =
    Math.min((area.avgRUL / 200) * 100, 100) + "%";

  // Render RUL Trend
  if (charts.rulTrend) {
    charts.rulTrend.destroy();
  }
  const rulCtx = document.getElementById("rulTrendChart").getContext("2d");
  charts.rulTrend = new Chart(rulCtx, {
    type: "line",
    data: {
      labels: ["T2", "T3", "T4", "T5", "T6", "T7", "CN"],
      datasets: [
        {
          label: "RUL Dự đoán",
          data: [150, 135, 118, 95, 72, 58, 45],
          borderColor: "#3b82f6",
          backgroundColor: "rgba(59, 130, 246, 0.1)",
          tension: 0.4,
        },
        {
          label: "Ngưỡng Bảo trì",
          data: [100, 100, 100, 100, 100, 100, 100],
          borderColor: "#ef4444",
          borderDash: [5, 5],
          tension: 0,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: {
          position: "bottom",
        },
      },
    },
  });

  // Render Alerts
  renderAlerts(areaId);
}

function renderAlerts(areaId) {
  const alerts = equipmentAlerts[areaId] || [];
  const list = document.getElementById("alertList");

  list.innerHTML = alerts
    .map(
      (alert) => `
                <div class="alert-item ${alert.condition}">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 0.75rem;">
                        <div>
                            <div class="alert-equipment">${alert.name}</div>
                            <span class="alert-badge">${alert.condition.toUpperCase()}</span>
                        </div>
                        <div style="font-size: 0.875rem; text-align: right;">${
                          alert.timestamp
                        }</div>
                    </div>
                    
                    <div class="alert-metrics">
                        <div class="metric-box">
                            <div class="metric-label">RUL Dự đoán</div>
                            <div class="metric-value">${alert.rul}h</div>
                        </div>
                        <div class="metric-box">
                            <div class="metric-label">Xác suất Lỗi</div>
                            <div class="metric-value">${
                              alert.probability
                            }%</div>
                        </div>
                    </div>
                    
                    <div class="notification-buttons">
                        <button class="btn btn-scada" onclick="sendNotification('scada', ${
                          alert.id
                        }, '${alert.name}')">
                            📤 SCADA/Vận hành
                        </button>
                        <button class="btn btn-mes" onclick="sendNotification('mes', ${
                          alert.id
                        }, '${alert.name}')">
                            📤 MES/Bảo trì
                        </button>
                        <button class="btn btn-erp" onclick="sendNotification('erp', ${
                          alert.id
                        }, '${alert.name}')">
                            📤 ERP/Kế hoạch
                        </button>
                    </div>
                    
                    <div class="status-messages" id="status-${alert.id}"></div>
                </div>
            `
    )
    .join("");
}

function sendNotification(type, alertId, equipmentName) {
  const timestamp = new Date().toLocaleTimeString("vi-VN");
  let message = "";
  let systemId = "";

  switch (type) {
    case "scada":
      message = `Cảnh báo SCADA - ${equipmentName}: Yêu cầu kiểm tra ngay`;
      systemId = `SCADA-${Date.now()}`;
      break;
    case "mes":
      message = `Lệnh Bảo trì tạo cho ${equipmentName}`;
      systemId = `WO-2025-${String(Date.now()).slice(-3)}`;
      break;
    case "erp":
      message = `Cập nhật ERP - Downtime dự kiến: ${equipmentName}`;
      systemId = `ERP-${Date.now()}`;
      break;
  }

  // Simulate sending
  setTimeout(() => {
    const statusDiv = document.getElementById(`status-${alertId}`);
    const statusMsg = document.createElement("div");
    statusMsg.className = "status-message";
    statusMsg.innerHTML = `
                    ✅ <div>
                        <strong>${type.toUpperCase()}:</strong> ${message}<br>
                        <span style="opacity: 0.8;">ID: ${systemId} | ${timestamp}</span>
                    </div>
                `;
    statusDiv.appendChild(statusMsg);

    // Add to notification panel
    notifications.unshift({
      message,
      systemId,
      timestamp,
    });
    updateNotificationPanel();
  }, 500);
}

function updateNotificationPanel() {
  const panel = document.getElementById("notificationPanel");
  const list = document.getElementById("notificationList");

  list.innerHTML = notifications
    .slice(0, 10)
    .map(
      (notif) => `
                <div class="notification-item">
                    <div style="font-weight: 500; margin-bottom: 0.25rem;">${notif.message}</div>
                    <div style="opacity: 0.8;">ID: ${notif.systemId}</div>
                    <div style="opacity: 0.7; margin-top: 0.25rem;">${notif.timestamp}</div>
                </div>
            `
    )
    .join("");

  if (notifications.length > 0) {
    panel.classList.add("active");
  }
}
