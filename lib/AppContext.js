"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";

const INITIAL_BOOKINGS = [
  {
    id: "bkg-1",
    patientName: "John Smith",
    patientPhone: "+1 415 555 0101",
    patientAge: 42,
    service: "General consultation",
    price: 50,
    date: "2026-09-27",
    time: "10:00 AM",
    status: "confirmed",
    notes: "Annual check-up. Mentioned mild fatigue.",
  },
  {
    id: "bkg-2",
    patientName: "Sarah Connor",
    patientPhone: "+1 415 555 0102",
    patientAge: 38,
    service: "Dermatology review",
    price: 80,
    date: "2026-09-27",
    time: "11:30 AM",
    status: "pending",
    notes: "Follow-up for rash on forearm.",
  },
  {
    id: "bkg-3",
    patientName: "James Brown",
    patientPhone: "+1 628 555 0144",
    patientAge: 56,
    service: "Follow-up visit",
    price: 40,
    date: "2026-09-20",
    time: "09:15 AM",
    status: "completed",
    notes: "Blood pressure stable. Continue current plan.",
  },
  {
    id: "bkg-4",
    patientName: "Emma Wilson",
    patientPhone: "+1 510 555 0188",
    patientAge: 8,
    service: "Pediatric wellness",
    price: 60,
    date: "2026-10-03",
    time: "04:00 PM",
    status: "confirmed",
    notes: "School physical and vaccination review.",
  },
  {
    id: "bkg-5",
    patientName: "Michael Davis",
    patientPhone: "+1 925 555 0162",
    patientAge: 34,
    service: "Dental cleaning",
    price: 90,
    date: "2026-09-12",
    time: "02:30 PM",
    status: "completed",
    notes: "Scaling completed. Next hygiene in 6 months.",
  },
  {
    id: "bkg-6",
    patientName: "Olivia Taylor",
    patientPhone: "+1 650 555 0190",
    patientAge: 29,
    service: "New patient visit",
    price: 70,
    date: "2026-10-08",
    time: "10:45 AM",
    status: "pending",
    notes: "First visit. History of seasonal allergies.",
  },
  {
    id: "bkg-7",
    patientName: "Robert Johnson",
    patientPhone: "+1 408 555 0133",
    patientAge: 61,
    service: "BP review",
    price: 45,
    date: "2026-09-27",
    time: "04:00 PM",
    status: "confirmed",
    notes: "Bring latest home BP log.",
  },
  {
    id: "bkg-8",
    patientName: "Lisa Anderson",
    patientPhone: "+1 707 555 0177",
    patientAge: 47,
    service: "Consultation",
    price: 50,
    date: "2026-09-18",
    time: "01:00 PM",
    status: "cancelled",
    notes: "Patient rescheduled due to travel.",
  },
  {
    id: "bkg-9",
    patientName: "David Lee",
    patientPhone: "+1 831 555 0121",
    patientAge: 51,
    service: "Minor procedure",
    price: 150,
    date: "2026-10-15",
    time: "09:00 AM",
    status: "confirmed",
    notes: "Skin lesion excision. Consent on file.",
  },
];

const INITIAL_HOLIDAYS = [
  {
    id: "hol-1",
    date: "2026-10-02",
    reason: "Gandhi Jayanti — clinic closed",
  },
  {
    id: "hol-2",
    date: "2026-12-25",
    reason: "Christmas Day — clinic closed",
  },
];

