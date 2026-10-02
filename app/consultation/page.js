'use client'
import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Sidebar from '../../components/Sidebar'
import Topbar from '../../components/Topbar'
import { useApp } from '../../lib/AppContext'
import { Suspense } from 'react'

const uid = () => Math.random().toString(36).slice(2,9)

const EMPTY_ROW = () => ({
  rowId: uid(),
  medicineId: '',
  medicineName: '',
  strength: '',
  type: '',
  schedule: {
    morning:   { enabled: false, qty: '1', food: 'after' },
    afternoon: { enabled: false, qty: '1', food: 'after' },
    night:     { enabled: false, qty: '1', food: 'before' },
  },
  duration: '5',
  instructions: ''
})

function ConsultationContent() {
  const router = useRouter()
  const { medicines, bookings, setBookings, 
          consultations, setConsultations } = useApp()

  const searchParams = useSearchParams()
const patientName = searchParams.get('patient') || 'Patient'
const bookingId   = searchParams.get('bookingId') || ''  

  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [vitals, setVitals] = useState({
    bp:'', temp:'', weight:'', pulse:'', spo2:'', sugar:''
  })
  const [chiefComplaint,   setChiefComplaint]   = useState('')
  const [diagnosis,        setDiagnosis]        = useState('')
  const [examinationNotes, setExaminationNotes] = useState('')
  const [medRows,          setMedRows]          = useState([])
  const [followUpDate,     setFollowUpDate]     = useState('')
  const [advice,           setAdvice]           = useState('')
  const [sickNote,         setSickNote]         = useState(false)
  const [sickNoteDays,     setSickNoteDays]     = useState('3')
  const [toast,            setToast]            = useState('')
  const [saving,           setSaving]           = useState(false)

  const showToast = (msg) => {
    setToast(msg)
    setTimeout(() => setToast(''), 3000)
  }

  const addMedRow    = () => setMedRows([...medRows, EMPTY_ROW()])
  const removeMedRow = (id) => setMedRows(medRows.filter(r => r.rowId !== id))

  const updateMed = (id, changes) =>
    setMedRows(medRows.map(r => r.rowId === id ? { ...r, ...changes } : r))

  const updateSchedule = (id, slot, changes) =>
    setMedRows(medRows.map(r => {
      if (r.rowId !== id) return r
      return { ...r, schedule: {
        ...r.schedule,
        [slot]: { ...r.schedule[slot], ...changes }
      }}
    }))

  const handleMedicineSelect = (rowId, medicineId) => {
    const med = medicines.find(m => m.id === medicineId)
    updateMed(rowId, {
      medicineId,
      medicineName: med?.name    || '',
      strength:     med?.strength || '',
      type:         med?.type     || ''
    })
  }

  const handleSave = () => {
    if (!diagnosis.trim()) {
      showToast('⚠️ Please enter a diagnosis')
      return
    }
    if (medRows.length === 0) {
      showToast('⚠️ Please add at least one medicine')
      return
    }
    setSaving(true)
    const consultation = {
      id: uid(),
      bookingId,
      patientName,
      date: new Date().toISOString().slice(0,10),
      vitals,
      chiefComplaint,
      diagnosis,
      examinationNotes,
      prescription: medRows,
      advice,
      followUpDate,
      sickNote,
      sickNoteDays: sickNote ? sickNoteDays : null,
      createdAt: new Date().toISOString()
    }
    if (setBookings) {
      setBookings(bookings.map(b =>
        b.id === bookingId ? { ...b, status: 'completed' } : b
      ))
    }
    if (setConsultations) {
      setConsultations([...(consultations || []), consultation])
    }
    setSaving(false)
    showToast('✅ Consultation saved!')
    setTimeout(() => router.push('/dashboard'), 1500)
  }

  // ── Styles ──────────────────────────────────────
  const card = {
    background:'white', borderRadius:'10px',
    boxShadow:'0 2px 12px rgba(1,58,71,.08)',
    padding:'20px', marginBottom:'16px'
  }
  const lbl = {
    fontSize:'.78rem', fontWeight:'700', color:'#12333A',
    display:'block', marginBottom:'4px',
    textTransform:'uppercase', letterSpacing:'.5px'
  }
  const inp = {
    width:'100%', padding:'9px 12px',
    border:'1.5px solid #DCEAEC', borderRadius:'8px',
    fontSize:'.9rem', color:'#12333A', background:'white',
    boxSizing:'border-box'
  }
  const ta = { ...inp, minHeight:'80px', resize:'vertical' }

  const SLOTS = [
    { key:'morning',   label:'🌅 Morning' },
    { key:'afternoon', label:'☀️ Afternoon' },
    { key:'night',     label:'🌙 Night' },
  ]

  // ── Render ──────────────────────────────────────
  return (
    <div style={{ display:'flex', minHeight:'100vh' }}>

      {/* Sidebar */}
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{
            position:'fixed', inset:0,
            background:'rgba(0,0,0,0.4)', zIndex:99
          }}
        />
      )}

      {/* Main */}
      <div className="page-main">
        <Topbar
          title="New Consultation"
          onMenuToggle={() => setSidebarOpen(s => !s)}
        >
          <span style={{ fontSize:'.85rem', color:'#5B7C85' }}>
            Patient: <strong style={{ color:'#12333A' }}>{patientName}</strong>
          </span>
        </Topbar>

        <div style={{ padding:'24px', maxWidth:'800px' }}>

          {/* ── VITALS ── */}
          <div style={card}>
            <h3 style={{
              fontSize:'1rem', fontWeight:'700',
              color:'#12333A', marginBottom:'16px'
            }}>🩺 Vitals</h3>
            <div style={{
              display:'grid',
              gridTemplateColumns:'repeat(3,1fr)',
              gap:'12px'
            }}>
              {[
                { key:'bp',     label:'Blood Pressure', ph:'120/80'    },
                { key:'temp',   label:'Temperature °F', ph:'98.6'      },
                { key:'weight', label:'Weight (kg)',     ph:'70'        },
                { key:'pulse',  label:'Pulse (bpm)',     ph:'72'        },
                { key:'spo2',   label:'SpO2 (%)',        ph:'98'        },
                { key:'sugar',  label:'Blood Sugar',     ph:'100 mg/dL' },
              ].map(v => (
                <div key={v.key}>
                  <label style={lbl}>{v.label}</label>
                  <input
                    type="text"
                    placeholder={v.ph}
                    value={vitals[v.key]}
                    onChange={e =>
                      setVitals({ ...vitals, [v.key]: e.target.value })
                    }
                    style={inp}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* ── CONSULTATION DETAILS ── */}
          <div style={card}>
            <h3 style={{
              fontSize:'1rem', fontWeight:'700',
              color:'#12333A', marginBottom:'16px'
            }}>📋 Consultation Details</h3>

            <div style={{ marginBottom:'12px' }}>
              <label style={lbl}>Chief Complaint</label>
              <textarea
                placeholder="What brings the patient in today?"
                value={chiefComplaint}
                onChange={e => setChiefComplaint(e.target.value)}
                style={ta}
              />
            </div>

            <div style={{ marginBottom:'12px' }}>
              <label style={lbl}>
                Diagnosis *{' '}
                <span style={{ color:'#028090', textTransform:'none' }}>
                  (required)
                </span>
              </label>
              <textarea
                placeholder="e.g. Upper Respiratory Tract Infection"
                value={diagnosis}
                onChange={e => setDiagnosis(e.target.value)}
                style={{
                  ...ta,
                  borderColor: diagnosis ? '#DCEAEC' : '#028090'
                }}
              />
            </div>

            <div>
              <label style={lbl}>Examination Notes</label>
              <textarea
                placeholder="Physical examination findings..."
                value={examinationNotes}
                onChange={e => setExaminationNotes(e.target.value)}
                style={ta}
              />
            </div>
          </div>

          {/* ── PRESCRIPTION ── */}
          <div style={card}>
            <div style={{
              display:'flex', justifyContent:'space-between',
              alignItems:'center', marginBottom:'16px'
            }}>
              <h3 style={{
                fontSize:'1rem', fontWeight:'700', color:'#12333A'
              }}>💊 Prescription</h3>
              <button
                type="button"
                onClick={addMedRow}
                style={{
                  background:'#028090', color:'white',
                  border:'none', borderRadius:'8px',
                  padding:'8px 16px', fontSize:'.85rem',
                  fontWeight:'600', cursor:'pointer'
                }}
              >
                + Add Medicine
              </button>
            </div>

            {medRows.length === 0 && (
              <div style={{
                textAlign:'center', padding:'32px',
                background:'#F4F9F9', borderRadius:'10px',
                color:'#5B7C85', fontSize:'.9rem'
              }}>
                💊 No medicines added. Click &ldquo;+ Add Medicine&rdquo; to start.
              </div>
            )}

            {medRows.map((row, idx) => (
              <div key={row.rowId} style={{
                background:'#F4F9F9', borderRadius:'10px',
                padding:'16px', marginBottom:'12px',
                border:'1px solid #DCEAEC'
              }}>

                {/* Row header */}
                <div style={{
                  display:'flex', justifyContent:'space-between',
                  alignItems:'center', marginBottom:'12px'
                }}>
                  <span style={{
                    fontWeight:'700', color:'#028090', fontSize:'.85rem'
                  }}>
                    Medicine {idx + 1}
                    {row.medicineName && (
                      <span style={{ color:'#12333A', marginLeft:'8px' }}>
                        — {row.medicineName} {row.strength}
                      </span>
                    )}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeMedRow(row.rowId)}
                    style={{
                      background:'#FFE8E8', color:'#c0392b',
                      border:'none', borderRadius:'6px',
                      padding:'4px 10px', fontSize:'.78rem',
                      cursor:'pointer', fontWeight:'600'
                    }}
                  >
                    🗑 Remove
                  </button>
                </div>

                

                {/* NATIVE SELECT — never disappears */}
                <div style={{ marginBottom:'12px' }}>
                  <label style={lbl}>Select Medicine</label>
                  <select
                    value={row.medicineId}
                    onChange={e =>
                      handleMedicineSelect(row.rowId, e.target.value)
                    }
                    style={inp}
                  >
                    <option value="">— Choose medicine —</option>
                    {(medicines || []).map(med => (
                      <option key={med.id} value={med.id}>
                        {med.name} {med.strength} ({med.type})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Morning / Afternoon / Night */}
                {SLOTS.map(slot => (
                  <div key={slot.key} style={{
                    background:'white', borderRadius:'8px',
                    padding:'10px 12px', marginBottom:'8px',
                    border:'1px solid #DCEAEC'
                  }}>
                    <label style={{
                      display:'flex', alignItems:'center',
                      gap:'8px', cursor:'pointer'
                    }}>
                      <input
                        type="checkbox"
                        checked={row.schedule[slot.key].enabled}
                        onChange={e =>
                          updateSchedule(row.rowId, slot.key, {
                            enabled: e.target.checked
                          })
                        }
                      />
                      <span style={{
                        fontWeight:'600', color:'#12333A', fontSize:'.85rem'
                      }}>
                        {slot.label}
                      </span>
                    </label>

                    {row.schedule[slot.key].enabled && (
                      <div style={{
                        display:'flex', gap:'12px',
                        alignItems:'center', flexWrap:'wrap',
                        paddingLeft:'24px', marginTop:'8px'
                      }}>
                        <select
                          value={row.schedule[slot.key].qty}
                          onChange={e =>
                            updateSchedule(row.rowId, slot.key, {
                              qty: e.target.value
                            })
                          }
                          style={{
                            padding:'5px 8px',
                            border:'1px solid #DCEAEC',
                            borderRadius:'6px', fontSize:'.85rem'
                          }}
                        >
                          <option value="0.5">½ tablet</option>
                          <option value="1">1 tablet</option>
                          <option value="2">2 tablets</option>
                          <option value="3">3 tablets</option>
                        </select>
                        {['before','after'].map(food => (
                          <label key={food} style={{
                            display:'flex', alignItems:'center',
                            gap:'4px', fontSize:'.82rem', cursor:'pointer'
                          }}>
                            <input
                              type="radio"
                              name={`${slot.key}-${row.rowId}`}
                              value={food}
                              checked={row.schedule[slot.key].food === food}
                              onChange={() =>
                                updateSchedule(row.rowId, slot.key, { food })
                              }
                            />
                            {food.charAt(0).toUpperCase()+food.slice(1)} food
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                ))}

                {/* Duration + Instructions */}
                <div style={{
                  display:'flex', gap:'12px',
                  flexWrap:'wrap', marginTop:'8px'
                }}>
                  <div style={{ flex:'1', minWidth:'140px' }}>
                    <label style={lbl}>Duration (days)</label>
                    <input
                      type="number" min="1" max="90"
                      value={row.duration}
                      onChange={e =>
                        updateMed(row.rowId, { duration: e.target.value })
                      }
                      style={inp}
                    />
                  </div>
                  <div style={{ flex:'2', minWidth:'200px' }}>
                    <label style={lbl}>Special Instructions</label>
                    <input
                      type="text"
                      placeholder="e.g. Take with warm water"
                      value={row.instructions}
                      onChange={e =>
                        updateMed(row.rowId, { instructions: e.target.value })
                      }
                      style={inp}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* ── FOLLOW-UP ── */}
          <div style={card}>
            <h3 style={{
              fontSize:'1rem', fontWeight:'700',
              color:'#12333A', marginBottom:'16px'
            }}>📅 Follow-up & Advice</h3>

            <div style={{
              display:'grid',
              gridTemplateColumns:'1fr 1fr',
              gap:'12px', marginBottom:'12px'
            }}>
              <div>
                <label style={lbl}>Follow-up Date</label>
                <input
                  type="date"
                  value={followUpDate}
                  min={new Date().toISOString().slice(0,10)}
                  onChange={e => setFollowUpDate(e.target.value)}
                  style={inp}
                />
              </div>
              <div>
                <label style={lbl}>Sick Note</label>
                <div style={{
                  display:'flex', alignItems:'center',
                  gap:'12px', paddingTop:'10px'
                }}>
                  <label style={{
                    display:'flex', alignItems:'center',
                    gap:'6px', cursor:'pointer', fontSize:'.9rem'
                  }}>
                    <input
                      type="checkbox"
                      checked={sickNote}
                      onChange={e => setSickNote(e.target.checked)}
                    />
                    Required
                  </label>
                  {sickNote && (
                    <input
                      type="number" min="1" max="30"
                      value={sickNoteDays}
                      onChange={e => setSickNoteDays(e.target.value)}
                      placeholder="Days"
                      style={{ ...inp, width:'80px' }}
                    />
                  )}
                </div>
              </div>
            </div>

            <div>
              <label style={lbl}>General Advice</label>
              <textarea
                placeholder="e.g. Rest for 3 days, drink plenty of fluids..."
                value={advice}
                onChange={e => setAdvice(e.target.value)}
                style={ta}
              />
            </div>
          </div>

          {/* ── BUTTONS ── */}
          <div style={{
            display:'flex', gap:'12px',
            flexWrap:'wrap', marginBottom:'40px'
          }}>
            <button
              onClick={handleSave}
              disabled={saving}
              style={{
                background: saving ? '#5B7C85' : '#028090',
                color:'white', border:'none',
                borderRadius:'8px', padding:'12px 24px',
                fontSize:'.95rem', fontWeight:'700',
                cursor: saving ? 'not-allowed' : 'pointer'
              }}
            >
              {saving ? '⏳ Saving...' : '💾 Save Consultation'}
            </button>
            <button
              onClick={() => window.print()}
              style={{
                background:'white', color:'#028090',
                border:'1.5px solid #028090', borderRadius:'8px',
                padding:'12px 24px', fontSize:'.95rem',
                fontWeight:'600', cursor:'pointer'
              }}
            >
              🖨️ Print Prescription
            </button>
            <button
              onClick={() => router.back()}
              style={{
                background:'white', color:'#5B7C85',
                border:'1.5px solid #DCEAEC', borderRadius:'8px',
                padding:'12px 24px', fontSize:'.95rem',
                fontWeight:'600', cursor:'pointer'
              }}
            >
              ← Cancel
            </button>
          </div>

        </div>
      </div>

      {/* TOAST */}
      {toast && (
        <div style={{
          position:'fixed', bottom:'24px', right:'24px',
          background:'#12333A', color:'white',
          padding:'12px 20px', borderRadius:'10px',
          fontSize:'.88rem', fontWeight:'500',
          boxShadow:'0 8px 24px rgba(0,0,0,.2)',
          zIndex:9999
        }}>
          {toast}
        </div>
      )}
    </div>
  )
}
export default function ConsultationPage() {
  return (
    <Suspense fallback={
      <div style={{
        display:'flex', alignItems:'center',
        justifyContent:'center', minHeight:'100vh',
        background:'#F4F9F9', fontSize:'1rem',
        color:'#5B7C85'
      }}>
        Loading...
      </div>
    }>
      <ConsultationContent />
    </Suspense>
  )
}