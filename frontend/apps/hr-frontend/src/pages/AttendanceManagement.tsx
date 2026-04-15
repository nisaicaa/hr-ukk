import React, { useEffect, useState } from 'react';
import {
  Eye,
  Search,
  Download,
  MapPin,
  Clock,
  User,
  X,
  LogIn,
  LogOut,
  Timer,
  RefreshCw
} from 'lucide-react';
import * as XLSX from 'xlsx';
import apiClient from '../../../../services/api';

// =======================
// INTERFACE TYPES
// =======================
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
  late_minutes?: number;
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

// Base URL API
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:7000';

const AttendanceManagement: React.FC = () => {
  const [data, setData] = useState<AttendanceRecord[]>([]);
  const [filteredData, setFilteredData] = useState<AttendanceRecord[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedRow, setSelectedRow] = useState<AttendanceRecord | null>(null);

  // =======================
  // FETCH DATA
  // =======================
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/attendance/all');
      const apiData = res.data.data || [];
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

  // =======================
  // FILTER DATA
  // =======================
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

  // =======================
  // EXPORT EXCEL
  // =======================
  const handleExport = () => {
    if (filteredData.length === 0) {
      alert("Tidak ada data untuk di-export");
      return;
    }

    const excelData = filteredData.map((row, index) => ({
      No: index + 1,
      Nama: row.employee.full_name || 'N/A',
      Tanggal: new Date(row.date).toLocaleDateString('id-ID'),
      'Jam Masuk': row.check_in
        ? new Date(row.check_in).toLocaleTimeString('id-ID')
        : '-',
      'Jam Pulang': row.check_out
        ? new Date(row.check_out).toLocaleTimeString('id-ID')
        : '-',
      'Durasi Kerja': row.work_duration_minutes
        ? `${Math.floor(row.work_duration_minutes / 60)}j ${row.work_duration_minutes % 60}m`
        : '-',
      Status: getStatusDisplay(row.attendance_status),
      'Lokasi Masuk': row.checkin_address || '-',
      'Lokasi Keluar': row.checkout_address || '-',
    }));

    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Laporan Absensi");
    XLSX.writeFile(
      workbook,
      `Laporan_Absensi_${new Date().toISOString().split('T')[0]}.xlsx`
    );
  };

  // =======================
  // HELPER FUNCTIONS
  // =======================
  const getStatusDisplay = (status: string) => {
    switch (status) {
      case 'PRESENT':
        return 'Hadir';
      case 'LATE':
        return 'Terlambat';
      case 'ABSENT':
        return 'Alpha';
      case 'LEAVE':
        return 'Cuti';
      default:
        return status;
    }
  };

  const formatDuration = (minutes: number | null) => {
    if (!minutes) return '-';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}j ${mins}m`;
  };

  const getGoogleMapUrl = (lat?: number, lng?: number) => {
    if (!lat || !lng) return null;
    return `https://maps.google.com/maps?q=${lat},${lng}&hl=id&z=15&output=embed`;
  };

  // =======================
  // RENDER
  // =======================
  return (
    <div className="p-6 space-y-6">
      {/* HEADER */}
      <div className="flex justify-between items-center bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-2xl font-black text-[#213448]">
            Manajemen Absensi
          </h1>
          <p className="text-[#547792] font-medium text-sm">
            Rekapitulasi & Verifikasi Kehadiran
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchData}
            disabled={loading}
            className="p-3 bg-gray-100 text-[#547792] rounded-xl hover:bg-[#94B4C1]/20 disabled:opacity-50 transition-all shadow-sm"
            title="Refresh Data"
          >
            <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
          </button>
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-6 py-3 bg-[#94B4C1] text-[#213448] rounded-2xl font-bold text-sm hover:bg-[#547792] hover:text-white transition-all shadow-md"
          >
            <Download size={18} />
            Export Excel
          </button>
        </div>
      </div>

      {/* FILTER */}
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="relative">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
            size={18}
          />
          <input
            type="text"
            placeholder="Cari nama karyawan..."
            className="w-full pl-12 pr-4 py-3 bg-gray-50 rounded-2xl font-medium text-sm focus:ring-2 focus:ring-[#94B4C1] outline-none"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <input
          type="date"
          className="px-4 py-3 bg-gray-50 rounded-2xl font-medium text-sm focus:ring-2 focus:ring-[#94B4C1] outline-none"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
        />
        <input
          type="date"
          className="px-4 py-3 bg-gray-50 rounded-2xl font-medium text-sm focus:ring-2 focus:ring-[#94B4C1] outline-none"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
        />
        <button
          onClick={handleApplyFilter}
          className="bg-[#213448] text-white rounded-2xl font-bold text-sm hover:bg-black transition-all"
        >
          Terapkan Filter
        </button>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="text-center py-10 text-[#547792] font-bold italic">
            Memuat data...
          </div>
        ) : filteredData.length === 0 ? (
          <div className="text-center py-20 text-gray-500">
            Tidak ada data absensi
          </div>
        ) : (
          <table className="w-full text-left">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-5 text-xs font-bold text-[#547792] uppercase">
                  Karyawan
                </th>
                <th className="p-5 text-xs font-bold text-[#547792] uppercase">
                  Tanggal
                </th>
                <th className="p-5 text-xs font-bold text-[#547792] uppercase">
                  Jam Masuk
                </th>
                <th className="p-5 text-xs font-bold text-[#547792] uppercase">
                  Jam Pulang
                </th>
                <th className="p-5 text-xs font-bold text-[#547792] uppercase">
                  Durasi
                </th>
                <th className="p-5 text-xs font-bold text-[#547792] uppercase text-center">
                  Status
                </th>
                <th className="p-5 text-xs font-bold text-[#547792] uppercase text-center">
                  Detail
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredData.map((row) => (
                <tr key={row.id_attendance} className="hover:bg-slate-50/50">
                  <td className="p-5 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#94B4C1]/20 flex items-center justify-center text-[#547792]">
                      <User size={20} />
                    </div>
                    <span className="font-semibold text-[#213448]">
                      {row.employee.full_name}
                    </span>
                  </td>
                  <td className="p-5 text-sm text-gray-600">
                    {new Date(row.date).toLocaleDateString('id-ID')}
                  </td>
                  <td className="p-5 text-sm font-semibold text-[#213448]">
                    {row.check_in
                      ? new Date(row.check_in).toLocaleTimeString('id-ID', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })
                      : '-'}
                  </td>
                  <td className="p-5 text-sm font-semibold text-[#213448]">
                    {row.check_out
                      ? new Date(row.check_out).toLocaleTimeString('id-ID', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })
                      : '-'}
                  </td>
                  <td className="p-5 text-sm font-semibold text-[#213448]">
                    {formatDuration(row.work_duration_minutes)}
                  </td>
                  <td className="p-5 text-center">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold ${
                        row.attendance_status === 'PRESENT'
                          ? 'bg-[#94B4C1]/30 text-[#213448]'
                          : row.attendance_status === 'LATE'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {getStatusDisplay(row.attendance_status)}
                    </span>
                  </td>
                  <td className="p-5 text-center">
                    <button
                      onClick={() => setSelectedRow(row)}
                      className="p-2 bg-gray-100 rounded-xl hover:bg-[#94B4C1]/20 hover:text-[#213448] transition-all text-gray-400"
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

      {/* MODAL DETAIL */}
      {selectedRow && (
        <div className="fixed inset-0 bg-[#213448]/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-8 w-full max-w-lg shadow-2xl overflow-y-auto max-h-[90vh]">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-black text-[#213448]">Detail Absensi</h2>
              <button
                onClick={() => setSelectedRow(null)}
                className="p-2 rounded-full hover:bg-gray-100 text-gray-400"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-6">
              <div className="flex items-center gap-3 p-4 bg-[#94B4C1]/10 rounded-2xl border border-[#94B4C1]/20">
                <User className="text-[#547792]" size={24} />
                <div>
                  <p className="font-bold text-lg text-[#213448]">
                    {selectedRow.employee.full_name}
                  </p>
                  <p className="text-sm text-[#547792]">
                    {new Date(selectedRow.date).toLocaleDateString('id-ID', {
                      dateStyle: 'full',
                    })}
                  </p>
                </div>
              </div>

              {selectedRow.checkin_photo && (
                <div className="text-center">
                  <p className="font-semibold mb-2 text-[#213448]">Foto Check-in</p>
                  <img
                    src={`${API_URL}/uploads/${selectedRow.checkin_photo}`}
                    alt="Check-in"
                    className="w-28 h-28 rounded-full object-cover mx-auto border-4 border-white shadow-md"
                  />
                </div>
              )}

              {selectedRow.checkout_photo && (
                <div className="text-center">
                  <p className="font-semibold mb-2 text-[#213448]">Foto Check-out</p>
                  <img
                    src={`${API_URL}/uploads/${selectedRow.checkout_photo}`}
                    alt="Check-out"
                    className="w-28 h-28 rounded-full object-cover mx-auto border-4 border-white shadow-md"
                  />
                </div>
              )}

              {selectedRow.checkin_latitude &&
                selectedRow.checkin_longitude && (
                  <iframe
                    src={getGoogleMapUrl(
                      selectedRow.checkin_latitude,
                      selectedRow.checkin_longitude
                    )!}
                    className="w-full h-48 rounded-2xl border border-gray-200"
                    loading="lazy"
                  />
                )}

              <div className="space-y-2 text-sm font-semibold text-gray-700">
                <p className="flex items-center gap-2 text-[#213448]">
                  <LogIn size={16} className="text-[#547792]" /> Jam Masuk:{' '}
                  {selectedRow.check_in
                    ? new Date(selectedRow.check_in).toLocaleTimeString(
                        'id-ID',
                        { hour: '2-digit', minute: '2-digit' }
                      )
                    : '-'}
                </p>
                <p className="flex items-center gap-2 text-[#213448]">
                  <LogOut size={16} className="text-[#547792]" /> Jam Pulang:{' '}
                  {selectedRow.check_out
                    ? new Date(selectedRow.check_out).toLocaleTimeString(
                        'id-ID',
                        { hour: '2-digit', minute: '2-digit' }
                      )
                    : '-'}
                </p>
                <p className="flex items-center gap-2 text-[#213448]">
                  <Timer size={16} className="text-[#547792]" /> Durasi:{' '}
                  {formatDuration(selectedRow.work_duration_minutes)}
                </p>
                <p className="flex items-center gap-2 text-[#547792] italic">
                  <MapPin size={16} /> {selectedRow.checkin_address}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AttendanceManagement;