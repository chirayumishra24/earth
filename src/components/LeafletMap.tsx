'use client';

import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  Layers,
  Compass,
  MapPin,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
  Info,
  Globe2,
} from 'lucide-react';

interface ContinentInfo {
  name: string;
  lat: number;
  lng: number;
  type: 'continent' | 'ocean';
  fact: string;
}

const GEOGRAPHY_POINTS: ContinentInfo[] = [
  // Continents
  { name: 'Asia', lat: 34.0479, lng: 100.6197, type: 'continent', fact: 'Largest continent by both area & population. Home to Mt. Everest (8,848m).' },
  { name: 'Africa', lat: 1.6508, lng: 17.3358, type: 'continent', fact: 'Second largest continent. Crossed by Equator, Tropic of Cancer, and Tropic of Capricorn.' },
  { name: 'North America', lat: 45.5231, lng: -100.6711, type: 'continent', fact: 'Third largest continent, entirely in Northern and Western Hemispheres.' },
  { name: 'South America', lat: -14.6048, lng: -57.6562, type: 'continent', fact: 'Home to the Amazon Rainforest and the Andes mountain range.' },
  { name: 'Europe', lat: 50.526, lng: 15.2551, type: 'continent', fact: 'Separated from Asia by the Ural Mountains. Contains 50 countries.' },
  { name: 'Australia', lat: -25.2744, lng: 133.7751, type: 'continent', fact: 'Smallest continent & largest island, entirely in Southern Hemisphere.' },
  { name: 'Antarctica', lat: -80.8688, lng: 0.2093, type: 'continent', fact: 'Coldest, driest, and windiest continent. Covered by thick ice sheet.' },

  // Oceans
  { name: 'Pacific Ocean', lat: 0, lng: -160, type: 'ocean', fact: 'Largest and deepest ocean. Contains the Mariana Trench (11,034m).' },
  { name: 'Atlantic Ocean', lat: 10, lng: -30, type: 'ocean', fact: 'Second largest ocean. S-shaped, connecting polar regions.' },
  { name: 'Indian Ocean', lat: -15, lng: 75, type: 'ocean', fact: 'Third largest ocean. Only ocean named after a country (India).' },
  { name: 'Southern Ocean', lat: -65, lng: 0, type: 'ocean', fact: 'Encircles Antarctica. Formed where southern Pacific, Atlantic, and Indian waters meet.' },
  { name: 'Arctic Ocean', lat: 80, lng: 0, type: 'ocean', fact: 'Smallest and shallowest ocean, located around the North Pole.' },
];

