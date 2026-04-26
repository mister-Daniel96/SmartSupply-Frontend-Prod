/*  // ✅ DATOS DEL GRÁFICO
  lineData: ChartConfiguration<'line'>['data'] = {
    labels: ['01 Mar', '02 Mar', '03 Mar', '04 Mar', '05 Mar', '06 Mar'],
    datasets: [
      {
        label: 'Predicción',
        data: [20, 45, 30, 50, 40, 90],
        tension: 0.35,
        borderColor: '#1D4ED8',
        backgroundColor: 'rgba(29, 78, 216, 0.15)',
        pointBackgroundColor: '#1D4ED8',
        pointBorderColor: '#ffffff',
        pointRadius: 4,
        pointHoverRadius: 6,
        fill: true,
      },
    ],
  };

  // ✅ OPCIONES DEL GRÁFICO
  lineOptions: ChartConfiguration<'line'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    devicePixelRatio: Math.min(window.devicePixelRatio * 1.5, 3),
    plugins: {
      legend: { display: false },
    },
    scales: {
      x: {
        border: { display: false },
        grid: {
          color: 'rgba(0,0,0,0.2)',
          drawOnChartArea: true,
          drawTicks: true,
        },
        ticks: {
          color: '#4b5563',
          font: {
            size: 12,
            weight: 100, // número ✅
          },
        },
      },
      y: {
        min: 0,
        max: 90,
        border: { display: false },
        grid: {
          color: 'rgba(0,0,0,0.2)',
          drawOnChartArea: true,
          drawTicks: true,
        },
        ticks: {
          color: '#6b7280',
          stepSize: 10,
          font: {
            size: 11,
            weight: 500,
          },
        },
      },
    },
  }; */