const INITIAL_MEDICINES = [
  {
    id: "med-1",
    name: "Amoxicillin",
    type: "Capsule",
    strength: "500mg",
    category: "Antibiotic",
  },
  {
    id: "med-2",
    name: "Paracetamol",
    type: "Tablet",
    strength: "650mg",
    category: "Painkiller",
  },
  {
    id: "med-3",
    name: "Omeprazole",
    type: "Capsule",
    strength: "20mg",
    category: "Antacid",
  },
  {
    id: "med-4",
    name: "Cetirizine",
    type: "Tablet",
    strength: "10mg",
    category: "Antiallergic",
  },
  {
    id: "med-5",
    name: "Azithromycin",
    type: "Tablet",
    strength: "250mg",
    category: "Antibiotic",
  },
  {
    id: "med-6",
    name: "Metformin",
    type: "Tablet",
    strength: "500mg",
    category: "Diabetes",
  },
  {
    id: "med-7",
    name: "Atorvastatin",
    type: "Tablet",
    strength: "10mg",
    category: "Other",
  },
  {
    id: "med-8",
    name: "Amlodipine",
    type: "Tablet",
    strength: "5mg",
    category: "BP",
  },
  {
    id: "med-9",
    name: "Pantoprazole",
    type: "Tablet",
    strength: "40mg",
    category: "Antacid",
  },
  {
    id: "med-10",
    name: "Ibuprofen",
    type: "Tablet",
    strength: "400mg",
    category: "Painkiller",
  },
  {
    id: "med-11",
    name: "Vitamin D3",
    type: "Capsule",
    strength: "60000IU",
    category: "Vitamin",
  },
  {
    id: "med-12",
    name: "Vitamin B12",
    type: "Tablet",
    strength: "500mcg",
    category: "Vitamin",
  },
  {
    id: "med-13",
    name: "Levothyroxine",
    type: "Tablet",
    strength: "50mcg",
    category: "Other",
  },
  {
    id: "med-14",
    name: "Metronidazole",
    type: "Tablet",
    strength: "400mg",
    category: "Antibiotic",
  },
  {
    id: "med-15",
    name: "Doxycycline",
    type: "Capsule",
    strength: "100mg",
    category: "Antibiotic",
  },
  {
    id: "med-16",
    name: "Clobetasol Cream",
    type: "Cream",
    strength: "0.05%",
    category: "Other",
  },
  {
    id: "med-17",
    name: "Clotrimazole Cream",
    type: "Cream",
    strength: "1%",
    category: "Other",
  },
  {
    id: "med-18",
    name: "Salbutamol Inhaler",
    type: "Inhaler",
    strength: "100mcg",
    category: "Other",
  },
  {
    id: "med-19",
    name: "Montelukast",
    type: "Tablet",
    strength: "10mg",
    category: "Antiallergic",
  },
  {
    id: "med-20",
    name: "Losartan",
    type: "Tablet",
    strength: "50mg",
    category: "BP",
  },
];

export function phoneToPatientId(phone) {
  return encodeURIComponent(phone);
}

export function patientIdToPhone(id) {
  return decodeURIComponent(id);
}

const INITIAL_CONSULTATIONS = [
  {
    id: "con-1",
    patientId: phoneToPatientId("+1 628 555 0144"),
    patientName: "James Brown",
    date: "2026-09-20",
    diagnosis: "Essential hypertension — controlled",
    notes: "Continue lifestyle measures. Review home BP diary next visit.",
    followUpDate: "2026-10-20",
    prescription: [
      { ...INITIAL_MEDICINES[7], dosage: "Once daily", duration: "30 days" },
      { ...INITIAL_MEDICINES[19], dosage: "Once daily", duration: "30 days" },
    ],
  },
  {
    id: "con-2",
    patientId: phoneToPatientId("+1 925 555 0162"),
    patientName: "Michael Davis",
    date: "2026-09-12",
    diagnosis: "Gingivitis; routine prophylaxis",
    notes: "Advised twice-daily brushing and flossing. No active caries.",
    followUpDate: "2027-03-12",
    prescription: [
      { ...INITIAL_MEDICINES[1], dosage: "As needed for pain", duration: "3 days" },
    ],
  },
  {
    id: "con-3",
    patientId: phoneToPatientId("+1 415 555 0101"),
    patientName: "John Smith",
    date: "2026-08-14",
    diagnosis: "Vitamin D deficiency; mild gastritis",
    notes: "Labs reviewed. Start weekly D3. Avoid late meals.",
    followUpDate: "2026-09-27",
    prescription: [
      { ...INITIAL_MEDICINES[10], dosage: "Once weekly", duration: "8 weeks" },
      { ...INITIAL_MEDICINES[8], dosage: "Before breakfast", duration: "14 days" },
    ],
  },
  {
    id: "con-4",
    patientId: phoneToPatientId("+1 415 555 0102"),
    patientName: "Sarah Connor",
    date: "2026-08-30",
    diagnosis: "Contact dermatitis",
    notes: "Patch likely from new detergent. Short course topical steroid.",
    followUpDate: "2026-09-27",
    prescription: [
      { ...INITIAL_MEDICINES[15], dosage: "Thin layer twice daily", duration: "7 days" },
      { ...INITIAL_MEDICINES[3], dosage: "Once at night", duration: "7 days" },
    ],
  },
];

