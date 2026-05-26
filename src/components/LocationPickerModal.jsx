import { useState, useEffect, useRef } from 'react';

export default function LocationPickerModal({ isOpen, onClose, onConfirm }) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);

  const [selectedPos, setSelectedPos] = useState(null);
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    // Small delay lets the modal DOM render before Leaflet touches it
    const timer = setTimeout(() => {
      if (!mapRef.current || mapInstanceRef.current) return;

      import('leaflet').then((L) => {
        const leaflet = L.default || L;

        delete leaflet.Icon.Default.prototype._getIconUrl;
        leaflet.Icon.Default.mergeOptions({
          iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
          iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
          shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
        });

        const map = leaflet.map(mapRef.current).setView([33.5138, 36.2765], 13);
        mapInstanceRef.current = map;

        leaflet.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors',
        }).addTo(map);

        map.on('click', (e) => {
          const { lat, lng } = e.latlng;
          if (markerRef.current) {
            markerRef.current.setLatLng([lat, lng]);
          } else {
            markerRef.current = leaflet.marker([lat, lng]).addTo(map);
          }
          setSelectedPos({ lat, lng });
        });
      });
    }, 100);

    return () => {
      clearTimeout(timer);
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        markerRef.current = null;
      }
    };
  }, [isOpen]);

  useEffect(() => {
    if (selectedPos) fetchAddress(selectedPos.lat, selectedPos.lng);
  }, [selectedPos]);

  async function fetchAddress(lat, lng) {
    setLoading(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&accept-language=ar`,
        { headers: { 'User-Agent': 'Urbanex/1.0' } },
      );
      const data = await res.json();
      setAddress(data.display_name || `${lat.toFixed(5)}, ${lng.toFixed(5)}`);
    } catch {
      setAddress(`${lat.toFixed(5)}, ${lng.toFixed(5)}`);
    } finally {
      setLoading(false);
    }
  }

  function handleConfirm() {
    if (!selectedPos) return;
    onConfirm({ lat: selectedPos.lat, lng: selectedPos.lng, address });
    onClose();
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
      <div className="bg-gray-900 rounded-2xl shadow-2xl w-full max-w-2xl mx-4 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-700">
          <div>
            <h2 className="text-white font-bold text-lg">📍 حدد موقع العقار</h2>
            <p className="text-gray-400 text-sm mt-0.5">اضغط على الخريطة لتحديد الموقع بدقة</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-2xl leading-none">
            ×
          </button>
        </div>

        <div ref={mapRef} className="h-80 w-full" />

        <div className="px-5 py-3 bg-gray-800 min-h-[48px] flex items-center">
          {loading ? (
            <span className="text-gray-400 text-sm">جاري تحديد العنوان...</span>
          ) : selectedPos ? (
            <span className="text-green-400 text-sm">📌 {address}</span>
          ) : (
            <span className="text-gray-500 text-sm">اضغط على الخريطة لاختيار الموقع</span>
          )}
        </div>

        <div className="flex gap-3 px-5 py-4 border-t border-gray-700">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl bg-gray-700 text-gray-300 hover:bg-gray-600 transition font-medium"
          >
            إلغاء
          </button>
          <button
            onClick={handleConfirm}
            disabled={!selectedPos}
            className="flex-1 py-2.5 rounded-xl bg-blue-600 text-white hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed transition font-bold"
          >
            ✅ تأكيد الموقع
          </button>
        </div>
      </div>
    </div>
  );
}