export default function LeafletMap() {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const linesGroupRef = useRef<L.LayerGroup | null>(null);
  const markersGroupRef = useRef<L.LayerGroup | null>(null);

  const [activeLayer, setActiveLayer] = useState<'satellite' | 'natgeo' | 'osm'>('satellite');
  const [showLines, setShowLines] = useState<boolean>(true);
  const [showMarkers, setShowMarkers] = useState<boolean>(true);
  const [cursorCoords, setCursorCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [selectedPoint, setSelectedPoint] = useState<ContinentInfo | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    // Initialize Leaflet Map
    const map = L.map(mapContainerRef.current, {
      center: [20, 10],
      zoom: 2,
      minZoom: 1.5,
      maxZoom: 17,
      zoomControl: false,
      worldCopyJump: true,
    });

    mapInstanceRef.current = map;

    // Tile layers
    const satelliteLayer = L.tileLayer(
      'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      {
        attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP',
        maxZoom: 18,
      }
    );

    const natgeoLayer = L.tileLayer(
      'https://server.arcgisonline.com/ArcGIS/rest/services/NatGeo_World_Map/MapServer/tile/{z}/{y}/{x}',
      {
        attribution: 'Tiles &copy; Esri &mdash; National Geographic, DeLorme, NAVTEQ',
        maxZoom: 16,
      }
    );

    const osmLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 19,
    });

    satelliteLayer.addTo(map);

    // Coordinate mouse tracking
    map.on('mousemove', (e: L.LeafletMouseEvent) => {
      setCursorCoords({ lat: Number(e.latlng.lat.toFixed(2)), lng: Number(e.latlng.lng.toFixed(2)) });
    });

    // Layer groups
    const linesGroup = L.layerGroup().addTo(map);
    const markersGroup = L.layerGroup().addTo(map);
    linesGroupRef.current = linesGroup;
    markersGroupRef.current = markersGroup;

    // Build Parallels of Latitude & Meridians of Longitude
    const createParallel = (lat: number, color: string, name: string, dash: string = '') => {
      const line = L.polyline([
        [lat, -180],
        [lat, 180],
      ], {
        color,
        weight: lat === 0 ? 3.5 : 2.5,
        dashArray: dash || undefined,
        opacity: 0.9,
      });

      line.bindTooltip(`<b>${name}</b>`, {
        permanent: false,
        direction: 'top',
        className: 'leaflet-geo-tooltip',
      });

      line.addTo(linesGroup);
    };

    const createMeridian = (lng: number, color: string, name: string, dash: string = '') => {
      const line = L.polyline([
        [-85, lng],
        [85, lng],
      ], {
        color,
        weight: 2.5,
        dashArray: dash || undefined,
        opacity: 0.85,
      });

      line.bindTooltip(`<b>${name}</b>`, {
        permanent: false,
        direction: 'right',
        className: 'leaflet-geo-tooltip',
      });

      line.addTo(linesGroup);
    };

    // Parallels
    createParallel(0, '#ef4444', 'Equator (0°) • Splits Earth into Northern & Southern Hemispheres');
    createParallel(23.5, '#f97316', 'Tropic of Cancer (23½° N) • Northern Torrid Boundary', '8, 8');
    createParallel(-23.5, '#f97316', 'Tropic of Capricorn (23½° S) • Southern Torrid Boundary', '8, 8');
    createParallel(66.5, '#06b6d4', 'Arctic Circle (66½° N) • Frigid Zone Boundary', '6, 6');
    createParallel(-66.5, '#06b6d4', 'Antarctic Circle (66½° S) • Frigid Zone Boundary', '6, 6');

    // Meridians
    createMeridian(0, '#22c55e', 'Prime Meridian (0°) • Greenwich, London (Reference for Time Zones)');
    createMeridian(180, '#a855f7', 'International Date Line (180°)', '6, 6');

    // Continents & Oceans Custom HTML Badges
    GEOGRAPHY_POINTS.forEach((pt) => {
      const isOcean = pt.type === 'ocean';
      const bg = isOcean ? '#0284c7' : '#16a34a';
      const iconHtml = `<div style="background:${bg}; color:white; font-weight:800; font-size:10px; padding:3px 7px; border-radius:999px; box-shadow:0 3px 8px rgba(0,0,0,0.4); border:2px solid white; display:flex; align-items:center; gap:3px; white-space:nowrap; cursor:pointer;">
        <span>${isOcean ? '🌊' : '🌍'}</span>
        <span>${pt.name}</span>
      </div>`;

      const customIcon = L.divIcon({
        className: 'custom-geo-icon',
        html: iconHtml,
        iconSize: [0, 0],
        iconAnchor: [30, 10],
      });

      const marker = L.marker([pt.lat, pt.lng], { icon: customIcon });
      marker.on('click', () => {
        setSelectedPoint(pt);
      });

      marker.addTo(markersGroup);
    });

    // Clean up
    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Handle Layer switching
  const handleLayerChange = (layerKey: 'satellite' | 'natgeo' | 'osm') => {
    const map = mapInstanceRef.current;
    if (!map) return;

    setActiveLayer(layerKey);

    map.eachLayer((layer) => {
      if (layer instanceof L.TileLayer) {
        map.removeLayer(layer);
      }
    });

    if (layerKey === 'satellite') {
      L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        { maxZoom: 18 }
      ).addTo(map);
    } else if (layerKey === 'natgeo') {
      L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/NatGeo_World_Map/MapServer/tile/{z}/{y}/{x}',
        { maxZoom: 16 }
      ).addTo(map);
    } else {
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19 }).addTo(map);
    }

    if (linesGroupRef.current && showLines) linesGroupRef.current.addTo(map);
    if (markersGroupRef.current && showMarkers) markersGroupRef.current.addTo(map);
  };

  // Toggle Parallels / Lines
  const toggleLines = () => {
    const map = mapInstanceRef.current;
    const group = linesGroupRef.current;
    if (!map || !group) return;

    if (showLines) {
      map.removeLayer(group);
      setShowLines(false);
    } else {
      group.addTo(map);
      setShowLines(true);
    }
  };

  // Toggle Markers
  const toggleMarkers = () => {
    const map = mapInstanceRef.current;
    const group = markersGroupRef.current;
    if (!map || !group) return;

    if (showMarkers) {
      map.removeLayer(group);
      setShowMarkers(false);
    } else {
      group.addTo(map);
      setShowMarkers(true);
    }
  };

  // Zoom controls
  const handleZoomIn = () => mapInstanceRef.current?.zoomIn();
  const handleZoomOut = () => mapInstanceRef.current?.zoomOut();
  const handleResetView = () => mapInstanceRef.current?.setView([20, 10], 2);

  return (
    <div className="relative w-full h-full min-h-[500px] flex flex-col rounded-2xl overflow-hidden shadow-inner bg-slate-900 select-none">
      {/* Map Canvas Container */}
      <div ref={mapContainerRef} className="w-full flex-1 z-0" style={{ minHeight: '500px' }} />

      {/* Top Floating Controls Bar */}
      <div className="absolute top-3 left-3 right-3 z-10 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        {/* Layer Switcher */}
        <div className="clay-card bg-white/95 p-1.5 rounded-2xl border border-sky-200 flex items-center gap-1 shadow-lg pointer-events-auto">
          <button
            onClick={() => handleLayerChange('satellite')}
            className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 ${
              activeLayer === 'satellite'
                ? 'clay-blue text-white shadow-sm'
                : 'text-slate-700 hover:bg-sky-50'
            }`}
          >
            <span>🛰️ Satellite</span>
          </button>
          <button
            onClick={() => handleLayerChange('natgeo')}
            className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 ${
              activeLayer === 'natgeo'
                ? 'clay-blue text-white shadow-sm'
                : 'text-slate-700 hover:bg-sky-50'
            }`}
          >
            <span>🗺️ Topographic</span>
          </button>
          <button
            onClick={() => handleLayerChange('osm')}
            className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 ${
              activeLayer === 'osm'
                ? 'clay-blue text-white shadow-sm'
                : 'text-slate-700 hover:bg-sky-50'
            }`}
          >
            <span>📍 Street</span>
          </button>
        </div>

        {/* Feature Toggles */}
        <div className="clay-card bg-white/95 p-1.5 rounded-2xl border border-sky-200 flex items-center gap-1 shadow-lg pointer-events-auto">
          <button
            onClick={toggleLines}
            className={`px-2.5 py-1.5 rounded-xl text-xs font-black transition-all ${
              showLines
                ? 'bg-rose-500 text-white shadow-sm'
                : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
            }`}
            title="Toggle Parallels & Meridians"
          >
            🌐 {showLines ? 'Parallels ON' : 'Parallels OFF'}
          </button>

          <button
            onClick={toggleMarkers}
            className={`px-2.5 py-1.5 rounded-xl text-xs font-black transition-all ${
              showMarkers
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
            }`}
            title="Toggle Continent & Ocean Badges"
          >
            🏷️ {showMarkers ? 'Labels ON' : 'Labels OFF'}
          </button>

          <button
            onClick={handleResetView}
            className="p-1.5 rounded-xl hover:bg-sky-100 text-slate-700 transition-colors"
            title="Reset Global View"
          >
            <Compass className="w-4 h-4 text-sky-700" />
          </button>
        </div>
      </div>

      {/* Floating Zoom Controls (Right) */}
      <div className="absolute bottom-12 right-3 z-10 flex flex-col gap-1.5 pointer-events-auto">
        <button
          onClick={handleZoomIn}
          className="p-2 rounded-xl clay-card bg-white hover:bg-sky-50 text-slate-700 shadow-lg border border-sky-200"
          title="Zoom In"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          onClick={handleZoomOut}
          className="p-2 rounded-xl clay-card bg-white hover:bg-sky-50 text-slate-700 shadow-lg border border-sky-200"
          title="Zoom Out"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
      </div>

      {/* Bottom Live Coordinates HUD & Key Parallels Legend */}
      <div className="absolute bottom-2 left-3 right-16 z-10 pointer-events-none flex flex-wrap items-center justify-between gap-2">
        <div className="clay-card bg-slate-900/90 text-white border border-slate-700 px-3 py-1.5 rounded-xl text-[11px] font-mono flex items-center gap-3 shadow-md pointer-events-auto">
          {cursorCoords ? (
            <>
              <span className="text-emerald-400 font-bold">
                LAT: {cursorCoords.lat >= 0 ? `${cursorCoords.lat}° N` : `${Math.abs(cursorCoords.lat)}° S`}
              </span>
              <span className="text-cyan-400 font-bold">
                LNG: {cursorCoords.lng >= 0 ? `${cursorCoords.lng}° E` : `${Math.abs(cursorCoords.lng)}° W`}
              </span>
            </>
          ) : (
            <span className="text-slate-400">Move cursor across map to inspect coordinates</span>
          )}
        </div>

        {/* Parallels Color Key */}
        {showLines && (
          <div className="clay-card bg-white/95 text-slate-800 border border-sky-200 px-3 py-1 rounded-xl text-[10px] font-extrabold flex items-center gap-3 shadow-md pointer-events-auto">
            <span className="flex items-center gap-1 text-rose-600">
              <span className="w-2.5 h-0.5 bg-rose-600 rounded" />
              Equator (0°)
            </span>
            <span className="flex items-center gap-1 text-orange-600">
              <span className="w-2.5 h-0.5 bg-orange-600 rounded" />
              Tropics (23½°)
            </span>
            <span className="flex items-center gap-1 text-cyan-600">
              <span className="w-2.5 h-0.5 bg-cyan-600 rounded" />
              Circles (66½°)
            </span>
            <span className="flex items-center gap-1 text-emerald-600">
              <span className="w-2.5 h-0.5 bg-emerald-600 rounded" />
              Prime Meridian (0°)
            </span>
          </div>
        )}
      </div>

      {/* Selected Continent/Ocean Fact Card Drawer */}
      {selectedPoint && (
        <div className="absolute top-16 left-3 max-w-sm z-20 clay-card bg-white/98 p-4 rounded-2xl border-2 border-sky-300 shadow-2xl animate-fadeIn pointer-events-auto text-slate-800">
          <div className="flex items-center justify-between gap-2 border-b border-sky-100 pb-1.5 mb-2">
            <div className="flex items-center gap-2">
              <span className="text-xl">{selectedPoint.type === 'ocean' ? '🌊' : '🌍'}</span>
              <div>
                <h4 className="font-black text-sm text-slate-900">{selectedPoint.name}</h4>
                <span className="text-[10px] font-bold uppercase tracking-wider text-sky-700">
                  {selectedPoint.type}
                </span>
              </div>
            </div>
            <button
              onClick={() => setSelectedPoint(null)}
              className="text-slate-400 hover:text-slate-700 text-xs font-black p-1"
            >
              ✕
            </button>
          </div>
          <p className="text-xs text-slate-600 font-semibold leading-relaxed">
            {selectedPoint.fact}
          </p>
          <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] font-mono text-slate-500 font-bold">
            <span>Lat: {selectedPoint.lat.toFixed(2)}°</span>
            <span>Lng: {selectedPoint.lng.toFixed(2)}°</span>
          </div>
        </div>
      )}
    </div>
  );
}
