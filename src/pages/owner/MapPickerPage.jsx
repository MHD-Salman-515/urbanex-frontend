import { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

export default function MapPickerPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const sessionId = searchParams.get('sessionId');
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);

  const [pos, setPos] = useState(null);
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [confirming, setConfirming] = useState(false);

  useEffect(() => {
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
        setPos({ lat, lng });
      });
    });

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (pos) reverseGeocode(pos.lat, pos.lng);
  }, [pos]);

  async function reverseGeocode(lat, lng) {
    setLoading(true);
    try {
      const r = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&accept-language=ar`,
        { headers: { 'User-Agent': 'Urbanex/1.0' } },
      );
      const d = await r.json();
      setAddress(d.display_name || `${lat.toFixed(5)}, ${lng.toFixed(5)}`);
    } catch {
      setAddress(`${lat.toFixed(5)}, ${lng.toFixed(5)}`);
    } finally {
      setLoading(false);
    }
  }

  async function handleConfirm() {
    if (!pos || !sessionId) return;
    setConfirming(true);
    try {
      const token =
        localStorage.getItem('auth_token_v1') ||
        localStorage.getItem('access_token') ||
        localStorage.getItem('token');
      const BASE_URL =
        import.meta.env.VITE_API_BASE_URL || 'https://real-state-backend-yc23.onrender.com';
      await fetch(`${BASE_URL}/owner/chat/sessions/${sessionId}/message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          message: `الموقع: ${address || 'إحداثيات محددة'} (${pos.lat.toFixed(6)}, ${pos.lng.toFixed(6)})`,
        }),
      });
      navigate(`/owner/chat?session=${sessionId}`);
    } catch (e) {
      console.error(e);
      setConfirming(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col" dir="rtl">
      <div className="bg-gray-900 border-b border-gray-800 px-6 py-4 flex items-center gap-4">
        <button
          onClick={() => navigate(-1)}
          className="text-gray-400 hover:text-white transition"
        >
          ← رجوع
        </button>
        <div>
          <h1 className="text-white font-bold text-lg">📍 حدد موقع العقار</h1>
          <p className="text-gray-400 text-sm">اضغط على الخريطة لتحديد الموقع بدقة</p>
        </div>
      </div>

      <div ref={mapRef} className="flex-1" style={{ minHeight: '60vh' }} />

      <div className="bg-gray-900 border-t border-gray-800 p-5">
        <div className="max-w-xl mx-auto">
          <div className="mb-4 p-3 rounded-xl bg-gray-800 min-h-[48px] flex items-center">
            {loading ? (
              <span className="text-gray-400 text-sm">جاري تحديد العنوان...</span>
            ) : pos ? (
              <span className="text-green-400 text-sm">📌 {address}</span>
            ) : (
              <span className="text-gray-500 text-sm">اضغط على الخريطة لاختيار الموقع</span>
            )}
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => navigate(-1)}
              className="flex-1 py-3 rounded-xl bg-gray-700 text-gray-300 hover:bg-gray-600 transition font-medium"
            >
              إلغاء
            </button>
            <button
              onClick={handleConfirm}
              disabled={!pos || confirming}
              className="flex-1 py-3 rounded-xl bg-blue-600 text-white hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed transition font-bold"
            >
              {confirming ? 'جاري الإرسال...' : '✅ تأكيد الموقع'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
