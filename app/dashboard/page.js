'use client'
export const dynamic = 'force-dynamic'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Sidebar from '../../components/Sidebar'
import Topbar from '../../components/Topbar'
import { useApp } from '../../lib/AppContext'

const today = () => new Date().toISOString().slice(0, 10)

const fmtTime = t => {
  if (!t) return ''
  const [h, m] = t.split(':')
  const hr = +h
  return `${hr > 12 ? hr - 12 : hr || 12}:${m} ${hr >= 12 ? 'PM' : 'AM'}`
}

const fmtDate = d => {
  if (!d) return ''
  return new Date(d + 'T00:00:00').toLocaleDateString('en-GB', {
    weekday: 'long', day: 'numeric', month: 'long'
  })
}

const STATUS = {
  confirmed: { bg: '#E6F7F1', color: '#1a7a50' },
  pending:   { bg: '#FFF4E5', color: '#B06000' },
  completed: { bg: '#E8F4FE', color: '#1a5fa6' },
  cancelled: { bg: '#FFE8E8', color: '#c0392b' },
}

export default function DashboardPage() {
  const router = useRouter()
  const { bookings, setBookings } = useApp()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [toast,       setToast]       = useState('')

  const showToast = msg => {
    setToast(msg)
    setTimeout(() => setToast(''), 2500)
  }

  const t = today()
  const todayBk = (bookings || [])
    .filter(b => b.date === t)
    .sort((a, b) => a.time.localeCompare(b.time))

  const confirmed = todayBk.filter(b => b.status === 'confirmed').length
  const pending   = todayBk.filter(b => b.status === 'pending').length
  const revenue   = todayBk
    .filter(b => b.status === 'completed')
    .reduce((s, b) => s + (b.price || 0), 0)

  const recent = [...(bookings || [])]
    .sort((a, b) =>
      (b.date + b.time).localeCompare(a.date + a.time)
    )
    .slice(0, 5)

  const markDone = id => {
    setBookings((bookings || []).map(b =>
      b.id === id ? { ...b, status: 'completed' } : b
    ))
    showToast('✅ Marked as completed')
  }

  const cancelBk = id => {
    if (!confirm('Cancel this appointment?')) return
    setBookings((bookings || []).map(b =>
      b.id === id ? { ...b, status: 'cancelled' } : b
    ))
    showToast('❌ Appointment cancelled')
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar open={sidebarOpen}
        onClose={() => setSidebarOpen(false)} />
      {sidebarOpen && (
        <div onClick={() => setSidebarOpen(false)}
          style={{
            position: 'fixed', inset: 0,
            background: 'rgba(0,0,0,.4)', zIndex: 99
          }} />
      )}

      <div className="page-main">
        <Topbar
          title="Dashboard"
          onMenuToggle={() => setSidebarOpen(s => !s)}
        >
          <button
            onClick={() => router.push('/bookings')}
            style={{
              background: '#02C39A', color: '#012B35',
              border: 'none', borderRadius: '8px',
              padding: '8px 16px', fontSize: '.85rem',
              fontWeight: '700', cursor: 'pointer'
            }}
          >
            + Add Booking
          </button>
        </Topbar>

        <div style={{ padding: '16px' }}>

          {/* STAT CARDS */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4,1fr)',
            gap: '12px', marginBottom: '20px'
          }}
            className="stats-grid"
          >
            {[
              { label: "Today's Appointments",
                value: todayBk.length,
                sub: `${confirmed} confirmed · ${pending} pending`,
                dark: false },
              { label: 'Confirmed',
                value: confirmed,
                sub: 'Ready for today',
                dark: false },
              { label: 'Pending',
                value: pending,
                sub: 'Awaiting confirmation',
                dark: false },
              { label: "Today's Revenue",
                value: `₹${revenue.toLocaleString()}`,
                sub: 'From completed visits',
                dark: true },
            ].map(s => (
              <div key={s.label} style={{
                background: s.dark ? '#013A47' : 'white',
                borderRadius: '10px', padding: '16px',
                boxShadow: '0 2px 12px rgba(1,58,71,.08)'
              }}>
                <div style={{
                  fontSize: '.72rem', fontWeight: '700',
                  color: s.dark
                    ? 'rgba(255,255,255,.5)' : '#5B7C85',
                  textTransform: 'uppercase',
                  letterSpacing: '.5px', marginBottom: '6px'
                }}>
                  {s.label}
                </div>
                <div style={{
                  fontSize: '2rem', fontWeight: '700',
                  color: s.dark ? '#02C39A' : '#12333A',
                  lineHeight: 1
                }}>
                  {s.value}
                </div>
                <div style={{
                  fontSize: '.75rem', marginTop: '4px',
                  color: s.dark
                    ? 'rgba(255,255,255,.4)' : '#5B7C85'
                }}>
                  {s.sub}
                </div>
              </div>
            ))}
          </div>

          {/* TODAY'S SCHEDULE */}
          <div style={{
            display: 'flex', justifyContent: 'space-between',
            alignItems: 'center', marginBottom: '12px',
            flexWrap: 'wrap', gap: '8px'
          }}>
            <h2 style={{
              fontSize: '1rem', fontWeight: '700',
              color: '#12333A', margin: 0
            }}>
              📅 Today's Schedule — {fmtDate(t)}
            </h2>
            <button
              onClick={() => router.push('/bookings')}
              style={{
                background: 'none', color: '#028090',
                border: '1.5px solid #028090',
                borderRadius: '8px', padding: '6px 14px',
                fontSize: '.82rem', fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              + Add Booking
            </button>
          </div>

          {todayBk.length === 0 ? (
            <div style={{
              background: 'white', borderRadius: '12px',
              padding: '48px', textAlign: 'center',
              color: '#5B7C85',
              boxShadow: '0 2px 12px rgba(1,58,71,.08)'
            }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>
                🌙
              </div>
              <p style={{ fontWeight: '600', margin: 0 }}>
                No appointments today
              </p>
              <p style={{ fontSize: '.85rem', marginTop: '6px' }}>
                Add one or wait for WhatsApp bookings
              </p>
            </div>
          ) : (
            <div style={{
              display: 'flex', flexDirection: 'column', gap: '10px',
              marginBottom: '24px'
            }}>
              {todayBk.map(b => (
                <div key={b.id} style={{
                  background: 'white', borderRadius: '12px',
                  boxShadow: '0 2px 12px rgba(1,58,71,.08)',
                  padding: '14px 16px',
                  display: 'flex', alignItems: 'center',
                  gap: '12px', flexWrap: 'wrap'
                }}>
                  {/* Time */}
                  <div style={{
                    background: '#F4F9F9', borderRadius: '8px',
                    padding: '8px 10px', textAlign: 'center',
                    minWidth: '58px', flexShrink: 0
                  }}>
                    <span style={{
                      fontSize: '.95rem', fontWeight: '700',
                      color: '#028090', display: 'block'
                    }}>
                      {fmtTime(b.time).split(' ')[0]}
                    </span>
                    <span style={{
                      fontSize: '.65rem', color: '#5B7C85'
                    }}>
                      {fmtTime(b.time).split(' ')[1]}
                    </span>
                  </div>

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: '150px' }}>
                    <div style={{
                      fontWeight: '700', color: '#12333A',
                      fontSize: '.95rem'
                    }}>
                      {b.patientName}
                    </div>
                    <div style={{
                      fontSize: '.78rem', color: '#5B7C85',
                      marginTop: '2px'
                    }}>
                      📞 {b.patientPhone} · 🩺 {b.service}
                      {b.price ? ` · ₹${b.price.toLocaleString()}` : ''}
                    </div>
                  </div>

                  {/* Actions */}
                  <div style={{
                    display: 'flex', gap: '6px',
                    alignItems: 'center', flexWrap: 'wrap',
                    flexShrink: 0
                  }}>
                    <span style={{
                      padding: '3px 10px', borderRadius: '20px',
                      fontSize: '.72rem', fontWeight: '700',
                      background: STATUS[b.status]?.bg || '#F4F9F9',
                      color: STATUS[b.status]?.color || '#5B7C85'
                    }}>
                      {b.status}
                    </span>
                    {(b.status === 'confirmed' ||
                      b.status === 'pending') && (
                      <>
                        <button
                          onClick={() => markDone(b.id)}
                          style={{
                            background: '#E6F7F1',
                            color: '#1a7a50', border: 'none',
                            borderRadius: '6px',
                            padding: '5px 10px',
                            fontSize: '.75rem', fontWeight: '600',
                            cursor: 'pointer'
                          }}
                        >
                          ✓ Done
                        </button>
                        <button
                          onClick={() => router.push(
                            `/consultation?patient=${
                              encodeURIComponent(b.patientName)
                            }&bookingId=${b.id}`
                          )}
                          style={{
                            background: '#E8F4FE',
                            color: '#1a5fa6', border: 'none',
                            borderRadius: '6px',
                            padding: '5px 10px',
                            fontSize: '.75rem', fontWeight: '600',
                            cursor: 'pointer'
                          }}
                        >
                          🩺 Consult
                        </button>
                        <button
                          onClick={() => cancelBk(b.id)}
                          style={{
                            background: '#FFE8E8',
                            color: '#c0392b', border: 'none',
                            borderRadius: '6px',
                            padding: '5px 10px',
                            fontSize: '.75rem', fontWeight: '600',
                            cursor: 'pointer'
                          }}
                        >
                          ✕
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* RECENT ACTIVITY */}
          <h2 style={{
            fontSize: '1rem', fontWeight: '700',
            color: '#12333A', marginBottom: '12px'
          }}>
            🕐 Recent Activity
          </h2>
          <div style={{
            background: 'white', borderRadius: '12px',
            boxShadow: '0 2px 12px rgba(1,58,71,.08)',
            overflow: 'hidden'
          }}>
            {recent.length === 0 ? (
              <div style={{
                padding: '32px', textAlign: 'center',
                color: '#5B7C85'
              }}>
                No recent activity
              </div>
            ) : (
              <table style={{
                width: '100%', borderCollapse: 'collapse'
              }}>
                <thead>
                  <tr style={{ background: '#F4F9F9' }}>
                    {['Date','Patient','Service','Status'].map(h => (
                      <th key={h} style={{
                        padding: '10px 14px', textAlign: 'left',
                        fontSize: '.72rem', fontWeight: '700',
                        color: '#5B7C85',
                        textTransform: 'uppercase',
                        letterSpacing: '.5px',
                        borderBottom: '1px solid #DCEAEC'
                      }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {recent.map((b, i) => (
                    <tr
                      key={b.id}
                      onClick={() => router.push('/bookings')}
                      style={{
                        cursor: 'pointer',
                        borderBottom: i < recent.length - 1
                          ? '1px solid #DCEAEC' : 'none'
                      }}
                    >
                      <td style={{
                        padding: '10px 14px',
                        fontSize: '.82rem', color: '#5B7C85'
                      }}>
                        {new Date(b.date + 'T00:00:00')
                          .toLocaleDateString('en-GB', {
                            day: '2-digit', month: 'short'
                          })}
                      </td>
                      <td style={{
                        padding: '10px 14px',
                        fontSize: '.85rem', fontWeight: '600',
                        color: '#12333A'
                      }}>
                        {b.patientName}
                      </td>
                      <td style={{
                        padding: '10px 14px',
                        fontSize: '.82rem', color: '#5B7C85'
                      }}>
                        {b.service}
                      </td>
                      <td style={{ padding: '10px 14px' }}>
                        <span style={{
                          padding: '2px 8px',
                          borderRadius: '20px',
                          fontSize: '.7rem',
                          fontWeight: '700',
                          background:
                            STATUS[b.status]?.bg || '#F4F9F9',
                          color:
                            STATUS[b.status]?.color || '#5B7C85'
                        }}>
                          {b.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {toast && (
        <div style={{
          position: 'fixed', bottom: '24px', right: '24px',
          background: '#12333A', color: 'white',
          padding: '12px 20px', borderRadius: '10px',
          fontSize: '.88rem', fontWeight: '500',
          boxShadow: '0 8px 24px rgba(0,0,0,.2)', zIndex: 9999
        }}>
          {toast}
        </div>
      )}
    </div>
  )
}