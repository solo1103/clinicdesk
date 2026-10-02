"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Topbar from "../../components/Topbar";
import { useApp } from "../../lib/AppContext";

const STATUS_STYLES = {
  confirmed: { bg: "#E6F7F1", text: "#1a7a50" },
  pending: { bg: "#FFF4E5", text: "#B06000" },
  completed: { bg: "#E8F4FE", text: "#1a5fa6" },
  cancelled: { bg: "#FFE8E8", text: "#c0392b" },
};

function getTodayDateStr() {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function formatDisplayDate(dateStr) {
  const d = new Date(dateStr + "T00:00:00");
  return new Intl.DateTimeFormat("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(d);
}

function formatShortDate(dateStr) {
  const d = new Date(dateStr + "T00:00:00");
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(d);
}

function parseTimeToMinutes(timeStr) {
  const match = timeStr.match(/^(\d{1,2}):(\d{2})\s?(AM|PM)$/i);
  if (!match) return 0;
  let h = parseInt(match[1], 10);
  const m = parseInt(match[2], 10);
  const ap = match[3].toUpperCase();
  if (ap === "PM" && h !== 12) h += 12;
  if (ap === "AM" && h === 12) h = 0;
  return h * 60 + m;
}

function StatCard({ label, value, highlight }) {
  return (
    <div
      className={`rounded-[10px] shadow-sm px-5 py-5 ${
        highlight ? "bg-[#013A47]" : "bg-white"
      }`}
    >
      <p
        className={`text-[11px] font-semibold uppercase tracking-wider ${
          highlight ? "text-white/50" : "text-[#5B7C85]"
        }`}
      >
        {label}
      </p>
      <p
        className={`mt-2 text-2xl sm:text-3xl font-bold ${
          highlight ? "text-[#02C39A]" : "text-[#12333A]"
        }`}
      >
        {value}
      </p>
    </div>
  );
}

function StatusBadge({ status }) {
  const style = STATUS_STYLES[status] || STATUS_STYLES.pending;
  const cap = status.charAt(0).toUpperCase() + status.slice(1);
  return (
    <span
      className="inline-flex h-7 items-center rounded-full px-3 text-xs font-semibold"
      style={{ backgroundColor: style.bg, color: style.text }}
    >
      {cap}
    </span>
  );
}

function TimeBadge({ time }) {
  const match = time.match(/^(\d{1,2}):(\d{2})\s?(AM|PM)$/i);
  const hhmm = match ? `${match[1]}:${match[2]}` : time;
  const ap = match ? match[3].toUpperCase() : "";
  return (
    <div className="flex h-14 w-16 shrink-0 flex-col items-center justify-center rounded-lg bg-[#028090] text-white">
      <span className="text-sm font-bold leading-none">{hhmm}</span>
      <span className="mt-1 text-[10px] font-semibold leading-none tracking-wider">
        {ap}
      </span>
    </div>
  );
}

export default function DashboardPage() {
  const { bookings, setBookings, setIsSidebarOpen } = useApp();
  const router = useRouter();
  const today = getTodayDateStr();

  const todayBookings = useMemo(
    () =>
      bookings
        .filter((b) => b.date === today)
        .sort((a, b) => parseTimeToMinutes(a.time) - parseTimeToMinutes(b.time)),
    [bookings, today],
  );

  const stats = useMemo(() => {
    const todays = bookings.filter((b) => b.date === today);
    const confirmed = todays.filter((b) => b.status === "confirmed").length;
    const pending = todays.filter((b) => b.status === "pending").length;
    const revenue = todays
      .filter((b) => b.status === "completed")
      .reduce((sum, b) => sum + (b.price || 0), 0);
    return {
      total: todays.length,
      confirmed,
      pending,
      revenue: `₹${revenue.toLocaleString("en-IN")}`,
    };
  }, [bookings, today]);

  const recentBookings = useMemo(() => {
    const sorted = [...bookings].sort((a, b) => {
      const da = new Date(a.date + "T00:00:00").getTime();
      const db = new Date(b.date + "T00:00:00").getTime();
      if (db !== da) return db - da;
      return parseTimeToMinutes(a.time) - parseTimeToMinutes(b.time);
    });
    return sorted.slice(0, 5);
  }, [bookings]);

  const handleMarkDone = (id) => {
    setBookings((prev) =>
      prev.map((b) => (b.id === id ? { ...b, status: "completed" } : b)),
    );
  };

  const handleCancel = (id, patientName) => {
    if (window.confirm(`Cancel booking for ${patientName}?`)) {
      setBookings((prev) =>
        prev.map((b) => (b.id === id ? { ...b, status: "cancelled" } : b)),
      );
    }
  };

  const handleConsult = (booking) => {
    const params = new URLSearchParams({
      patient: booking.patientName,
      bookingId: booking.id,
    });
    router.push(`/consultation?${params.toString()}`);
  };

  const handleRowClick = (patientName) => {
    router.push(`/patients?filter=${encodeURIComponent(patientName)}`);
  };

  const todayDisplay = formatDisplayDate(today);

  return (
    <>
      <Topbar
        title="Dashboard"
        onMenuToggle={() => setIsSidebarOpen((open) => !open)}
      />
      <main className="flex-1 overflow-y-auto bg-[#F4F9F9] p-4 sm:p-6">
        <div className="grid grid-cols-2 gap-4 mb-6 lg:grid-cols-4">
          <StatCard label="Today's Appointments" value={stats.total} />
          <StatCard label="Confirmed" value={stats.confirmed} />
          <StatCard label="Pending" value={stats.pending} />
          <StatCard label="Revenue Today" value={stats.revenue} highlight />
        </div>

        <section className="mb-6">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-[#12333A]">
                Today&apos;s Schedule
              </h2>
              <p className="text-sm text-[#5B7C85]">{todayDisplay}</p>
            </div>
            <Link
              href="/bookings?new=1"
              className="inline-flex h-9 items-center rounded-lg bg-[#02C39A] px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-[#02B08B]"
            >
              + Add Booking
            </Link>
          </div>

          {todayBookings.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-[10px] bg-white py-16 shadow-sm">
              <span className="mb-3 text-5xl" aria-hidden="true">
                📅
              </span>
              <p className="text-base font-medium text-[#12333A]">
                No appointments today
              </p>
              <p className="mt-1 text-sm text-[#5B7C85]">
                Enjoy the quiet, or add a booking to get started.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {todayBookings.map((b) => {
                const showActions =
                  b.status === "confirmed" || b.status === "pending";
                return (
                  <div
                    key={b.id}
                    className="flex flex-col gap-4 rounded-[10px] bg-white p-4 shadow-sm sm:flex-row sm:items-center"
                  >
                    <TimeBadge time={b.time} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-bold text-[#12333A]">
                        {b.patientName}
                      </p>
                      <p className="truncate text-sm text-[#5B7C85]">
                        {b.patientPhone}
                      </p>
                      <p className="mt-1 text-xs font-medium text-[#5B7C85]">
                        {b.service} · ₹{b.price}
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <StatusBadge status={b.status} />
                      {showActions && (
                        <>
                          <button
                            type="button"
                            onClick={() => handleMarkDone(b.id)}
                            className="inline-flex h-8 items-center rounded-lg bg-[#02C39A] px-3 text-xs font-semibold text-white shadow-sm transition hover:bg-[#02B08B]"
                          >
                            ✓ Done
                          </button>
                          <button
                            type="button"
                            onClick={() => handleCancel(b.id, b.patientName)}
                            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-[#c0392b]/30 text-[#c0392b] transition hover:bg-[#c0392b]/10"
                            aria-label="Cancel booking"
                          >
                            ✕
                          </button>
                          <button
                            type="button"
                            onClick={() => handleConsult(b)}
                            className="inline-flex h-8 items-center rounded-lg border border-[#028090]/30 px-3 text-xs font-semibold text-[#028090] transition hover:bg-[#028090]/10"
                          >
                            🩺 Consult
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        <section>
          <div className="mb-4">
            <h2 className="text-lg font-bold text-[#12333A]">Recent Activity</h2>
            <p className="text-sm text-[#5B7C85]">Latest bookings across all dates</p>
          </div>
          <div className="overflow-hidden rounded-[10px] bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b border-[#DCEAEC] text-left text-[11px] font-semibold uppercase tracking-wider text-[#5B7C85]">
                    <th className="px-5 py-3">Date</th>
                    <th className="px-5 py-3">Patient</th>
                    <th className="px-5 py-3">Service</th>
                    <th className="px-5 py-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentBookings.map((b) => (
                    <tr
                      key={b.id}
                      onClick={() => handleRowClick(b.patientName)}
                      className="cursor-pointer border-b border-[#DCEAEC]/50 last:border-0 transition hover:bg-[#F4F9F9]"
                    >
                      <td className="whitespace-nowrap px-5 py-4 font-medium text-[#12333A]">
                        {formatShortDate(b.date)}
                      </td>
                      <td className="whitespace-nowrap px-5 py-4 font-semibold text-[#12333A]">
                        {b.patientName}
                      </td>
                      <td className="whitespace-nowrap px-5 py-4 text-[#5B7C85]">
                        {b.service}
                      </td>
                      <td className="whitespace-nowrap px-5 py-4">
                        <StatusBadge status={b.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
