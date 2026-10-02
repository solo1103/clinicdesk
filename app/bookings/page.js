'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Sidebar from '../../components/Sidebar'
import Topbar from '../../components/Topbar'
import { useApp } from '../../lib/AppContext'

const uid = () => Math.random().toString(36).slice(2,9)

const STATUS_COLORS = {
  confirmed: { bg:'#E6F7F1', color:'#1a7a50' },
  pending:   { bg:'#FFF4E5', color:'#B06000' },
  completed: { bg:'#E8F4FE', color:'#1a5fa6' },
  cancelled: { bg:'#FFE8E8', color:'#c0392b' },
}

const SERVICES_DEFAULT = [
  'Consultation','Follow-up','Vaccination',
  'Health Checkup','Procedure','Other'
]

const SLOTS = [
  '09:00','09:30','10:00','10:30','11:00','11:30',
  '12:00','12:30','13:00','13:30','14:00','14:30',
  '15:00','15:30','16:00','16:30','17:00','17:30'
]

const fmtDate = d => {
  if (!d) return ''
  const x = new Date(d + 'T00:00:00')
  return x.toLocaleDateString('en-GB', {
    day:'2-digit', month:'short', year:'numeric'
  })
}
const fmtTime = t => {
  if (!t) return ''
  const [h, m] = t.split(':')
  const hr = +h
  return `${hr > 12 ? hr - 12 : hr || 12}:${m} ${hr >= 12 ? 'PM' : 'AM'}`
}
const today = () => new Date().toISOString().slice(0, 10)

