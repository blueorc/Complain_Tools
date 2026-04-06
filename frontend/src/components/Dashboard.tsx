import React, { useMemo } from 'react';
import ReactECharts from 'echarts-for-react';

interface KPIDashboardProps {
  kpiData: any[]; // List of row dictionaries
}

const excludedCols = ['Start Time', 'Period(min)', 'NE Name', 'eNodeB Function Name', 'Local Cell ID', 'Cell Name', 'eNodeB ID', 'Cell FDD TDD indication'];

const KPIDashboard: React.FC<KPIDashboardProps> = ({ kpiData }) => {
  const chartConfigs = useMemo(() => {
    if (!kpiData || kpiData.length === 0) return [];
    
    // Group data by Cell Name (we'll just plot simple series for each chart initially)
    const times = [...new Set(kpiData.map(d => d['Start Time']))].sort();
    
    // Auto-detect KPI columns (any numerical column not in excluded)
    const sample = kpiData[0];
    const kpiNames = Object.keys(sample).filter(k => !excludedCols.includes(k) && typeof sample[k] !== 'string');
    
    return kpiNames.map(kpi => {
      // Create a series per Cell Name for this KPI
      const cells = [...new Set(kpiData.map(d => d['Cell Name']))];
      const series = cells.map(cell => {
        const cellData = times.map(t => {
          const row = kpiData.find(d => d['Start Time'] === t && d['Cell Name'] === cell);
          return row ? Number(row[kpi]) || 0 : 0;
        });
        
        return {
          name: cell,
          type: 'line',
          smooth: true,
          showSymbol: false,
          areaStyle: {
            opacity: 0.1
          },
          data: cellData
        };
      });

      return {
        title: kpi,
        option: {
          tooltip: { trigger: 'axis', backgroundColor: '#1e293b', borderColor: '#334155', textStyle: { color: '#f8fafc' } },
          grid: { top: 30, right: 10, bottom: 20, left: 40 },
          xAxis: { type: 'category', data: times.map(t => String(t).split(' ')[1] || t), axisLine: { lineStyle: { color: '#475569' } } },
          yAxis: { type: 'value', splitLine: { lineStyle: { color: '#1e293b' } } },
          series: series,
          color: ['#8b5cf6', '#3b82f6', '#10b981', '#f43f5e'] // Dynamic palette
        }
      };
    });
  }, [kpiData]);

  if (!kpiData || kpiData.length === 0) {
    return (
      <div className="w-full h-64 flex items-center justify-center glass-panel rounded-2xl rounded-tr-none px-6 text-slate-400">
        Upload data to see KPI charts.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-4 glass-panel rounded-2xl border border-white/10 mt-4 overflow-y-auto max-h-[800px]">
      {chartConfigs.map((cfg, idx) => (
        <div key={idx} className="glass-panel-hover p-4 rounded-xl border border-white/5 bg-slate-900/50">
          <h4 className="text-sm font-semibold text-slate-300 mb-2 truncate">{cfg.title}</h4>
          <ReactECharts option={cfg.option} style={{ height: '200px', width: '100%' }} theme="dark" opts={{ renderer: 'svg' }} />
        </div>
      ))}
    </div>
  );
};

export default KPIDashboard;
