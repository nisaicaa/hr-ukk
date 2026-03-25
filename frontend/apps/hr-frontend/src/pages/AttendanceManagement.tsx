import React, { useEffect, useState } from 'react';
import { Eye, Calendar, Search, Download, MapPin, Clock, User, X, Briefcase } from 'lucide-react';
import * as XLSX from 'xlsx';
import apiClient from '../../../../services/api';

interface Employee {
  id_employee: number;
  full_name: string;
}

interface AttendanceRecord {
  id_attendance: number;
  date: string;
  check_in: string | null;
  check_out: string | null;
  work_duration_minutes: number | null;
  attendance_status: string;
  checkin_address: string | null;
  checkout_address: string | null;
  checkin_photo: string | null;
  checkout_photo: string | null;
  checkin_latitude?: number;
  checkin_longitude?: number;
  checkout_latitude?: number;
  checkout_longitude?: number;
  employee: Employee;
}

// Helper untuk URL base API, sesuaikan dengan backend Anda
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:7000';

const AttendanceManagement: React.FC = () => {
  const [data, setData] = useState<AttendanceRecord[]>([]);
  const [filteredData, setFilteredData] = useState<AttendanceRecord[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedRow, setSelectedRow] = useState<AttendanceRecord | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      console.log("Fetching attendance data for admin...");
      const res = await apiClient.get('/attendance/all');
      console.log("API Response:", res.data);
      
      const apiData = res.data.data || [];
      console.log("Data received:", apiData.length, "records");
      
      setData(apiData);
      setFilteredData(apiData);
    } catch (error: any) {
      console.error("Fetch error:", error.response?.data || error.message);
      setData([]);
      setFilteredData([]);
    } finally {
      setLoading(false);
    }
  };

  const handleApplyFilter = () => {
    let result = [...data];
    
    if (searchTerm) {
      result = result.filter(item => 
        item.employee.full_name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (startDate && endDate) {
      result = result.filter(item => {
        const itemDate = new Date(item.date).toISOString().split('T')[0];
        return itemDate >= startDate && itemDate <= endDate;
      });
    }
    
    setFilteredData(result);
  };

  const handleExport = () => {
    if (filteredData.length === 0) {
      alert("Tidak ada data untuk di-export");
      return;
    }
    
    const excelData = filteredData.map((row, index) => ({
      No: index + 1,
      Nama: row.employee.full_name || 'N/A',
      Tanggal: new Date(row.date).toLocaleDateString('id-ID'),
      'Jam Masuk': row.check_in ? new Date(row.check_in).toLocaleTimeString('id-ID') : '-',
      'Jam Pulang': row.check_out ? new Date(row.check_out).toLocaleTimeString('id-ID') : '-',
      'Durasi Kerja': row.work_duration_minutes ? `${Math.floor(row.work_duration_minutes / 60)}j ${row.work_duration_minutes % 60}m` : '-',
      Status: row.attendance_status,
      'Lokasi Masuk': row.checkin_address || '-',
      'Lokasi Keluar': row.checkout_address || '-',
    }));

    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Laporan Absensi");
    XLSX.writeFile(workbook, `Laporan_Absensi_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const getStatusDisplay = (status: string) => {
    switch (status) {
      case 'PRESENT': return 'Hadir';
      case 'LATE': return 'Terlambat';
      case 'ABSENT': return 'Alpha';
      default: return status;
    }
  };

  const formatDuration = (minutes: number | null) => {
    if (!minutes) return '-';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}j ${mins}m`;
  };

  // 🗺️ Helper untuk URL Google Maps Statis (Hanya untuk satu pin)
  const getGoogleMapUrl = (lat?: number, lng?: number) => {
    if (!lat || !lng) return null;
    // URL embed Google Maps bawaan
    return `https://maps.google.com/maps?q=${lat},${lng}&hl=es;z=14&output=embed`;
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Manajemen Absensi</h1>
          <p className="text-gray-500 font-medium text-sm">Rekapitulasi & Verifikasi Kehadiran</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={fetchData}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 disabled:bg-blue-400 transition-all"
          >
            Refresh
          </button>
          <button onClick={handleExport} className="flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-2xl font-bold text-sm hover:bg-emerald-700 transition-all shadow-md">
            <Download size={18} />
            Export Excel
          </button>
        </div>
      </div>

      <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Cari nama karyawan..." 
            className="w-full pl-12 pr-4 py-3 bg-gray-50 rounded-2xl border-none font-medium text-sm focus:ring-2 focus:ring-emerald-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <input 
          type="date" 
          className="px-4 py-3 bg-gray-50 rounded-2xl border-none font-medium text-sm text-gray-700"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
        />
        <input 
          type="date" 
          className="px-4 py-3 bg-gray-50 rounded-2xl border-none font-medium text-sm text-gray-700"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
        />
        <button 
          onClick={handleApplyFilter}
          className="bg-gray-900 text-white rounded-2xl font-bold text-sm hover:bg-black transition-all"
        >
          Terapkan Filter
        </button>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="text-center py-10 text-gray-500">Memuat data...</div>
        ) : filteredData.length === 0 ? (
          <div className="text-center py-20 text-gray-500">
            Tidak ada data absensi
            <div className="mt-4 text-sm text-gray-400">
              Pastikan sudah login sebagai Admin/HR dan coba refresh data
            </div>
          </div>
        ) : (
          <table className="w-full text-left">
            <thead className="bg-gray-50/50">
              <tr className="border-b border-gray-100">
                <th className="p-5 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Karyawan</th>
                <th className="p-5 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Tanggal</th>
                <th className="p-5 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Jam Masuk</th>
                <th className="p-5 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Jam Pulang</th>
                <th className="p-5 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Durasi</th>
                <th className="p-5 text-[11px] font-bold text-gray-500 uppercase tracking-wider text-center">Status</th>
                <th className="p-5 text-[11px] font-bold text-gray-500 uppercase tracking-wider text-center">Detail</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredData.map((row) => (
                <tr key={row.id_attendance} className="hover:bg-gray-50/50 transition-colors">
                  <td className="p-5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500">
                        <User size={20} />
                      </div>
                      <span className="font-semibold text-gray-900 text-sm">{row.employee.full_name}</span>
                    </div>
                  </td>
                  <td className="p-5 text-sm text-gray-600 font-medium">
                    {new Date(row.date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </td>
                  <td className="p-5 text-sm text-gray-600 font-mono font-semibold">
                    {row.check_in ? new Date(row.check_in).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : '-'}
                  </td>
                  <td className="p-5 text-sm text-gray-600 font-mono font-semibold">
                    {row.check_out ? new Date(row.check_out).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : '-'}
                  </td>
                  <td className="p-5 text-sm font-semibold text-gray-800">
                    {formatDuration(row.work_duration_minutes)}
                  </td>
                  <td className="p-5 text-center">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      row.attendance_status === 'PRESENT' ? 'bg-emerald-100 text-emerald-800' :
                      row.attendance_status === 'LATE' ? 'bg-amber-100 text-amber-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {getStatusDisplay(row.attendance_status)}
                    </span>
                  </td>
                  <td className="p-5 text-center">
                    <button 
                      onClick={() => setSelectedRow(row)} 
                      className="p-2 bg-gray-100 text-gray-600 rounded-xl hover:bg-emerald-100 hover:text-emerald-700 transition-all"
                    >
                      <Eye size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* ⚠️ MODAL DETAIL - BAGIAN INI DIPERBAIKI (PIN GANDA DIHAPUS) ⚠️ */}
      {selectedRow && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl p-8 w-full max-w-lg shadow-2xl overflow-y-auto max-h-[90vh]">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-black text-gray-900">Detail Absensi</h2>
              <button onClick={() => setSelectedRow(null)} className="p-2 rounded-full hover:bg-gray-100">
                <X size={20} />
              </button>
            </div>
            
            <div className="space-y-6">
              {/* Header Karyawan */}
              <div className="flex items-center gap-3 p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                <User className="text-emerald-600" size={24}/>
                <div>
                  <p className="text-lg font-bold text-gray-900">{selectedRow.employee.full_name}</p>
                  <p className="text-sm text-gray-500">
                    {new Date(selectedRow.date).toLocaleDateString('id-ID', {dateStyle: 'full'})}
                  </p>
                </div>
              </div>

              {/* FOTO & PETA DISINI */}
              <div className="text-center bg-gray-50 p-6 rounded-2xl border border-gray-100">
                
                {/* 1. FOTO BULAT */}
                {selectedRow.checkin_photo && (
                  <img 
                    src={`${API_URL}/uploads/${selectedRow.checkin_photo}`} 
                    alt="Selfie Bukti" 
                    className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-md mb-5 mx-auto"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                  />
                )}
                
                {/* 2. PETA STATIS (Google Maps + Locked + Pin Tunggal) */}
                {selectedRow.checkin_latitude && selectedRow.checkin_longitude && (
                  <div className="relative rounded-2xl overflow-hidden h-48 border-4 border-white shadow-md pointer-events-none">
                    <iframe
                      src={getGoogleMapUrl(selectedRow.checkin_latitude, selectedRow.checkin_longitude)!}
                      width="100%"
                      height="100%"
                      frameBorder="0"
                      style={{ border: 0 }}
                      allowFullScreen={false}
                      aria-hidden="false"
                      tabIndex={0}
                    />
                    {/* Overlay Transparan untuk mencegah klik pada iframe */}
                    <div className="absolute inset-0 bg-transparent flex items-center justify-center pointer-events-none">
                      {/* Pin Ganda dihapus, iframe sudah memiliki pin sendiri */}
                    </div>
                  </div>
                )}
                
                {/* 3. ALAMAT LOKASI */}
                <p className="text-xs text-gray-500 mt-4 flex items-center justify-center gap-1.5">
                  <MapPin size={14} className="text-emerald-600" /> {selectedRow.checkin_address || 'Lokasi tidak tercatat'}
                </p>
              </div>

              {/* Jam Masuk */}
              {selectedRow.check_in && (
                <div className="flex items-center justify-center gap-2 text-sm font-semibold text-gray-700 bg-white border border-gray-100 p-3 rounded-xl">
                  <Clock size={16} className="text-gray-400" />
                  Jam Masuk: {new Date(selectedRow.check_in).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AttendanceManagement;