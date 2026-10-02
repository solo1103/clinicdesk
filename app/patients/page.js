"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import Topbar from "../../components/Topbar";
import { useApp } from "../../lib/AppContext";

function getTodayDateStr() {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function getMonthRange() {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = now.getMonth();
  const start = new Date(yyyy, mm, 1);
  const end = new Date(yyyy, mm + 1, 0, 23, 59, 59);
  return { start, end };
}

function formatShortDate(dateStr) {
  if (!dateStr) return "—";
  const d = new Date(dateStr + "T00:00:00");
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(d);
}

function initialsOf(name) {
  if (!name) return "??";
  const parts = name.trim().split(/\s+/).slice(0, 2);
  return parts.map((p) => p[0]?.toUpperCase() || "").join("");
}

function PatientAvatar({ name, size = "md" }) {
  const sizeClasses =
    size === "lg"
      ? "h-24 w-24 text-2xl"
      : size === "md"
        ? "h-12 w-12 text-sm"
        : "h-10 w-10 text-xs";
  return (
    <div
      className={`flex shrink-0 items-center justify-center rounded-full bg-[#028090] font-bold text-white ${sizeClasses}`}
      aria-hidden="true"
    >
      {initialsOf(name)}
    </div>
  );
}

function buildPatientStats(patient, bookings) {
  const patientBookings = bookings.filter((b) => b.patientPhone === patient.phone);
  const totalVisits = patientBookings.length;
  const totalPaid = patientBookings
    .filter((b) => b.status === "completed")
    .reduce((sum, b) => sum + (b.price || 0), 0);

  const completedDates = patientBookings
    .filter((b) => b.status === "completed")
    .map((b) => b.date);

  let lastVisit = null;
  if (completedDates.length > 0) {
    lastVisit = completedDates.sort().slice(-1)[0];
  }

  const firstBookingDate =
    patientBookings.length > 0
      ? [...patientBookings].map((b) => b.date).sort()[0]
      : null;

  const hasVisitToday = patientBookings.some((b) => b.date === getTodayDateStr());

  return { totalVisits, totalPaid, lastVisit, firstBookingDate, hasVisitToday };
}

export default function PatientsPage() {
  const { patients, bookings, setIsSidebarOpen } = useApp();
  const router = useRouter();
  const searchParams = useSearchParams();
  const prefillFilter = searchParams.get("filter") || "";

  const [query, setQuery] = useState(prefillFilter);
  const [filter, setFilter] = useState("all");

  const today = getTodayDateStr();
  const { start: monthStart } = getMonthRange();

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const todayStr = today;

    return patients
      .map((p) => ({ patient: p, stats: buildPatientStats(p, bookings) }))
      .filter(({ patient, stats }) => {
        if (q) {
          const inName = patient.name.toLowerCase().includes(q);
          const inPhone = patient.phone.toLowerCase().includes(q);
          if (!inName && !inPhone) return false;
        }

        if (filter === "today") {
          if (!stats.hasVisitToday) return false;
        }

        if (filter === "newThisMonth") {
          if (!stats.firstBookingDate) return false;
          const first = new Date(stats.firstBookingDate + "T00:00:00");
          if (first < monthStart) return false;
        }

        return true;
      })
      .sort((a, b) => a.patient.name.localeCompare(b.patient.name));
  }, [patients, bookings, query, filter, today, monthStart]);

  return (
    <>
      <Topbar
        title="Patients"
        onMenuToggle={() => setIsSidebarOpen((open) => !open)}
      />
      <main className="flex-1 overflow-y-auto bg-[#F4F9F9] p-4 sm:p-6">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1 sm:max-w-md">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="🔍 Search by name or phone..."
              className="w-full h-11 rounded-lg border border-[#DCEAEC] bg-white px-4 text-sm text-[#12333A] placeholder:text-[#5B7C85] shadow-sm focus:border-[#028090] focus:outline-none focus:ring-2 focus:ring-[#028090]/20"
            />
          </div>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="h-11 rounded-lg border border-[#DCEAEC] bg-white px-4 text-sm font-medium text-[#12333A] shadow-sm focus:border-[#028090] focus:outline-none focus:ring-2 focus:ring-[#028090]/20"
          >
            <option value="all">All Patients</option>
            <option value="today">Seen Today</option>
            <option value="newThisMonth">New This Month</option>
          </select>
        </div>

        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-[10px] bg-white py-16 shadow-sm">
            <span className="mb-3 text-5xl" aria-hidden="true">
              🔍
            </span>
            <p className="text-base font-medium text-[#12333A]">
              No patients found
            </p>
            <p className="mt-1 text-sm text-[#5B7C85]">
              Try adjusting your search or filter.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {filtered.map(({ patient, stats }) => (
              <Link
                key={patient.id}
                href={`/patients/${patient.id}`}
                className="group block rounded-[10px] bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md cursor-pointer"
              >
                <div className="flex items-start gap-4">
                  <PatientAvatar name={patient.name} size="md" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-bold text-[#12333A]">
                      {patient.name}
                    </p>
                    <p className="truncate text-sm text-[#5B7C85]">
                      {patient.phone}
                    </p>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-3 gap-2 rounded-lg bg-[#F4F9F9] p-3 text-center">
                  <div>
                    <p className="text-xs text-[#5B7C85]">📅 Visits</p>
                    <p className="mt-1 text-sm font-bold text-[#12333A]">
                      {stats.totalVisits}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-[#5B7C85]">💰 Paid</p>
                    <p className="mt-1 text-sm font-bold text-[#12333A]">
                      ₹{stats.totalPaid.toLocaleString("en-IN")}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-[#5B7C85]">🕐 Last</p>
                    <p className="mt-1 text-xs font-bold text-[#12333A]">
                      {formatShortDate(stats.lastVisit)}
                    </p>
                  </div>
                </div>

                <div className="mt-4 text-right">
                  <span className="inline-flex items-center text-sm font-semibold text-[#028090] transition group-hover:text-[#026674]">
                    View Profile →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </>
  );
}
