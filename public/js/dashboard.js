// js/dashboard.js

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

  // Handle case with no history data
  if (!history || history.length === 0) {
      chartElement.innerHTML = '<p class="text-center muted" style="padding-top: 50px;">No GPA history data to display chart.</p>';
      return; // Stop execution if no data
  }

  // Prepare data with HTML tooltips
  const chartDataArray = [['Term', 'GPAX', { role: 'tooltip', type: 'string', p: { html: true } }, 'Term GPA', { role: 'tooltip', type: 'string', p: { html: true } }]];
  history.forEach(item => {
      const gpaxTooltip = `<div style="padding:5px;"><b>${item.term}</b><br>GPAX: <b>${item.gpax.toFixed(2)}</b></div>`;
      const gpaTooltip = `<div style="padding:5px;"><b>${item.term}</b><br>Term GPA: <b>${item.term_gpa.toFixed(2)}</b></div>`;
      chartDataArray.push([
          item.term,
          item.gpax,
          gpaxTooltip,
          item.term_gpa,
          gpaTooltip
      ]);
  });

  const data = google.visualization.arrayToDataTable(chartDataArray);

  // Chart Options - Replaced CSS Variables with Hex Codes
  const options = {
    legend: { position: 'bottom', textStyle: { color: '#6a7fb7', fontSize: 12 } }, // --text-secondary
    curveType: 'function',
    chartArea: { left: 50, top: 20, width: '80%', height: '65%' }, // Adjusted width slightly
    colors: ['#1557d5', '#7ba8ff'], // <-- --primary-color, --primary-light
    lineWidth: 3,
    backgroundColor: 'transparent',
    hAxis: {
      textStyle: { color: '#6a7fb7', fontSize: 11 }, // --text-secondary
      titleTextStyle: { color: '#6a7fb7'}, // --text-secondary
      gridlines: { color: 'transparent' }
    },
    vAxis: {
      minValue: 0,
      maxValue: 4,
      ticks: [0, 1, 2, 3, 4],
      textStyle: { color: '#6a7fb7', fontSize: 11 }, // --text-secondary
      titleTextStyle: { color: '#6a7fb7'}, // --text-secondary
      gridlines: { color: '#eef2ff', count: 5 }, // --border-color
      minorGridlines: { count: 0 },
      viewWindow: { min: 0, max: 4.1 },
      baselineColor: '#cfe0ff' // --border-color-alt
    },
    tooltip: { isHtml: true, trigger: 'focus' },
    pointSize: 5,
    series: {
        0: { pointShape: 'circle' },
        1: { pointShape: 'square' }
    },
    // Removed explorer options for simplicity, add back if needed
    // explorer: { actions: ['dragToZoom', 'rightClickToReset'], axis: 'horizontal', keepInBounds: true, maxZoomIn: 4.0 }
  };

  // Draw the chart
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
     // Redirect or show a more prominent error
     alert("Error loading user data. Please log in again.");
     localStorage.clear();
     window.location.href = 'index.html';
    return;
  }

  const history = userData.academic_history || []; // Ensure history is an array
  const trackId = userData.info.track_id;

  const trackName = (trackId && trackId !== "N/A" && window.TRACKS_INFO && window.TRACKS_INFO[trackId])
                    ? window.TRACKS_INFO[trackId].full_name
                    : '(No Track Selected)';

  document.getElementById('student-badge').textContent =
    `${userData.info.name || 'N/A'} • ${userData.info.id || 'N/A'}`;
  document.getElementById('student-track').textContent = `Track: ${trackName}`;

  const latest = history.length ? history[history.length - 1] : { gpax: 0, term_gpa: 0 };
  document.getElementById('gpax-value').textContent = latest.gpax.toFixed(2);
  document.getElementById('gpa-value').textContent = latest.term_gpa.toFixed(2);

  const gradeListElement = document.getElementById('grade-history-list');
  if (history.length > 0) {
      gradeListElement.innerHTML = history
          .slice()
          .reverse()
          .map(item => `<div><span>${item.term}</span><b>${item.term_gpa.toFixed(2)}</b></div>`)
          .join('');
  } else {
      gradeListElement.innerHTML = '<p class="text-center muted" style="padding: 10px;">No history data.</p>'; // Adjusted padding
  }

  // Draw or redraw the chart - Called here ensures data is ready
  drawGpaChart(history);
}

function initializeDashboard() {
  const userData = getCurrentUserData(); // Get user data (already guarded by HTML script)

  // Add extra safety check for userData itself
  if (!userData) {
      console.error("Failed to get user data.");
       alert("Could not load user data. Please try logging in again.");
       localStorage.clear();
       window.location.href = 'index.html';
      return;
  }

   // Ensure academic_history exists (Defensive)
   if (!userData.academic_history) {
      userData.academic_history = [];
   }
   // Add checks for other essential properties if needed

  updateDashboardInfo(userData);
}

// Redraw chart on window resize (Debounced)
let resizeTimer;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
        // Re-fetch data or use existing if state management isn't complex
        const userData = getCurrentUserData();
        if (userData && userData.academic_history) {
            // Re-drawing requires the history data
            drawGpaChart(userData.academic_history);
        }
    }, 250);
});