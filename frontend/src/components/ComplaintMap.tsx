import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, CircleMarker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix leaflet default icon issue in React
// @ts-ignore
import icon from 'leaflet/dist/images/marker-icon.png';
// @ts-ignore
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

const ComplaintMap = () => {
  const [hotspots, setHotspots] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchHotspots = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('http://localhost:8000/api/v1/analytics/hotspots', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setHotspots(data.all_clusters || []);
        }
      } catch (err) {
        console.error("Failed to fetch hotspots", err);
      } finally {
        setLoading(false);
      }
    };
    fetchHotspots();
  }, []);

  const getMarkerColor = (severity: string) => {
    switch(severity) {
      case 'critical': return '#ef4444'; // red
      case 'high': return '#f97316'; // orange
      case 'normal': return '#3b82f6'; // blue
      default: return '#eab308';
    }
  };

  const center: [number, number] = [21.25, 81.62]; // Chhattisgarh (default)

  return (
    <div className="h-[500px] w-full rounded-2xl overflow-hidden shadow-lg border border-borderLight relative">
      {loading && (
        <div className="absolute inset-0 bg-background/50 z-[1000] flex items-center justify-center">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
        </div>
      )}
      <MapContainer center={center} zoom={13} scrollWheelZoom={true} className="h-full w-full z-10">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {hotspots.map(cluster => {
          // If it's a critical hotspot, make it pulse
          const isCritical = cluster.severity === 'critical';
          const radius = isCritical ? 20 : (cluster.severity === 'high' ? 14 : 8);
          
          return (
            <CircleMarker
              key={cluster.id}
              center={[cluster.center_lat, cluster.center_lon]}
              radius={radius}
              pathOptions={{ 
                color: getMarkerColor(cluster.severity),
                fillColor: getMarkerColor(cluster.severity),
                fillOpacity: isCritical ? 0.6 : 0.4,
                className: isCritical ? 'animate-pulse' : ''
              }}
            >
              <Popup>
                <div className="font-sans min-w-[200px]">
                  <h3 className="font-bold text-gray-800 border-b pb-2 mb-2 flex items-center gap-2">
                    {isCritical && <span className="text-xl">🚨</span>}
                    {isCritical ? 'CRITICAL HOTSPOT' : 'Complaint Area'}
                  </h3>
                  <div className="space-y-1">
                    <p className="text-sm text-gray-700"><strong>Department:</strong> {cluster.department}</p>
                    <p className="text-sm text-gray-700"><strong>Active Complaints:</strong> {cluster.count}</p>
                    <p className="text-xs text-danger font-medium mt-2">
                      {isCritical && "Auto-detected by AI: Pipeline Burst / Major Outage Suspected."}
                    </p>
                  </div>
                </div>
              </Popup>
            </CircleMarker>
          );
        })}
      </MapContainer>
    </div>
  );
};

export default ComplaintMap;
