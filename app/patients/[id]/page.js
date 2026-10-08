'use client'
export const dynamic = 'force-dynamic'

import { useState, Suspense } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Sidebar from '../../../components/Sidebar'
import Topbar from '../../../components/Topbar'
import { useApp } from '../../../lib/AppContext'

function PatientDetailContent() {
  const router = useRouter()
  const params = useParams()
  const phone  = decodeURIComponent(params?.id || '')
  const { bookings, consultations } = useApp()

  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [activeTab,   setActiveTab]   = useState('visits')

  const patientBookings = (bookings || [])
    .filter(b => b.patientPhone === phone)
    .sort((a, b) => b.date.localeCompare(a.date))

  const patientName =
    patientBookings[0]?.patientName || 'Patient'

  const patientConsultations = (consultations || [])
    .filter(c => c.patientPhone === phone)
    .sort((a, b) => b.date?.localeCompare(a.date))

  const totalSpend = patientBookings
    .filter(b => b.status === 'completed')
    .reduce((s, b) => s + (b.price || 0), 0)

  const fmtDate = d => {
    if (!d) return ''
    return new Date(d + 'T00:00:00')
      .toLocaleDateString('en-GB', {
        day: '2-digit', month: 'short', year: 'numeric'
      })
  }

  const initials = name =>
    name.split(' ').map(w => w[0])
      .join('').slice(0, 2).toUpperCase()

  const STATUS = {
    confirmed: { bg:'#E6F7F1', color:'#1a7a50' },
    pending:   { bg:'#FFF4E5', color:'#B06000' },
    completed: { bg:'#E8F4FE', color:'#1a5fa6' },
    cancelled: { bg:'#FFE8E8', color:'#c0392b' },
  }

  return (
    <div style={{ display:'flex', minHeight:'100vh' }}>
      <Sidebar open={sidebarOpen}
        onClose={() => setSidebarOpen(false)} />
      {sidebarOpen && (
        <div onClick={() => setSidebarOpen(false)}
          style={{
            position:'fixed', inset:0,
            background:'rgba(0,0,0,.4)', zIndex:99
          }} />
      )}

      <div className="page-main">
        <Topbar
          title={patientName}
          onMenuToggle={() => setSidebarOpen(s => !s)}
        >
          <button onClick={() => router.back()} style={{
            background:'white', color:'#5B7C85',
            border:'1.5px solid #DCEAEC', borderRadius:'8px',
            padding:'7px 14px', fontSize:'.85rem',
            cursor:'pointer'
          }}>
            ← Back
          </button>
          <button
            onClick={() => router.push(
              `/consultation?patient=${
                encodeURIComponent(patientName)
              }&phone=${phone}`
            )}
            style={{
              background:'#028090', color:'white',
              border:'none', borderRadius:'8px',
              padding:'7px 14px', fontSize:'.85rem',
              fontWeight:'600', cursor:'pointer'
            }}
          >
            🩺 New Consultation
          </button>
        </Topbar>

        <div style={{ padding:'16px' }}>

          {/* Patient Info Card */}
          <div style={{
            background:'white', borderRadius:'12px',
            boxShadow:'0 2px 12px rgba(1,58,71,.08)',
            padding:'20px', marginBottom:'16px'
          }}>
            <div style={{
              display:'flex', alignItems:'center',
              gap:'16px', flexWrap:'wrap'
            }}>
              <div style={{
                width:'64px', height:'64px',
                background:'#028090', borderRadius:'50%',
                display:'flex', alignItems:'center',
                justifyContent:'center',
                color:'white', fontWeight:'700',
                fontSize:'1.4rem', flexShrink:0
              }}>
                {initials(patientName)}
              </div>
              <div style={{ flex:1 }}>
                <div style={{
                  fontSize:'1.2rem', fontWeight:'700',
                  color:'#12333A', marginBottom:'4px'
                }}>
                  {patientName}
                </div>
                <div style={{
                  fontSize:'.85rem', color:'#5B7C85'
                }}>
                  📞 {phone}
                </div>
              </div>
              <div style={{
                display:'flex', gap:'20px', flexWrap:'wrap'
              }}>
                {[
                  { label:'Visits',
                    value: patientBookings.length,
                    color:'#028090' },
                  { label:'Total Spent',
                    value:`₹${totalSpend.toLocaleString()}`,
                    color:'#02C39A' },
                  { label:'Consultations',
                    value: patientConsultations.length,
                    color:'#013A47' },
                ].map(s => (
                  <div key={s.label} style={{textAlign:'center'}}>
                    <div style={{
                      fontSize:'1.4rem', fontWeight:'700',
                      color:s.color
                    }}>
                      {s.value}
                    </div>
                    <div style={{
                      fontSize:'.7rem', color:'#5B7C85',
                      textTransform:'uppercase',
                      letterSpacing:'.4px'
                    }}>
                      {s.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div style={{
            display:'flex', gap:'4px',
            marginBottom:'16px',
            background:'white', borderRadius:'10px',
            padding:'4px',
            boxShadow:'0 2px 12px rgba(1,58,71,.08)',
            width:'fit-content'
          }}>
            {['visits','prescriptions'].map(tab => (
              <button key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  padding:'8px 20px', borderRadius:'7px',
                  border:'none', fontSize:'.85rem',
                  fontWeight:'600', cursor:'pointer',
                  background: activeTab===tab
                    ? '#028090' : 'transparent',
                  color: activeTab===tab
                    ? 'white' : '#5B7C85',
                  textTransform:'capitalize'
                }}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* VISITS TAB */}
          {activeTab === 'visits' && (
            <div style={{
              display:'flex', flexDirection:'column', gap:'10px'
            }}>
              {patientBookings.length === 0 ? (
                <div style={{
                  background:'white', borderRadius:'12px',
                  padding:'32px', textAlign:'center',
                  color:'#5B7C85',
                  boxShadow:'0 2px 12px rgba(1,58,71,.08)'
                }}>
                  No visits recorded yet
                </div>
              ) : (
                patientBookings.map(b => (
                  <div key={b.id} style={{
                    background:'white',
                    borderLeft:'3px solid #028090',
                    borderRadius:'0 10px 10px 0',
                    boxShadow:'0 2px 12px rgba(1,58,71,.08)',
                    padding:'14px 16px'
                  }}>
                    <div style={{
                      display:'flex',
                      justifyContent:'space-between',
                      flexWrap:'wrap', gap:'8px'
                    }}>
                      <div>
                        <div style={{
                          fontWeight:'700', color:'#12333A',
                          fontSize:'.92rem'
                        }}>
                          {b.service}
                        </div>
                        <div style={{
                          fontSize:'.78rem', color:'#5B7C85',
                          marginTop:'3px'
                        }}>
                          📅 {fmtDate(b.date)} ·{' '}
                          ₹{(b.price||0).toLocaleString()}
                        </div>
                        {b.notes && (
                          <div style={{
                            fontSize:'.78rem', color:'#5B7C85',
                            marginTop:'3px'
                          }}>
                            📝 {b.notes}
                          </div>
                        )}
                      </div>
                      <span style={{
                        padding:'3px 10px',
                        borderRadius:'20px',
                        fontSize:'.72rem', fontWeight:'700',
                        background:STATUS[b.status]?.bg||'#F4F9F9',
                        color:STATUS[b.status]?.color||'#5B7C85'
                      }}>
                        {b.status}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* PRESCRIPTIONS TAB */}
          {activeTab === 'prescriptions' && (
            <div style={{
              display:'flex', flexDirection:'column', gap:'10px'
            }}>
              {patientConsultations.length === 0 ? (
                <div style={{
                  background:'white', borderRadius:'12px',
                  padding:'32px', textAlign:'center',
                  color:'#5B7C85',
                  boxShadow:'0 2px 12px rgba(1,58,71,.08)'
                }}>
                  No prescriptions yet
                </div>
              ) : (
                patientConsultations.map(c => (
                  <div key={c.id} style={{
                    background:'white', borderRadius:'10px',
                    boxShadow:'0 2px 12px rgba(1,58,71,.08)',
                    padding:'16px'
                  }}>
                    <div style={{
                      display:'flex',
                      justifyContent:'space-between',
                      marginBottom:'10px',
                      flexWrap:'wrap', gap:'8px'
                    }}>
                      <div>
                        <div style={{
                          fontWeight:'700', color:'#12333A',
                          fontSize:'.92rem'
                        }}>
                          {c.diagnosis}
                        </div>
                        <div style={{
                          fontSize:'.78rem', color:'#5B7C85',
                          marginTop:'3px'
                        }}>
                          📅 {fmtDate(c.date)}
                        </div>
                      </div>
                      <span style={{
                        background:'#E8F4FE', color:'#1a5fa6',
                        padding:'3px 10px', borderRadius:'20px',
                        fontSize:'.72rem', fontWeight:'700'
                      }}>
                        {(c.prescription||[]).length} medicines
                      </span>
                    </div>

                    {(c.prescription||[]).map((med, i) => (
                      <div key={i} style={{
                        background:'#F4F9F9', borderRadius:'8px',
                        padding:'8px 12px', marginBottom:'6px',
                        fontSize:'.82rem', color:'#12333A'
                      }}>
                        <strong>{med.medicineName}</strong>
                        {med.strength && ` ${med.strength}`}
                        <div style={{
                          color:'#5B7C85', marginTop:'2px',
                          fontSize:'.75rem'
                        }}>
                          {[
                            med.schedule?.morning?.enabled &&
                              `🌅 ${med.schedule.morning.qty}`,
                            med.schedule?.afternoon?.enabled &&
                              `☀️ ${med.schedule.afternoon.qty}`,
                            med.schedule?.night?.enabled &&
                              `🌙 ${med.schedule.night.qty}`,
                          ].filter(Boolean).join(' · ')}
                          {med.duration &&
                            ` · ${med.duration} days`}
                        </div>
                      </div>
                    ))}

                    {c.followUpDate && (
                      <div style={{
                        background:'#E6F7F1', borderRadius:'7px',
                        padding:'6px 10px', fontSize:'.78rem',
                        color:'#1a7a50', marginTop:'8px'
                      }}>
                        📅 Follow-up: {fmtDate(c.followUpDate)}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function PatientDetailPage() {
  return (
    <Suspense fallback={
      <div style={{
        display:'flex', alignItems:'center',
        justifyContent:'center', minHeight:'100vh',
        background:'#F4F9F9', color:'#5B7C85'
      }}>
        Loading patient...
      </div>
    }>
      <PatientDetailContent />
    </Suspense>
  )
}