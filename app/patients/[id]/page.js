"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import Topbar from "../../../components/Topbar";
import {
  patientIdToPhone,
  useApp,
} from "../../../lib/AppContext";

const STATUS_STYLES = {
  confirmed: { bg: "#E6F7F1", text: "#1a7a50" },
  pending: { bg: "#FFF4E5", text: "#B06000" },
  completed: { bg: "#E8F4FE", text: "#1a5fa6" },
  cancelled: { bg: "#FFE8E8", text: "#c0392b" },
};

function formatShortDate(dateStr) {
  if (!dateStr) return "—";
  const d = new Date(dateStr + "T00:00:00");
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(d);
}

function formatLongDate(dateStr) {
  if (!dateStr) return "—";
  const d = new Date(dateStr + "T00:00:00");
  return new Intl.DateTimeFormat("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(d);
}

function initialsOf(name) {
  if (!name) return "??";
  const parts = name.trim().split(/\s+/).slice(0, 2);
  return parts.map((p) => p[0]?.toUpperCase() || "").join("");
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

export default function PatientProfilePage() {
  const params = useParams();
  const router = useRouter();
  const id = typeof params?.id === "string" ? params.id : Array.isArray(params?.id) ? params.id[0] : "";
  const phone = patientIdToPhone(id);

  const {
    patients,
    bookings,
    consultations,
    patientProfiles,
    setPatientProfile,
    patientNotes,
    setPatientNote,
    setIsSidebarOpen,
  } = useApp();

  const patient = useMemo(
    () => patients.find((p) => p.phone === phone),
    [patients, phone],
  );

  const patientBookings = useMemo(() => {
    return [...bookings]
      .filter((b) => b.patientPhone === phone)
      .sort((a, b) => {
        const da = new Date(a.date + "T00:00:00").getTime();
        const db = new Date(b.date + "T00:00:00").getTime();
        return db - da || a.time.localeCompare(b.time);
      });
  }, [bookings, phone]);

  const patientConsultations = useMemo(() => {
    return [...consultations]
      .filter((c) => c.patientId === id)
      .sort((a, b) => new Date(b.date + "T00:00:00") - new Date(a.date + "T00:00:00"));
  }, [consultations, id]);

  const profile = useMemo(() => {
    const base = patientProfiles[id] || {};
    return {
      bloodGroup: base.bloodGroup || "",
      allergies: base.allergies || "None",
      chronicConditions: base.chronicConditions || [],
    };
  }, [patientProfiles, id]);

  const [tab, setTab] = useState("history");
  const [isEditing, setIsEditing] = useState(false);
  const [draftAge, setDraftAge] = useState(patient?.age ?? "");
  const [draftBlood, setDraftBlood] = useState(profile.bloodGroup);
  const [draftAllergies, setDraftAllergies] = useState(profile.allergies);
  const [draftConditions, setDraftConditions] = useState(
    profile.chronicConditions.join(", "),
  );

  const [notes, setNotes] = useState(patientNotes[id] || "");
  const [prescriptionOpenId, setPrescriptionOpenId] = useState(null);

  if (!patient) {
    return (
      <>
        <Topbar
          title="Patient Not Found"
          onMenuToggle={() => setIsSidebarOpen((open) => !open)}
        />
        <main className="flex-1 overflow-y-auto bg-[#F4F9F9] p-6">
          <div className="flex flex-col items-center justify-center rounded-[10px] bg-white py-16 shadow-sm">
            <p className="text-base font-medium text-[#12333A]">
              Patient not found
            </p>
            <Link
              href="/patients"
              className="mt-4 inline-flex h-9 items-center rounded-lg border border-[#028090]/30 px-4 text-sm font-semibold text-[#028090] hover:bg-[#028090]/10"
            >
              ← Back to Patients
            </Link>
          </div>
        </main>
      </>
    );
  }

  const handleSaveProfile = () => {
    setPatientProfile(id, {
      bloodGroup: draftBlood.trim(),
      allergies: draftAllergies.trim() || "None",
      chronicConditions: draftConditions
        .split(",")
        .map((c) => c.trim())
        .filter(Boolean),
    });
    setIsEditing(false);
  };

  const handleNotesBlur = () => {
    setPatientNote(id, notes);
  };

  const goConsult = () => {
    const params = new URLSearchParams({ patient: patient.name, patientId: id });
    router.push(`/consultation?${params.toString()}`);
  };

  const visitsWithConsult = patientBookings.map((b) => {
    const consult = patientConsultations.find(
      (c) => c.date === b.date && c.patientName === b.patientName,
    );
    return { booking: b, consultation: consult || null };
  });

  const prescriptionsList = patientConsultations
    .filter((c) => c.prescription && c.prescription.length > 0)
    .map((c) => ({
      consultationId: c.id,
      date: c.date,
      diagnosis: c.diagnosis,
      prescription: c.prescription,
    }));

  const TopbarRight = (
    <div className="flex items-center gap-2">
      <Link
        href="/patients"
        className="inline-flex h-9 items-center rounded-lg border border-[#DCEAEC] px-3 text-sm font-semibold text-[#12333A] transition hover:bg-[#F4F9F9]"
      >
        ← Back
      </Link>
      <button
        type="button"
        onClick={goConsult}
        className="inline-flex h-9 items-center rounded-lg bg-[#02C39A] px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-[#02B08B]"
      >
        + New Consultation
      </button>
    </div>
  );

  return (
    <>
      <Topbar
        title={patient.name}
        onMenuToggle={() => setIsSidebarOpen((open) => !open)}
      >
        {TopbarRight}
      </Topbar>

      <main className="flex-1 overflow-y-auto bg-[#F4F9F9] p-4 sm:p-6">
        <div className="flex flex-col gap-6 lg:flex-row">
          <aside className="w-full lg:w-[30%] shrink-0">
            <div className="rounded-[10px] bg-white p-6 shadow-sm">
              <div className="flex flex-col items-center text-center">
                <div className="flex h-24 w-24 items-center justify-center rounded-full bg-[#028090] text-2xl font-bold text-white">
                  {initialsOf(patient.name)}
                </div>
                <h1 className="mt-4 text-xl font-bold text-[#12333A]">
                  {patient.name}
                </h1>
                <p className="mt-1 text-sm text-[#5B7C85]">{patient.phone}</p>
              </div>

              <div className="mt-6 flex items-center justify-between">
                <h2 className="text-sm font-bold uppercase tracking-wider text-[#5B7C85]">
                  Patient Details
                </h2>
                {!isEditing ? (
                  <button
                    type="button"
                    onClick={() => {
                      setDraftAge(patient?.age ?? "");
                      setDraftBlood(profile.bloodGroup);
                      setDraftAllergies(profile.allergies);
                      setDraftConditions(profile.chronicConditions.join(", "));
                      setIsEditing(true);
                    }}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-[#DCEAEC] text-[#5B7C85] transition hover:bg-[#F4F9F9] hover:text-[#028090]"
                    aria-label="Edit patient details"
                  >
                    ✏️
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="inline-flex h-8 items-center rounded-lg border border-[#DCEAEC] px-3 text-xs font-semibold text-[#5B7C85] hover:bg-[#F4F9F9]"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleSaveProfile}
                      className="inline-flex h-8 items-center rounded-lg bg-[#02C39A] px-3 text-xs font-semibold text-white hover:bg-[#02B08B]"
                    >
                      Save
                    </button>
                  </div>
                )}
              </div>

              <div className="mt-4 space-y-3 text-sm">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#5B7C85]">
                    Age
                  </label>
                  {isEditing ? (
                    <input
                      type="number"
                      value={draftAge}
                      onChange={(e) => setDraftAge(e.target.value)}
                      className="mt-1 w-full h-9 rounded-lg border border-[#DCEAEC] bg-white px-3 text-sm text-[#12333A] focus:border-[#028090] focus:outline-none focus:ring-2 focus:ring-[#028090]/20"
                    />
                  ) : (
                    <p className="mt-1 font-medium text-[#12333A]">
                      {patient.age || "—"} years
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#5B7C85]">
                    Blood Group
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={draftBlood}
                      onChange={(e) => setDraftBlood(e.target.value)}
                      placeholder="e.g. O+"
                      className="mt-1 w-full h-9 rounded-lg border border-[#DCEAEC] bg-white px-3 text-sm text-[#12333A] focus:border-[#028090] focus:outline-none focus:ring-2 focus:ring-[#028090]/20"
                    />
                  ) : (
                    <p className="mt-1 font-medium text-[#12333A]">
                      {profile.bloodGroup || "—"}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#5B7C85]">
                    Allergies
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={draftAllergies}
                      onChange={(e) => setDraftAllergies(e.target.value)}
                      placeholder="None / Penicillin, etc."
                      className="mt-1 w-full h-9 rounded-lg border border-[#DCEAEC] bg-white px-3 text-sm text-[#12333A] focus:border-[#028090] focus:outline-none focus:ring-2 focus:ring-[#028090]/20"
                    />
                  ) : (
                    <p className="mt-1 font-medium text-[#12333A]">
                      {profile.allergies || "None"}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#5B7C85]">
                    Chronic Conditions
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={draftConditions}
                      onChange={(e) => setDraftConditions(e.target.value)}
                      placeholder="Comma-separated"
                      className="mt-1 w-full h-9 rounded-lg border border-[#DCEAEC] bg-white px-3 text-sm text-[#12333A] focus:border-[#028090] focus:outline-none focus:ring-2 focus:ring-[#028090]/20"
                    />
                  ) : profile.chronicConditions.length === 0 ? (
                    <p className="mt-1 font-medium text-[#12333A]">None</p>
                  ) : (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {profile.chronicConditions.map((cond) => (
                        <span
                          key={cond}
                          className="inline-flex h-7 items-center rounded-full bg-[#FFF4E5] px-3 text-xs font-semibold text-[#B06000]"
                        >
                          {cond}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </aside>

          <section className="flex-1 min-w-0">
            <div className="rounded-[10px] bg-white shadow-sm overflow-hidden">
              <div className="flex border-b border-[#DCEAEC] px-4 sm:px-6">
                {[
                  { id: "history", label: "Visit History" },
                  { id: "prescriptions", label: "Prescriptions" },
                  { id: "notes", label: "Notes" },
                ].map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setTab(t.id)}
                    className={`relative px-4 py-4 text-sm font-semibold transition ${
                      tab === t.id
                        ? "text-[#028090]"
                        : "text-[#5B7C85] hover:text-[#12333A]"
                    }`}
                  >
                    {t.label}
                    {tab === t.id && (
                      <span className="absolute left-0 right-0 bottom-0 h-[3px] bg-[#028090] rounded-t" />
                    )}
                  </button>
                ))}
              </div>

              <div className="p-4 sm:p-6">
                {tab === "history" && (
                  <div className="flex flex-col gap-4">
                    {visitsWithConsult.length === 0 ? (
                      <div className="py-10 text-center text-sm text-[#5B7C85]">
                        No visits on record yet.
                      </div>
                    ) : (
                      visitsWithConsult.map(({ booking, consultation }) => (
                        <div
                          key={booking.id}
                          className="rounded-lg border-l-[4px] border-[#028090] bg-[#F4F9F9] p-4"
                        >
                          <div className="flex flex-wrap items-start justify-between gap-2">
                            <div>
                              <p className="font-bold text-[#12333A]">
                                {formatLongDate(booking.date)} · {booking.time}
                              </p>
                              <p className="mt-1 text-sm text-[#5B7C85]">
                                {booking.service}
                              </p>
                            </div>
                            <StatusBadge status={booking.status} />
                          </div>

                          {consultation && (
                            <div className="mt-4 space-y-2 rounded-lg bg-white p-4 border border-[#DCEAEC]">
                              <div>
                                <span className="text-xs font-semibold uppercase tracking-wider text-[#5B7C85]">
                                  Diagnosis:{" "}
                                </span>
                                <span className="text-sm font-medium text-[#12333A]">
                                  {consultation.diagnosis}
                                </span>
                              </div>
                              {consultation.followUpDate && (
                                <div>
                                  <span className="text-xs font-semibold uppercase tracking-wider text-[#5B7C85]">
                                    Follow-up:{" "}
                                  </span>
                                  <span className="text-sm font-medium text-[#1a5fa6]">
                                    {formatShortDate(consultation.followUpDate)}
                                  </span>
                                </div>
                              )}
                              {consultation.prescription &&
                                consultation.prescription.length > 0 && (
                                  <div className="pt-2">
                                    <button
                                      type="button"
                                      onClick={() =>
                                        setPrescriptionOpenId(
                                          prescriptionOpenId ===
                                            `rx-${consultation.id}`
                                            ? null
                                            : `rx-${consultation.id}`,
                                        )
                                      }
                                      className="inline-flex h-8 items-center rounded-lg border border-[#028090]/30 px-3 text-xs font-semibold text-[#028090] transition hover:bg-[#028090]/10"
                                    >
                                      View Prescription
                                    </button>
                                    {prescriptionOpenId ===
                                      `rx-${consultation.id}` && (
                                      <PrescriptionDetail
                                        prescription={consultation.prescription}
                                      />
                                    )}
                                  </div>
                                )}
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                )}

                {tab === "prescriptions" && (
                  <div className="flex flex-col gap-3">
                    {prescriptionsList.length === 0 ? (
                      <div className="py-10 text-center text-sm text-[#5B7C85]">
                        No prescriptions yet.
                      </div>
                    ) : (
                      prescriptionsList.map((p) => (
                        <div
                          key={p.consultationId}
                          className="rounded-lg border border-[#DCEAEC] bg-white overflow-hidden"
                        >
                          <div className="flex flex-wrap items-center justify-between gap-2 p-4">
                            <div>
                              <p className="text-sm font-semibold text-[#12333A]">
                                {formatShortDate(p.date)}
                              </p>
                              <p className="text-xs text-[#5B7C85]">
                                {p.diagnosis}
                              </p>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="rounded-full bg-[#E8F4FE] px-3 py-1 text-xs font-semibold text-[#1a5fa6]">
                                {p.prescription.length} medicine
                                {p.prescription.length === 1 ? "" : "s"}
                              </span>
                              <button
                                type="button"
                                onClick={() =>
                                  setPrescriptionOpenId(
                                    prescriptionOpenId ===
                                      `list-${p.consultationId}`
                                      ? null
                                      : `list-${p.consultationId}`,
                                  )
                                }
                                className="inline-flex h-8 items-center rounded-lg border border-[#028090]/30 px-3 text-xs font-semibold text-[#028090] transition hover:bg-[#028090]/10"
                              >
                                View Full →
                              </button>
                            </div>
                          </div>
                          {prescriptionOpenId === `list-${p.consultationId}` && (
                            <div className="border-t border-[#DCEAEC]">
                              <PrescriptionDetail prescription={p.prescription} />
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                )}

                {tab === "notes" && (
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-[#5B7C85]">
                      Doctor&apos;s Notes
                    </label>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      onBlur={handleNotesBlur}
                      rows={12}
                      placeholder="Record observations, lifestyle advice, follow-up reminders, etc. Saves automatically when you click outside."
                      className="mt-2 w-full rounded-lg border border-[#DCEAEC] bg-white p-4 text-sm text-[#12333A] resize-y focus:border-[#028090] focus:outline-none focus:ring-2 focus:ring-[#028090]/20"
                    />
                    <p className="mt-2 text-xs text-[#5B7C85]">
                      💾 Auto-saves when you click outside this box.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </section>
        </div>
      </main>
    </>
  );
}

function PrescriptionDetail({ prescription }) {
  return (
    <div className="bg-[#F4F9F9] p-4 sm:p-5">
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-[11px] font-semibold uppercase tracking-wider text-[#5B7C85] border-b border-[#DCEAEC]">
              <th className="text-left py-3 pr-3 min-w-[180px]">Medicine</th>
              <th className="text-left py-3 pr-3 min-w-[100px]">Strength</th>
              <th className="text-left py-3 pr-3 min-w-[220px]">Dosage / Schedule</th>
              <th className="text-left py-3 min-w-[100px]">Duration</th>
            </tr>
          </thead>
          <tbody>
            {prescription.map((m, idx) => {
              const dose = m.dosage || "";
              const low = dose.toLowerCase();
              let morning = "—";
              let afternoon = "—";
              let night = "—";

              if (low.includes("once daily") || low.includes("od")) {
                morning = "✓";
              } else if (low.includes("twice daily") || low.includes("bd")) {
                morning = "✓";
                night = "✓";
              } else if (low.includes("thrice daily") || low.includes("tds")) {
                morning = "✓";
                afternoon = "✓";
                night = "✓";
              } else if (low.includes("before breakfast")) {
                morning = "Before food";
              } else if (low.includes("at night") || low.includes("night")) {
                night = "✓";
              } else if (low.includes("weekly")) {
                morning = "Weekly";
              } else if (low.includes("as needed") || low.includes("sos")) {
                morning = "SOS";
              }

              return (
                <tr key={`${m.id || idx}`} className="border-b border-[#DCEAEC]/50 last:border-0">
                  <td className="py-3 pr-3">
                    <p className="font-semibold text-[#12333A]">{m.name}</p>
                    <p className="text-[11px] text-[#5B7C85]">{m.type}</p>
                  </td>
                  <td className="py-3 pr-3 text-[#12333A]">{m.strength}</td>
                  <td className="py-3 pr-3">
                    <div className="grid grid-cols-3 gap-1 text-[11px] text-center">
                      <div className="rounded bg-white px-2 py-1 border border-[#DCEAEC]">
                        <div className="font-semibold text-[#5B7C85]">M</div>
                        <div className="mt-0.5 text-[#028090] font-medium">{morning}</div>
                      </div>
                      <div className="rounded bg-white px-2 py-1 border border-[#DCEAEC]">
                        <div className="font-semibold text-[#5B7C85]">A</div>
                        <div className="mt-0.5 text-[#028090] font-medium">{afternoon}</div>
                      </div>
                      <div className="rounded bg-white px-2 py-1 border border-[#DCEAEC]">
                        <div className="font-semibold text-[#5B7C85]">N</div>
                        <div className="mt-0.5 text-[#028090] font-medium">{night}</div>
                      </div>
                    </div>
                    <p className="mt-1 text-[11px] text-[#5B7C85]">{dose}</p>
                  </td>
                  <td className="py-3 text-[#12333A]">{m.duration || "—"}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
