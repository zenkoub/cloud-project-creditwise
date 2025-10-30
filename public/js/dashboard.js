// public/js/dashboard.js

google.charts.load('current', { packages: ['corechart'] });
google.charts.setOnLoadCallback(initializeDashboard);

let currentChartInstance = null; // To hold the chart instance for redraw

function drawGpaChart(history) {
  if (typeof google === 'undefined' || !google.visualization || !google.visualization.arrayToDataTable) {
    console.error("Google Charts library not loaded.");
    return;
  }

  const chartElement = document.getElementById('curve_chart');
  if (!chartElement) {
    console.error("Chart container element not found.");
    return;
  }

  // Clear previous content (like 'Loading chart...')
  chartElement.innerHTML = '';

  if (!history || history.length === 0) {
      chartElement.innerHTML = '<p class="text-center muted" style="padding-top: 50px;">No GPA history data to display chart.</p>';
      return;
  }

  // Prepare data with HTML tooltips
  const chartDataArray = [['Term', 'GPAX', { role: 'tooltip', type: 'string', p: { html: true } }, 'Term GPA', { role: 'tooltip', type: 'string', p: { html: true } }]];
  history.forEach(item => {
      // ต้องมั่นใจว่า gpax และ term_gpa เป็นตัวเลข
      const gpaxValue = parseFloat(item.gpax) || 0;
      const termGpaValue = parseFloat(item.term_gpa) || 0;

      const gpaxTooltip = `<div style="padding:5px;"><b>${item.term}</b><br>GPAX: <b>${gpaxValue.toFixed(2)}</b></div>`;
      const gpaTooltip = `<div style="padding:5px;"><b>${item.term}</b><br>Term GPA: <b>${termGpaValue.toFixed(2)}</b></div>`;
      chartDataArray.push([
          item.term,
          gpaxValue,
          gpaxTooltip,
          termGpaValue,
          gpaTooltip
      ]);
  });

  const data = google.visualization.arrayToDataTable(chartDataArray);

  const options = {
    legend: { position: 'bottom', textStyle: { color: '#6a7fb7', fontSize: 12 } },
    curveType: 'function',
    chartArea: { left: 50, top: 20, width: '80%', height: '65%' },
    colors: ['#1557d5', '#7ba8ff'],
    lineWidth: 3,
    backgroundColor: 'transparent',
    hAxis: {
      textStyle: { color: '#6a7fb7', fontSize: 11 },
      titleTextStyle: { color: '#6a7fb7'},
      gridlines: { color: 'transparent' }
    },
    vAxis: {
      minValue: 0,
      maxValue: 4,
      ticks: [0, 1, 2, 3, 4],
      textStyle: { color: '#6a7fb7', fontSize: 11 },
      titleTextStyle: { color: '#6a7fb7'},
      gridlines: { color: '#eef2ff', count: 5 },
      minorGridlines: { count: 0 },
      viewWindow: { min: 0, max: 4.1 },
      baselineColor: '#cfe0ff'
    },
    tooltip: { isHtml: true, trigger: 'focus' },
    pointSize: 5,
    series: {
        0: { pointShape: 'circle' },
        1: { pointShape: 'square' }
    }
  };

  if (!currentChartInstance) {
      currentChartInstance = new google.visualization.LineChart(chartElement);
  }
  currentChartInstance.draw(data, options);
}

function updateDashboardInfo(userData) {
  if (!userData || !userData.info) {
    console.error("User data is missing or incomplete.");
    document.getElementById('student-badge').textContent = 'Error';
    document.getElementById('student-track').textContent = 'Track: Error';
    return;
  }

  const history = userData.academic_history || [];
  // Prefer server-provided full track name if available
  const trackName = userData.info.track_full_name || (userData.info.track_id && userData.info.track_id !== "N/A" && window.TRACKS_INFO && window.TRACKS_INFO[userData.info.track_id]
                    ? window.TRACKS_INFO[userData.info.track_id].full_name
                    : '(No Track Selected)');

  document.getElementById('student-badge').textContent =
    `${userData.info.name || 'N/A'} • ${userData.info.username || 'N/A'}`; // ใช้ username แทน ID (ที่อาจจะเป็นเลขฐานข้อมูล)
  document.getElementById('student-track').textContent = `Track: ${trackName}`;

  const latest = history.length ? history[history.length - 1] : { gpax: 0, term_gpa: 0 };
  document.getElementById('gpax-value').textContent = (parseFloat(latest.gpax) || 0).toFixed(2);
  document.getElementById('gpa-value').textContent = (parseFloat(latest.term_gpa) || 0).toFixed(2);

  const gradeListElement = document.getElementById('grade-history-list');
  if (history.length > 0) {
      gradeListElement.innerHTML = history
          .slice()
          .reverse()
          .map(item => `<div><span>${item.term}</span><b>${(parseFloat(item.term_gpa) || 0).toFixed(2)}</b></div>`)
          .join('');
  } else {
      gradeListElement.innerHTML = '<p class="text-center muted" style="padding: 10px;">No history data.</p>';
  }

  drawGpaChart(history);
}

// *** แก้ฟังก์ชันนี้ให้เป็น async ***
async function initializeDashboard() {
  const userData = await getCurrentUserData(); // <<< เปลี่ยนเป็น await
  if (!userData) return;

  updateDashboardInfo(userData);
}

let resizeTimer;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
        const userData = window.__cachedUserData; // ใช้ข้อมูลที่ cache ไว้
        if (userData && userData.academic_history) {
            drawGpaChart(userData.academic_history);
        }
    }, 250);
});