export default function BookingsPage() {
  const router   = useRouter()
  const { bookings, setBookings, holidays } = useApp()

  const [sidebarOpen,  setSidebarOpen]  = useState(false)
  const [search,       setSearch]       = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [dateFilter,   setDateFilter]   = useState('')
  const [showForm,     setShowForm]     = useState(false)
  const [toast,        setToast]        = useState('')
  const [form,         setForm]         = useState({
    patientName:'', patientPhone:'',
    service:'', price:'',
    date:'', time:'', notes:''
  })
  const [selectedSlot, setSelectedSlot] = useState('')

  const showToast = msg => {
    setToast(msg)
    setTimeout(() => setToast(''), 2500)
  }

  // ── Filters ──
  const filtered = (bookings || []).filter(b => {
    const q = search.toLowerCase()
    const matchQ = !q ||
      b.patientName?.toLowerCase().includes(q) ||
      b.patientPhone?.includes(q)
    const matchS = !statusFilter || b.status === statusFilter
    const matchD = !dateFilter   || b.date   === dateFilter
    return matchQ && matchS && matchD
  }).sort((a, b) =>
    (b.date + b.time).localeCompare(a.date + a.time)
  )

  // ── Status counts ──
  const counts = (bookings || []).reduce((acc, b) => {
    acc[b.status] = (acc[b.status] || 0) + 1
    return acc
  }, {})

  // ── Actions ──
  const markDone = id => {
    setBookings(bookings.map(b =>
      b.id === id ? { ...b, status:'completed' } : b
    ))
    showToast('✅ Marked as completed')
  }

  const cancelBk = id => {
    if (!confirm('Cancel this appointment?')) return
    setBookings(bookings.map(b =>
      b.id === id ? { ...b, status:'cancelled' } : b
    ))
    showToast('❌ Appointment cancelled')
  }

  // ── Available slots for selected date ──
  const takenSlots = (bookings || [])
    .filter(b => b.date === form.date && b.status !== 'cancelled')
    .map(b => b.time)

  const blockedDate = (holidays || [])
    .map(h => h.date)
    .includes(form.date)

  // ── Add booking ──
  const handleAdd = () => {
    if (!form.patientName.trim()) {
      showToast('⚠️ Patient name required'); return
    }
    if (!/^\d{10}$/.test(form.patientPhone)) {
      showToast('⚠️ Enter valid 10-digit phone'); return
    }
    if (!form.service.trim()) {
      showToast('⚠️ Service required'); return
    }
    if (!form.date) {
      showToast('⚠️ Date required'); return
    }
    if (!selectedSlot) {
      showToast('⚠️ Select a time slot'); return
    }
    const newBk = {
      id: uid(),
      patientName:  form.patientName.trim(),
      patientPhone: form.patientPhone.trim(),
      service:      form.service.trim(),
      price:        +form.price || 0,
      date:         form.date,
      time:         selectedSlot,
      notes:        form.notes.trim(),
      status:       'confirmed'
    }
    setBookings([...(bookings || []), newBk])
    setForm({
      patientName:'', patientPhone:'',
      service:'', price:'', date:'', time:'', notes:''
    })
    setSelectedSlot('')
    setShowForm(false)
    showToast('✅ Booking confirmed!')
  }

  // ── Styles ──
  const inp = {
    width:'100%', padding:'9px 12px',
    border:'1.5px solid #DCEAEC', borderRadius:'8px',
    fontSize:'.9rem', color:'#12333A',
    background:'white', boxSizing:'border-box'
  }
  const lbl = {
    fontSize:'.78rem', fontWeight:'700', color:'#12333A',
    display:'block', marginBottom:'4px',
    textTransform:'uppercase', letterSpacing:'.5px'
  }
  const actionBtn = (bg, color) => ({
    background: bg, color,
    border:'none', borderRadius:'6px',
    padding:'5px 10px', fontSize:'.75rem',
    fontWeight:'600', cursor:'pointer',
    whiteSpace:'nowrap'
  })

  return (
    <div style={{ display:'flex', minHeight:'100vh' }}>

      <Sidebar open={sidebarOpen}
        onClose={() => setSidebarOpen(false)} />
      {sidebarOpen && (
        <div onClick={() => setSidebarOpen(false)}
          style={{
            position:'fixed', inset:0,
            background:'rgba(0,0,0,.4)', zIndex:99
          }}
        />
      )}

      <div className="page-main">
        <Topbar
          title="Bookings"
          onMenuToggle={() => setSidebarOpen(s => !s)}
        >
          <button
            onClick={() => setShowForm(s => !s)}
            style={{
              background:'#02C39A', color:'#012B35',
              border:'none', borderRadius:'8px',
              padding:'8px 16px', fontSize:'.85rem',
              fontWeight:'700', cursor:'pointer'
            }}
          >
            {showForm ? '✕ Close' : '+ Add Booking'}
          </button>
        </Topbar>

        <div style={{ padding:'16px' }}>

          {/* ADD BOOKING FORM */}
          {showForm && (
            <div style={{
              background:'white', borderRadius:'12px',
              boxShadow:'0 2px 16px rgba(1,58,71,.12)',
              padding:'20px', marginBottom:'20px'
            }}>
              <h3 style={{
                fontSize:'1rem', fontWeight:'700',
                color:'#12333A', marginBottom:'16px'
              }}>
                ➕ New Appointment
              </h3>

              {/* Row 1 */}
              <div style={{
                display:'grid',
                gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))',
                gap:'12px', marginBottom:'12px'
              }}>
                <div>
                  <label style={lbl}>Patient Name *</label>
                  <input
                    type="text"
                    placeholder="Full name"
                    value={form.patientName}
                    onChange={e =>
                      setForm({ ...form, patientName: e.target.value })
                    }
                    style={inp}
                  />
                </div>
                <div>
                  <label style={lbl}>Phone Number *</label>
                  <input
                    type="tel"
                    placeholder="10-digit mobile"
                    value={form.patientPhone}
                    onChange={e =>
                      setForm({ ...form, patientPhone: e.target.value })
                    }
                    style={inp}
                  />
                </div>
              </div>

              {/* Row 2 */}
              <div style={{
                display:'grid',
                gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))',
                gap:'12px', marginBottom:'12px'
              }}>
                <div>
                  <label style={lbl}>Service *</label>
                  <select
                    value={form.service}
                    onChange={e =>
                      setForm({ ...form, service: e.target.value })
                    }
                    style={inp}
                  >
                    <option value="">— Select service —</option>
                    {SERVICES_DEFAULT.map(s =>
                      <option key={s} value={s}>{s}</option>
                    )}
                  </select>
                </div>
                <div>
                  <label style={lbl}>Price (₹)</label>
                  <input
                    type="number"
                    placeholder="0"
                    value={form.price}
                    onChange={e =>
                      setForm({ ...form, price: e.target.value })
                    }
                    style={inp}
                  />
                </div>
                <div>
                  <label style={lbl}>Date *</label>
                  <input
                    type="date"
                    min={today()}
                    value={form.date}
                    onChange={e => {
                      setForm({ ...form, date: e.target.value })
                      setSelectedSlot('')
                    }}
                    style={inp}
                  />
                </div>
              </div>

              {/* Time Slots */}
              {form.date && (
                <div style={{ marginBottom:'12px' }}>
                  <label style={lbl}>
                    Available Time Slots *
                  </label>
                  {blockedDate ? (
                    <div style={{
                      background:'#FFE8E8',
                      border:'1px solid #f5b8b8',
                      borderRadius:'8px',
                      padding:'12px 16px',
                      color:'#c0392b',
                      fontSize:'.88rem',
                      fontWeight:'600'
                    }}>
                      🚫 This date is marked as a holiday.
                      Please choose another date.
                    </div>
                  ) : (
                    <div style={{
                      display:'grid',
                      gridTemplateColumns:
                        'repeat(auto-fill,minmax(90px,1fr))',
                      gap:'8px'
                    }}>
                      {SLOTS.map(s => {
                        const taken = takenSlots.includes(s)
                        const sel   = selectedSlot === s
                        return (
                          <button
                            key={s}
                            type="button"
                            disabled={taken}
                            onClick={() => setSelectedSlot(s)}
                            style={{
                              padding:'8px 4px',
                              borderRadius:'7px',
                              fontSize:'.8rem',
                              fontWeight:'600',
                              cursor: taken
                                ? 'not-allowed' : 'pointer',
                              border: sel
                                ? 'none'
                                : '1.5px solid #DCEAEC',
                              background: taken
                                ? '#FFE8E8'
                                : sel ? '#028090' : 'white',
                              color: taken
                                ? '#c0392b'
                                : sel ? 'white' : '#12333A',
                              opacity: taken ? .7 : 1
                            }}
                          >
                            {fmtTime(s)}
                          </button>
                        )
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* Notes */}
              <div style={{ marginBottom:'16px' }}>
                <label style={lbl}>Notes (optional)</label>
                <textarea
                  placeholder="Any special notes..."
                  value={form.notes}
                  onChange={e =>
                    setForm({ ...form, notes: e.target.value })
                  }
                  style={{
                    ...inp, minHeight:'70px',
                    resize:'vertical'
                  }}
                />
              </div>

              {/* Submit */}
              <div style={{ display:'flex', gap:'10px' }}>
                <button
                  onClick={handleAdd}
                  style={{
                    background:'#028090', color:'white',
                    border:'none', borderRadius:'8px',
                    padding:'11px 24px', fontSize:'.92rem',
                    fontWeight:'700', cursor:'pointer'
                  }}
                >
                  ✓ Confirm Booking
                </button>
                <button
                  onClick={() => setShowForm(false)}
                  style={{
                    background:'white', color:'#5B7C85',
                    border:'1.5px solid #DCEAEC',
                    borderRadius:'8px', padding:'11px 20px',
                    fontSize:'.92rem', cursor:'pointer'
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* SUMMARY STRIP */}
          <div style={{
            display:'flex', gap:'8px',
            flexWrap:'wrap', marginBottom:'16px'
          }}>
            {Object.entries(STATUS_COLORS).map(([s, c]) => (
              <div key={s} style={{
                background: c.bg,
                borderRadius:'20px',
                padding:'4px 14px',
                fontSize:'.78rem',
                fontWeight:'700',
                color: c.color,
                cursor:'pointer',
                border: statusFilter === s
                  ? `2px solid ${c.color}`
                  : '2px solid transparent'
              }}
                onClick={() =>
                  setStatusFilter(statusFilter === s ? '' : s)
                }
              >
                {s.charAt(0).toUpperCase()+s.slice(1)} ({counts[s]||0})
              </div>
            ))}
          </div>

          {/* FILTERS */}
          <div style={{
            display:'flex', gap:'10px',
            flexWrap:'wrap', marginBottom:'16px'
          }}>
            <input
              type="text"
              placeholder="🔍 Search name or phone..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{
                ...inp, flex:1,
                minWidth:'180px', maxWidth:'300px'
              }}
            />
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              style={{ ...inp, width:'auto' }}
            >
              <option value="">All Status</option>
              <option value="confirmed">Confirmed</option>
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <input
              type="date"
              value={dateFilter}
              onChange={e => setDateFilter(e.target.value)}
              style={{ ...inp, width:'auto' }}
            />
            {(search||statusFilter||dateFilter) && (
              <button
                onClick={() => {
                  setSearch('')
                  setStatusFilter('')
                  setDateFilter('')
                }}
                style={{
                  background:'none',
                  border:'1.5px solid #DCEAEC',
                  borderRadius:'8px',
                  padding:'8px 14px',
                  fontSize:'.83rem',
                  color:'#5B7C85', cursor:'pointer'
                }}
              >
                Clear
              </button>
            )}
          </div>

          <p style={{
            color:'#5B7C85', fontSize:'.82rem',
            marginBottom:'12px'
          }}>
            Showing {filtered.length} of {bookings?.length||0} appointments
          </p>

          {/* BOOKING CARDS — works on all screen sizes */}
          {filtered.length === 0 ? (
            <div style={{
              background:'white', borderRadius:'12px',
              padding:'48px', textAlign:'center',
              color:'#5B7C85',
              boxShadow:'0 2px 12px rgba(1,58,71,.08)'
            }}>
              <div style={{
                fontSize:'2.5rem', marginBottom:'12px'
              }}>
                📭
              </div>
              <p style={{ fontWeight:'600', margin:0 }}>
                No bookings match your filters
              </p>
            </div>
          ) : (
            <div style={{
              display:'flex',
              flexDirection:'column',
              gap:'10px'
            }}>
              {filtered.map(b => (
                <div key={b.id} style={{
                  background:'white',
                  borderRadius:'12px',
                  boxShadow:'0 2px 12px rgba(1,58,71,.08)',
                  padding:'14px 16px'
                }}>
                  {/* Card top row */}
                  <div style={{
                    display:'flex',
                    justifyContent:'space-between',
                    alignItems:'flex-start',
                    flexWrap:'wrap',
                    gap:'8px',
                    marginBottom:'10px'
                  }}>
                    {/* Left: time + patient */}
                    <div style={{
                      display:'flex',
                      alignItems:'center',
                      gap:'12px',
                      flex:1,
                      minWidth:'200px'
                    }}>
                      {/* Time badge */}
                      <div style={{
                        background:'#F4F9F9',
                        borderRadius:'8px',
                        padding:'8px 10px',
                        textAlign:'center',
                        minWidth:'60px',
                        flexShrink:0
                      }}>
                        <span style={{
                          fontSize:'.95rem',
                          fontWeight:'700',
                          color:'#028090',
                          display:'block'
                        }}>
                          {fmtTime(b.time).split(' ')[0]}
                        </span>
                        <span style={{
                          fontSize:'.65rem',
                          color:'#5B7C85'
                        }}>
                          {fmtTime(b.time).split(' ')[1]}
                        </span>
                      </div>
                      {/* Patient info */}
                      <div style={{ flex:1 }}>
                        <div style={{
                          fontWeight:'700',
                          color:'#12333A',
                          fontSize:'.95rem'
                        }}>
                          {b.patientName}
                        </div>
                        <div style={{
                          fontSize:'.8rem',
                          color:'#5B7C85',
                          marginTop:'2px'
                        }}>
                          📞 {b.patientPhone}
                        </div>
                        <div style={{
                          fontSize:'.8rem',
                          color:'#5B7C85'
                        }}>
                          🦷 {b.service}
                          {b.price
                            ? ` · ₹${b.price.toLocaleString()}`
                            : ''}
                        </div>
                      </div>
                    </div>

                    {/* Right: date + status */}
                    <div style={{
                      textAlign:'right',
                      flexShrink:0
                    }}>
                      <div style={{
                        fontSize:'.8rem',
                        color:'#5B7C85',
                        marginBottom:'4px'
                      }}>
                        {fmtDate(b.date)}
                      </div>
                      <span style={{
                        display:'inline-block',
                        padding:'3px 10px',
                        borderRadius:'20px',
                        fontSize:'.72rem',
                        fontWeight:'700',
                        background:
                          STATUS_COLORS[b.status]?.bg || '#F4F9F9',
                        color:
                          STATUS_COLORS[b.status]?.color || '#5B7C85'
                      }}>
                        {b.status}
                      </span>
                    </div>
                  </div>

                  {/* Notes */}
                  {b.notes && (
                    <div style={{
                      background:'#F4F9F9',
                      borderRadius:'6px',
                      padding:'6px 10px',
                      fontSize:'.78rem',
                      color:'#5B7C85',
                      marginBottom:'10px'
                    }}>
                      📝 {b.notes}
                    </div>
                  )}

                  {/* Action buttons */}
                  {(b.status==='confirmed'||b.status==='pending') && (
                    <div style={{
                      display:'flex',
                      gap:'8px',
                      flexWrap:'wrap'
                    }}>
                      <button
                        onClick={() => markDone(b.id)}
                        style={actionBtn('#E6F7F1','#1a7a50')}
                      >
                        ✓ Done
                      </button>
                      <button
                        onClick={() => router.push(
                          `/consultation?patient=${
                            encodeURIComponent(b.patientName)
                          }&bookingId=${b.id}`
                        )}
                        style={actionBtn('#E8F4FE','#1a5fa6')}
                      >
                        🩺 Consult
                      </button>
                      <button
                        onClick={() => cancelBk(b.id)}
                        style={actionBtn('#FFE8E8','#c0392b')}
                      >
                        ✕ Cancel
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* TOAST */}
      {toast && (
        <div style={{
          position:'fixed',
          bottom:'24px',
          right:'24px',
          background:'#12333A',
          color:'white',
          padding:'12px 20px',
          borderRadius:'10px',
          fontSize:'.88rem',
          fontWeight:'500',
          boxShadow:'0 8px 24px rgba(0,0,0,.2)',
          zIndex:9999
        }}>
          {toast}
        </div>
      )}
    </div>
  )
}