const INITIAL_PATIENT_PROFILES = {
  [phoneToPatientId("+1 415 555 0101")]: {
    bloodGroup: "O+",
    allergies: "Penicillin",
    chronicConditions: ["Vitamin D deficiency"],
  },
  [phoneToPatientId("+1 415 555 0102")]: {
    bloodGroup: "A+",
    allergies: "None",
    chronicConditions: [],
  },
  [phoneToPatientId("+1 628 555 0144")]: {
    bloodGroup: "B+",
    allergies: "Sulfa drugs",
    chronicConditions: ["Hypertension"],
  },
  [phoneToPatientId("+1 510 555 0188")]: {
    bloodGroup: "AB+",
    allergies: "Peanuts",
    chronicConditions: ["Asthma"],
  },
  [phoneToPatientId("+1 925 555 0162")]: {
    bloodGroup: "O-",
    allergies: "None",
    chronicConditions: [],
  },
};

const INITIAL_PATIENT_NOTES = {
  [phoneToPatientId("+1 628 555 0144")]:
    "Home BP readings trending well. Weight stable. Advised DASH diet continuation. Family history of CVD — father had MI at 62.\n\nNext review in 4 weeks with log.",
};

function derivePatients(bookings) {
  const unique = new Map();

  for (const booking of bookings) {
    if (unique.has(booking.patientPhone)) {
      continue;
    }

    unique.set(booking.patientPhone, {
      id: phoneToPatientId(booking.patientPhone),
      name: booking.patientName,
      phone: booking.patientPhone,
      age: booking.patientAge,
    });
  }

  return Array.from(unique.values());
}

const AppContext = createContext(null);

export function AppContextProvider({ children }) {
  const [bookings, setBookings] = useState(INITIAL_BOOKINGS);
  const [holidays, setHolidays] = useState(INITIAL_HOLIDAYS);
  const [medicines, setMedicines] = useState(INITIAL_MEDICINES);
  const [consultations, setConsultations] = useState(INITIAL_CONSULTATIONS);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [patientProfiles, setPatientProfiles] = useState(INITIAL_PATIENT_PROFILES);
  const [patientNotes, setPatientNotes] = useState(INITIAL_PATIENT_NOTES);

  const patients = useMemo(() => derivePatients(bookings), [bookings]);

  const setPatientProfile = useCallback((patientId, profilePatch) => {
    setPatientProfiles((prev) => ({
      ...prev,
      [patientId]: {
        bloodGroup: "",
        allergies: "None",
        chronicConditions: [],
        ...(prev[patientId] || {}),
        ...profilePatch,
      },
    }));
  }, []);

  const setPatientNote = useCallback((patientId, noteText) => {
    setPatientNotes((prev) => ({ ...prev, [patientId]: noteText }));
  }, []);

  const value = {
    bookings,
    setBookings,
    holidays,
    setHolidays,
    medicines,
    setMedicines,
    consultations,
    setConsultations,
    patients,
    isSidebarOpen,
    setIsSidebarOpen,
    patientProfiles,
    setPatientProfile,
    patientNotes,
    setPatientNote,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);

  if (!context) {
    throw new Error("useApp must be used within AppContextProvider");
  }

  return context;
}
