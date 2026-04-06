import React, { useState } from 'react';
import ParticleBackground from './components/ParticleBackground';
import Uploader from './components/Uploader';
import RFMap from './components/Map';
import KPIDashboard from './components/Dashboard';
import { Activity, MapPin, Database } from 'lucide-react';

function App() {
  const [kpiData, setKpiData] = useState<any>(null);
  const [spatialData, setSpatialData] = useState<any>(null);
  const [lat, setLat] = useState<string>('-6.1751');
  const [lon, setLon] = useState<string>('106.8272');
  const [loadingSpatial, setLoadingSpatial] = useState(false);

  const handleKpiLoaded = (data: any) => {
    // Expected to hold the array of dictionary rows parsed via pandas
    if (data && data.sample_data) {
      setKpiData(data.sample_data); // Wait, we need all the rows not just sample
      // For this implementation, ideally backend returns more or frontend fetches paginated.
      // But we will just use sample_data if it's limited, or adjust backend later.
      // Actually, since 50MB is large, let's assume `data.sample_data` is used for now 
      // or we can parse it locally if we uploaded it.
    }
  };

  const handleLoadSpatial = async () => {
    if (!lat || !lon) return;
    setLoadingSpatial(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/nearest_sectors`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          lat: parseFloat(lat),
          lon: parseFloat(lon),
          num_sites: 4
        })
      });
      const data = await response.json();
      if (response.ok) {
        setSpatialData({
          sectors: data.sectors,
          lines: data.lines
        });
      } else {
        alert("Failed to load geometry: " + data.detail);
      }
    } catch (e) {
      console.error(e);
      alert("Network Error loading spatial data.");
    } finally {
      setLoadingSpatial(false);
    }
  };

  return (
    <div className="min-h-screen font-sans text-slate-100 flex flex-col items-center">
      <ParticleBackground />

      {/* Header */}
      <header className="w-full p-6 glass-panel flex justify-between items-center sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center border border-indigo-500/50">
            <Activity className="text-indigo-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-300 to-cyan-300">
              RF Diagnostics
            </h1>
            <p className="text-xs text-slate-400 tracking-wider">COMPLAINT HANDLING ENGINE</p>
          </div>
        </div>
        <div className="hidden md:flex gap-4">
          <div className="px-4 py-1.5 rounded-full glass-panel text-sm flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            System Online
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="w-full max-w-7xl p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6 z-10">
        
        {/* Left Column: Data Input & Map */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <Uploader onDataLoaded={handleKpiLoaded} />
          
          <div className="glass-panel p-6 rounded-2xl border border-white/10 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-bl-full transition-transform group-hover:scale-110" />
            <h3 className="text-lg font-semibold flex items-center gap-2 mb-4 text-cyan-300">
              <MapPin size={20} /> Locate Complaint
            </h3>
            
            <div className="flex flex-col gap-4 relative z-10">
              <div>
                <label className="text-xs text-slate-400 uppercase tracking-widest ml-1">Latitude</label>
                <input 
                  type="text" 
                  value={lat} 
                  onChange={(e) => setLat(e.target.value)}
                  className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-2 mt-1 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all text-sm"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 uppercase tracking-widest ml-1">Longitude</label>
                <input 
                  type="text" 
                  value={lon} 
                  onChange={(e) => setLon(e.target.value)}
                  className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-2 mt-1 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all text-sm"
                />
              </div>
              <button 
                onClick={handleLoadSpatial}
                disabled={loadingSpatial}
                className="w-full py-3 mt-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 active:scale-[0.98] transition-all rounded-xl font-medium shadow-[0_0_20px_rgba(6,182,212,0.3)] disabled:opacity-50"
              >
                {loadingSpatial ? "Scanning Geometry..." : "Run Spatial Diagnostic"}
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Visualization */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          <RFMap center={[parseFloat(lon), parseFloat(lat)]} spatialData={spatialData} />
          
          <div className="glass-panel p-6 rounded-2xl border border-white/10 flex-col flex relative overflow-hidden group">
             <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-bl-full transition-transform group-hover:scale-110" />
             <h3 className="text-lg font-semibold flex items-center gap-2 text-indigo-300 relative z-10">
                <Database size={20} /> Performance Metrics
             </h3>
             <KPIDashboard kpiData={kpiData} />
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
