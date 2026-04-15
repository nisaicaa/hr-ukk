import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, FileText, MapPin, AlertCircle, Loader2, LogIn, LogOut, Send, Timer, Camera as CameraIcon } from 'lucide-react';
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
  const [isHoliday, setIsHoliday] = useState(false);

  const user = getUser();
  const webcamRef = useRef<Webcam>(null);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    initData();
    return () => clearInterval(timer);
  }, []);

  const initData = async () => {
    getCurrentLocation();
    try {
      const [resSet, resAtt] = await Promise.all([apiClient.get('/settings'), apiClient.get('/attendance')]);
      
      if (resSet.data.success) {
        const allowedDays = resSet.data.data.work_days.split(',').map(Number);
        setIsHoliday(!allowedDays.includes(new Date().getDay()));
      }

      const todayStr = new Date().toLocaleDateString('en-CA');
      setAttendanceToday(resAtt.data.data?.find((a: any) => new Date(a.date).toLocaleDateString('en-CA') === todayStr) || null);
    } catch (e) { console.error(e); }
  };

  const getCurrentLocation = () => {
    navigator.geolocation?.getCurrentPosition(async (pos) => {
      const { latitude: lat, longitude: lng } = pos.coords;
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
        const data = await res.json();
        setLocation({ lat, lng, address: data.display_name });
      } catch { setLocation({ lat, lng, address: "Lokasi Berhasil Dilock" }); }
    }, () => showToast("Aktifkan GPS untuk absen!", "error"), { enableHighAccuracy: true });
  };

  const handleAttendance = async (type: 'in' | 'out') => {
    if (isHoliday) return showToast("Hari ini adalah hari libur!", "error");
    const imageSrc = webcamRef.current?.getScreenshot();
    if (!imageSrc || !location) return showToast(!imageSrc ? "Kamera belum siap!" : "Lokasi belum terdeteksi!", "error");

    setLoading(true);
    try {
      const blob = await (await fetch(imageSrc)).blob();
      const formData = new FormData();
      formData.append('photo', new File([blob], `att-${Date.now()}.jpg`, { type: 'image/jpeg' }));
      formData.append('latitude', location.lat.toString());
      formData.append('longitude', location.lng.toString());
      formData.append('address', location.address);

      const res = await apiClient.post(`/attendance/check${type}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      res.data.is_late ? showToast(res.data.message, "warning") : showSuccess("Berhasil", res.data.message);
      
      setCapturedImage(imageSrc);
      initData();
    } catch (e) { showError("Gagal", handleError(e)); } finally { setLoading(false); }
  };

  const formatT = (d: any) => d ? new Date(d).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : '';

  return (
    <div className="max-w-6xl mx-auto space-y-6 md:space-y-8 px-4 pb-12 animate-in fade-in duration-700">
      
      {/* Header Ucapan & Jam */}
      <div className="flex flex-col md:flex-row justify-between items-center bg-white p-6 md:p-10 rounded-[30px] md:rounded-[40px] border border-slate-100 shadow-sm gap-6 mt-4">
        <div className="text-center md:text-left">
          <h2 className="text-2xl md:text-3xl font-bold text-[#213448] tracking-tight">Selamat bekerja, {user?.username?.split(' ')[0]}! 👋</h2>
          <p className="text-slate-500 mt-1 font-medium text-base md:text-lg">{isHoliday ? "Hari ini adalah hari libur kerja." : "Semoga harimu produktif dan penuh semangat."}</p>
        </div>
        <div className="text-center md:text-right bg-[#213448] text-white py-4 px-8 md:px-10 rounded-[25px] md:rounded-[30px] shadow-lg min-w-full md:min-w-[260px]">
          <p className="text-3xl md:text-4xl font-black tabular-nums tracking-tighter">{time.toLocaleTimeString('id-ID')}</p>
          <p className="text-[10px] md:text-[11px] font-bold uppercase tracking-widest opacity-80 mt-1">{new Intl.DateTimeFormat('id-ID', { dateStyle: 'full' }).format(time)}</p>
        </div>
      </div>

      {/* Card Utama Absensi */}
      <div className="bg-white border border-slate-100 rounded-[30px] md:rounded-[50px] p-6 md:p-10 shadow-sm">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-12 items-center">
          
          {/* Sisi Kiri: Webcam & Lokasi */}
          <div className="flex flex-col items-center space-y-6">
            <div className="relative">
              {isHoliday && (
                <div className="absolute inset-0 z-10 bg-white/80 backdrop-blur-sm rounded-full flex flex-col items-center justify-center text-center p-4">
                  <Calendar className="text-[#547792] mb-2" size={48} />
                  <p className="text-[#213448] font-black text-sm uppercase">Hari Libur</p>
                </div>
              )}
              <div className="w-60 h-60 md:w-72 md:h-72 rounded-full border-[8px] md:border-[10px] border-slate-50 shadow-inner overflow-hidden relative">
                {capturedImage ? <img src={capturedImage} className="w-full h-full object-cover scale-x-[-1]" /> : 
                  <Webcam ref={webcamRef} audio={false} screenshotFormat="image/jpeg" className="w-full h-full object-cover scale-x-[-1]" />}
                {capturedImage && !attendanceToday?.check_out && (
                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                    <button onClick={() => setCapturedImage(null)} className="bg-white/90 p-3 rounded-full text-[#213448]"><CameraIcon size={24} /></button>
                  </div>
                )}
              </div>
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-white px-5 py-2 rounded-full shadow-md border border-slate-100 flex items-center gap-2 text-[10px] md:text-xs font-bold text-slate-600">
                <div className={`w-2 h-2 rounded-full ${location ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} /> GPS {location ? 'AKTIF' : 'NONAKTIF'}
              </div>
            </div>
            <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-[25px] w-full max-w-md border border-slate-100">
              <div className="p-3 bg-white rounded-2xl shadow-sm text-[#547792]"><MapPin size={20} /></div>
              <div className="flex-1 min-w-0">
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Alamat Terdeteksi</p>
                <p className="text-xs md:text-sm font-semibold text-slate-600 truncate">{location?.address || "Mencari koordinat..."}</p>
              </div>
            </div>
          </div>

          {/* Sisi Kanan: Tombol CHECK IN/OUT */}
          <div className="flex flex-col gap-4 md:gap-5">
            {attendanceToday?.attendance_status === 'LATE' && (
              <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 p-4 md:p-5 rounded-[25px] text-amber-700">
                <AlertCircle size={24} className="shrink-0" />
                <div>
                  <p className="font-bold text-sm">Kamu Datang Terlambat</p>
                  <p className="text-xs opacity-90">{attendanceToday.late_minutes}m. Pastikan besok datang lebih awal!</p>
                </div>
              </div>
            )}
            
            <div className="grid grid-cols-1 gap-4">
              {[ 
                { t: 'in', label: 'CHECK IN', icon: LogIn, dis: !!attendanceToday?.check_in, cls: 'bg-[#213448] hover:bg-[#2c445e] shadow-[#213448]/20' },
                { t: 'out', label: 'CHECK OUT', icon: LogOut, dis: !attendanceToday?.check_in || !!attendanceToday?.check_out, cls: 'bg-[#547792] hover:bg-[#6389a8] shadow-[#547792]/20' }
              ].map((btn: any) => (
                <button 
                  key={btn.t} 
                  onClick={() => handleAttendance(btn.t)} 
                  disabled={loading || btn.dis || isHoliday}
                  className={`py-10 md:py-12 rounded-[30px] md:rounded-[40px] font-bold text-xl md:text-2xl transition-all shadow-xl flex items-center justify-center gap-4 active:scale-95 disabled:bg-slate-50 disabled:text-slate-300 ${btn.cls} text-white`}
                >
                  {loading ? <Loader2 className="animate-spin" /> : (
                    <>
                      <btn.icon size={28} className="md:w-8 md:h-8" /> 
                      {isHoliday && btn.t === 'in' ? 'HARI LIBUR' : btn.label}
                    </>
                  )}
                </button>
              ))}
            </div>

            {attendanceToday?.check_in && (
              <div className="space-y-1 text-center font-bold text-xs md:text-sm pt-2">
                <p className="text-[#213448]">Masuk: {formatT(attendanceToday.check_in)} {attendanceToday.attendance_status === 'LATE' && <span className="text-amber-600">({attendanceToday.late_minutes}m terlambat)</span>}</p>
                {attendanceToday.check_out && <p className="text-slate-500">Pulang: {formatT(attendanceToday.check_out)}</p>}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Teks Keterangan Sebelum Card Menu */}
      <div className="px-2 pt-4">
        <h3 className="font-bold text-[#213448] text-lg md:text-xl tracking-tight uppercase">Layanan Mandiri</h3>
        <p className="text-slate-400 text-xs md:text-sm font-medium">Pilih menu di bawah untuk pengajuan atau melihat riwayat</p>
      </div>

      {/* Menu Card Pengajuan */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-5">
        {[ 
          { l: 'Kehadiranku', i: Calendar, to: '/my-attendance' },
          { l: 'Izin / Cuti', i: Send, to: '/leave' },
          { l: 'Lembur', i: Timer, to: '/overtime' },
          { l: 'Slip Gaji', i: FileText, to: '/payslip' }
        ].map((m, idx) => (
          <Link 
            key={idx} 
            to={m.to} 
            className="bg-white border border-slate-100 p-4 md:p-6 rounded-[25px] md:rounded-[30px] flex flex-col items-center justify-center gap-3 hover:shadow-lg hover:-translate-y-1 transition-all group shadow-sm active:scale-95"
          >
            <div className="w-12 h-12 md:w-14 md:h-14 bg-slate-50 text-[#547792] rounded-[18px] md:rounded-[22px] flex items-center justify-center group-hover:bg-[#213448] group-hover:text-white transition-colors duration-300">
              <m.i size={22} className="md:w-6 md:h-6" />
            </div>
            <span className="font-bold text-xs md:text-sm text-slate-700 tracking-wide text-center">{m.l}</span>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;