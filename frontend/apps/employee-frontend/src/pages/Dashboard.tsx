import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar, FileText, MapPin, AlertCircle,
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
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  
  const [workSetting, setWorkSetting] = useState<any>(null);
  const [isHoliday, setIsHoliday] = useState(false);

  const user = getUser();
  const webcamRef = useRef<Webcam>(null);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    fetchAttendance();
    fetchWorkSetting();
    getCurrentLocation();
    return () => clearInterval(timer);
  }, []);

  const fetchWorkSetting = async () => {
    try {
      const res = await apiClient.get('/settings');
      if (res.data.success) {
        const setting = res.data.data;
        setWorkSetting(setting);
        
        const todayDay = new Date().getDay();
        const allowedDays = setting.work_days.split(',').map(Number);
        
        if (!allowedDays.includes(todayDay)) {
          setIsHoliday(true);
        }
      }
    } catch (e) {
      console.error("Gagal ambil setting kerja", e);
    }
  };

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

  // ✅ UPDATED: Handle terlambat dengan info dari backend
  const handleAttendance = async (type: 'in' | 'out') => {
    if (isHoliday) {
      showToast("Hari ini adalah hari libur!", "error");
      return;
    }

    if (!webcamRef.current) {
      showToast("Kamera belum siap!", "error");
      return;
    }

    const imageSrc = webcamRef.current.getScreenshot();
    if (!imageSrc) {
      showToast("Gagal mengambil foto!", "error");
      return;
    }
    
    setCapturedImage(imageSrc);
    const blob = await (await fetch(imageSrc)).blob();

    if (!location) {
      showToast("Lokasi belum terdeteksi!", "error");
      return;
    }

    setLoading(true);
    try {
      const endpoint = type === 'in' 
  ? '/attendance/checkin' 
  : '/attendance/checkout';

const res = await apiClient.post(endpoint, {
  photo: imageSrc,
  latitude: location.lat,
  longitude: location.lng,
  address: location.address,
});
      // DETEKSI TERLAMBAT DARI BACKEND RESPONSE
      if (res.data.is_late) {
        showToast(res.data.message, "warning"); // "Kamu terlambat 15 menit"
      } else {
        showSuccess("Berhasil", res.data.message);
      }

      fetchAttendance();
    } catch (e: any) {
      showError("Gagal", handleError(e));
      setCapturedImage(null);
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
            {isHoliday ? "Hari ini adalah hari libur kerja." : "Semoga harimu produktif dan penuh semangat."}
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
            <div className="relative">
              {isHoliday && (
                <div className="absolute inset-0 z-10 bg-white/80 backdrop-blur-sm rounded-full flex flex-col items-center justify-center text-center p-4">
                  <Calendar className="text-rose-500 mb-2" size={48} />
                  <p className="text-rose-600 font-black text-sm uppercase">Hari Libur</p>
                </div>
              )}

              <div className="w-72 h-72 rounded-full border-[10px] border-slate-50 shadow-inner overflow-hidden group relative">
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

                {capturedImage && !attendanceToday?.check_out && (
                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                    <button onClick={() => setCapturedImage(null)} className="bg-white/90 p-3 rounded-full text-slate-700">
                      <CameraIcon size={24} />
                    </button>
                  </div>
                )}
              </div>
              
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

          <div className="grid grid-cols-1 gap-5">
            {/* NOTIFIKASI TERLAMBAT */}
            {attendanceToday?.attendance_status === 'LATE' && (
              <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 p-5 rounded-3xl text-amber-700 animate-bounce">
                <AlertCircle size={24} className="shrink-0" />
                <div>
                  <p className="font-bold text-sm">Kamu Datang Terlambat</p>
                  <p className="text-xs opacity-80">
                    {attendanceToday.late_minutes ? `${attendanceToday.late_minutes}m` : ''} Pastikan besok datang lebih awal ya!
                  </p>
                </div>
              </div>
            )}

            <button
              onClick={() => handleAttendance('in')}
              disabled={loading || !!attendanceToday?.check_in || isHoliday}
              className={`py-12 rounded-[40px] font-bold text-2xl transition-all shadow-xl flex items-center justify-center gap-4 active:scale-95 
                ${isHoliday ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-100 disabled:bg-slate-50 disabled:text-slate-300'}`}
            >
              {loading ? <Loader2 className="animate-spin" /> : <><LogIn size={32} /> {isHoliday ? 'HARI LIBUR' : 'CHECK IN'}</>}
            </button>

            <button
              onClick={() => handleAttendance('out')}
              disabled={loading || !attendanceToday?.check_in || !!attendanceToday?.check_out || isHoliday}
              className="py-12 bg-slate-800 hover:bg-black disabled:bg-slate-50 text-white disabled:text-slate-300 rounded-[40px] font-bold text-2xl transition-all shadow-xl shadow-slate-100 active:scale-95 flex items-center justify-center gap-4"
            >
              {loading ? <Loader2 className="animate-spin" /> : <><LogOut size={32} /> CHECK OUT</>}
            </button>
            
            {attendanceToday?.check_in && (
              <div className="space-y-1 text-center">
                <p className="text-sm font-bold text-emerald-600">
                  Check-in: {new Date(attendanceToday.check_in).toLocaleTimeString('id-ID', {hour: '2-digit', minute:'2-digit'})}
                  {attendanceToday.attendance_status === 'LATE' && (
                    <span className="ml-2 text-amber-600 font-bold">
                      ({attendanceToday.late_minutes || 0}m telat)
                    </span>
                  )}
                </p>
                {attendanceToday.check_out && (
                  <p className="text-sm font-bold text-slate-500">
                    Check-out: {new Date(attendanceToday.check_out).toLocaleTimeString('id-ID', {hour: '2-digit', minute:'2-digit'})}
                  </p>
                )}
              </div>
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