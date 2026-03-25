import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar, FileText, MapPin,
  Loader2, LogIn, LogOut, Send, Timer, Camera as CameraIcon
} from 'lucide-react';
import Webcam from 'react-webcam';
import apiClient from '../../../../services/api';
import { getUser } from '../../../../services/helper/auth';
import { handleError } from '../../../../services/handler/error';
import { showSuccess, showError, showToast } from '../../../../services/helper/swal';

const Dashboard = () => {
  const [time, setTime] = useState(new Date());
  const [loading, setLoading] = useState(false);
  const [attendanceToday, setAttendanceToday] = useState<any>(null);
  const [location, setLocation] = useState<{ lat: number, lng: number, address: string } | null>(null);
  // ✅ STATE BARU UNTUK PREVIEW FOTO
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const user = getUser();

  const webcamRef = useRef<Webcam>(null);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    fetchAttendance();
    getCurrentLocation();
    return () => clearInterval(timer);
  }, []);

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const { latitude, longitude } = pos.coords;
          try {
            const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
            const data = await res.json();
            setLocation({ lat: latitude, lng: longitude, address: data.display_name });
          } catch {
            setLocation({ lat: latitude, lng: longitude, address: "Lokasi Berhasil Dilock" });
          }
        },
        () => showToast("Aktifkan GPS untuk absen!", "error"),
        { enableHighAccuracy: true }
      );
    }
  };

  const fetchAttendance = async () => {
    try {
      const res = await apiClient.get('/attendance');
      const todayStr = new Date().toLocaleDateString('en-CA');

      const todayData = res.data.data?.find((a: any) => {
        const itemDate = new Date(a.date).toLocaleDateString('en-CA');
        return itemDate === todayStr;
      });

      setAttendanceToday(todayData || null);
    } catch (e) {
      console.error(e);
    }
  };

  const handleAttendance = async (type: 'in' | 'out') => {
    if (!webcamRef.current) {
      showToast("Kamera belum siap!", "error");
      return;
    }

    // 1. Ambil screenshot
    const imageSrc = webcamRef.current.getScreenshot();
    if (!imageSrc) {
      showToast("Gagal mengambil foto!", "error");
      return;
    }
    
    // 2. Tampilkan hasil foto di UI
    setCapturedImage(imageSrc);

    const blob = await (await fetch(imageSrc)).blob();

    if (!location) {
      showToast("Lokasi belum terdeteksi!", "error");
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('photo', blob, 'selfie.jpg');
      formData.append('latitude', location.lat.toString());
      formData.append('longitude', location.lng.toString());
      formData.append('address', location.address);

      const endpoint = type === 'in' ? '/attendance/check-in' : '/attendance/check-out';
      await apiClient.post(endpoint, formData);

      showSuccess("Berhasil", `Absen ${type === 'in' ? 'Masuk' : 'Pulang'} telah tercatat.`);
      fetchAttendance();
      // Reset foto setelah berhasil absen (opsional)
      // setCapturedImage(null); 
    } catch (e: any) {
      showError("Gagal", handleError(e));
      setCapturedImage(null); // Reset foto jika gagal
    } finally {
      setLoading(false);
    }
  };

  const menuCards = [
    { label: 'Kehadiranku', icon: Calendar, color: 'text-emerald-600', bg: 'bg-emerald-50', link: '/my-attendance' },
    { label: 'Izin / Cuti', icon: Send, color: 'text-amber-600', bg: 'bg-amber-50', link: '/leave' },
    { label: 'Lembur', icon: Timer, color: 'text-rose-600', bg: 'bg-rose-50', link: '/overtime' },
    { label: 'Slip Gaji', icon: FileText, color: 'text-blue-600', bg: 'bg-blue-50', link: '/payslip' },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12 animate-in fade-in duration-700">
      
      {/* WELCOME HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-center bg-white p-10 rounded-[40px] border border-slate-100 shadow-sm gap-6">
        <div className="text-center md:text-left">
          <h2 className="text-3xl font-bold text-slate-800 tracking-tight">
            Selamat bekerja, {user?.username?.split(' ')[0]}! 👋
          </h2>
          <p className="text-slate-500 mt-1 font-medium text-lg">
            Semoga harimu produktif dan penuh semangat.
          </p>
        </div>
        <div className="text-center md:text-right bg-emerald-600 text-white py-4 px-10 rounded-[30px] shadow-lg shadow-emerald-100 min-w-[260px]">
          <p className="text-4xl font-black tabular-nums tracking-tighter">{time.toLocaleTimeString('id-ID')}</p>
          <p className="text-[11px] font-bold uppercase tracking-widest opacity-80 mt-1">
            {new Intl.DateTimeFormat('id-ID', { dateStyle: 'full' }).format(time)}
          </p>
        </div>
      </div>

      {/* ATTENDANCE CARD */}
      <div className="bg-white border border-slate-100 rounded-[50px] p-10 shadow-sm">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          <div className="flex flex-col items-center space-y-6">
            {/* SELFIE AREA BULAT */}
            <div className="relative">
              <div className="w-72 h-72 rounded-full border-[10px] border-slate-50 shadow-inner overflow-hidden group relative">
                
                {/* ✅ LOGIKA TAMPILKAN FOTO ATAU KAMERA */}
                {capturedImage ? (
                  <img src={capturedImage} alt="Captured" className="w-full h-full object-cover scale-x-[-1]" />
                ) : (
                  <Webcam
                    ref={webcamRef}
                    audio={false}
                    screenshotFormat="image/jpeg"
                    videoConstraints={{ facingMode: "user" }}
                    className="w-full h-full object-cover scale-x-[-1]"
                  />
                )}

                {/* Overlay saat ada foto */}
                {capturedImage && (
                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                    <button onClick={() => setCapturedImage(null)} className="bg-white/90 p-3 rounded-full text-slate-700">
                      <CameraIcon size={24} />
                    </button>
                  </div>
                )}
              </div>
              
              {/* Status Badge di atas lingkaran */}
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-white px-6 py-2 rounded-full shadow-md border border-slate-100">
                  <span className="flex items-center gap-2 text-xs font-bold text-slate-600">
                    <div className={`w-2 h-2 rounded-full ${location ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`}></div>
                    GPS {location ? 'AKTIF' : 'OFF'}
                  </span>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-3xl w-full max-w-md border border-slate-100">
              <div className="p-3 bg-white rounded-2xl shadow-sm text-rose-500">
                <MapPin size={20} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Alamat Terdeteksi</p>
                <p className="text-sm font-semibold text-slate-600 truncate">
                  {location?.address || "Mencari koordinat..."}
                </p>
              </div>
            </div>
          </div>

          {/* ACTION BUTTONS */}
          <div className="grid grid-cols-1 gap-5">
            <button
              onClick={() => handleAttendance('in')}
              disabled={loading || !!attendanceToday?.check_in}
              className="py-12 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-50 text-white disabled:text-slate-300 rounded-[40px] font-bold text-2xl transition-all shadow-xl shadow-emerald-100 active:scale-95 flex items-center justify-center gap-4"
            >
              {loading ? <Loader2 className="animate-spin" /> : <><LogIn size={32} /> CHECK IN</>}
            </button>

            <button
              onClick={() => handleAttendance('out')}
              disabled={loading || !attendanceToday?.check_in || !!attendanceToday?.check_out}
              className="py-12 bg-slate-800 hover:bg-black disabled:bg-slate-50 text-white disabled:text-slate-300 rounded-[40px] font-bold text-2xl transition-all shadow-xl shadow-slate-100 active:scale-95 flex items-center justify-center gap-4"
            >
              {loading ? <Loader2 className="animate-spin" /> : <><LogOut size={32} /> CHECK OUT</>}
            </button>
            
            {attendanceToday?.check_in && (
              <p className="text-center text-sm font-bold text-emerald-600 animate-pulse">
                Kamu sudah absen masuk pukul {new Date(attendanceToday.check_in).toLocaleTimeString('id-ID', {hour: '2-digit', minute:'2-digit'})}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* MENU GRID */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {menuCards.map((item, i) => (
          <Link 
            key={i} 
            to={item.link} 
            className="bg-white border border-slate-100 p-8 rounded-[40px] flex flex-col items-center justify-center gap-5 hover:shadow-xl hover:-translate-y-2 transition-all group active:scale-95 shadow-sm"
          >
            <div className={`w-20 h-20 ${item.bg} ${item.color} rounded-[28px] flex items-center justify-center group-hover:scale-110 transition-transform`}>
              <item.icon size={32} />
            </div>
            <span className="font-bold text-sm text-slate-600 uppercase tracking-wider">
              {item.label}
            </span>
          </Link>
        ))}
      </div>

    </div>
  );
};

export default Dashboard;