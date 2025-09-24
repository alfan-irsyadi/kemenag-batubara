import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default markers in Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const MapComponent = ({ locations }) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);

  useEffect(() => {
    if (!locations || locations.length === 0) return;

    // Initialize map
    if (!mapInstanceRef.current) {
      mapInstanceRef.current = L.map(mapRef.current).setView([3.171246705, 99.42034917], 12);
      
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      }).addTo(mapInstanceRef.current);
    }

    // Clear existing markers
    mapInstanceRef.current.eachLayer((layer) => {
      if (layer instanceof L.Marker) {
        mapInstanceRef.current.removeLayer(layer);
      }
    });

    // Add markers for each location
    locations.forEach(location => {
      const lat = parseFloat(location.LATITUDE);
      const lng = parseFloat(location.LONGITUDE);
      
      if (!isNaN(lat) && !isNaN(lng)) {
        L.marker([lat, lng])
          .addTo(mapInstanceRef.current)
          .bindPopup(`
            <div class="p-2">
              <strong>${location['SATUAN KERJA']}</strong><br/>
              <small>Lat: ${lat}, Lng: ${lng}</small>
            </div>
          `);
      }
    });

    // Fit map to show all markers
    if (locations.length > 0) {
      const group = new L.featureGroup(
        locations
          .filter(loc => !isNaN(parseFloat(loc.LATITUDE)) && !isNaN(parseFloat(loc.LONGITUDE)))
          .map(loc => L.marker([parseFloat(loc.LATITUDE), parseFloat(loc.LONGITUDE)]))
      );
      mapInstanceRef.current.fitBounds(group.getBounds().pad(0.1));
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [locations]);

  return <div ref={mapRef} className="h-64 md:h-80 w-full rounded-lg" />;
};

export default MapComponent;