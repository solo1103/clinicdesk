'use client'
import { useState, useEffect } from 'react'
import Sidebar from '../../components/Sidebar'
import Topbar from '../../components/Topbar'
import { useApp } from '../../lib/AppContext'

const SPECIALTIES = [
  { key:'general',     icon:'🩺', label:'General Physician' },
  { key:'dental',      icon:'🦷', label:'Dental Clinic'     },
  { key:'dermatology', icon:'🧴', label:'Dermatology'       },
  { key:'pediatrics',  icon:'👶', label:'Pediatrics'        },
  { key:'gynecology',  icon:'🤰', label:'Gynecology'        },
  { key:'orthopedic',  icon:'🦴', label:'Orthopedic'        },
  { key:'ent',         icon:'👂', label:'ENT'               },
  { key:'ophthalmology',icon:'👁️',label:'Ophthalmology'    },
]

const DAYS = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun']

const STORAGE_KEY = 'clinicdesk_settings'

const DEFAULT = {
  clinicName:    'My Clinic',
  doctorName:    'Dr. Name',
  qualifications:'MBBS',
  regNumber:     '',
  phone:         '',
  email:         '',
  address:       '',
  specialty:     'general',
  openTime:      '09:00',
  closeTime:     '18:00',
  slotDuration:  '30',
  workingDays:   ['Mon','Tue','Wed','Thu','Fri','Sat'],
  letterhead:    '',
  prescriptionValidity: '30',
  showVitals:    true,
  signatureText: '',
  whatsappNumber:'',
  webhookUrl:    '',
}

export default function SettingsPage() {
  const { setSpecialty } = useApp() || {}
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [settings,    setSettings]    = useState(DEFAULT)
  const [toast,       setToast]       = useState('')
  const [saved,       setSaved]       = useState(false)

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) setSettings({ ...DEFAULT, ...JSON.parse(stored) })
    } catch {}
  }, [])

  const showToast = msg => {
    setToast(msg)
    setTimeout(() => setToast(''), 2500)
  }

  const update = (key, val) =>
    setSettings(s => ({ ...s, [key]: val }))

  const toggleDay = day => {
    const days = settings.workingDays.includes(day)
      ? settings.workingDays.filter(d => d !== day)
      : [...settings.workingDays, day]
    update('workingDays', days)
  }

  const handleSave = () => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
      if (setSpecialty) setSpecialty(settings.specialty)
      setSaved(true)
      showToast('✅ Settings saved successfully')
      setTimeout(() => setSaved(false), 3000)
    } catch {
      showToast('❌ Could not save settings')
    }
  }

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
  const card = {
    background:'white', borderRadius:'12px',
    boxShadow:'0 2px 12px rgba(1,58,71,.08)',
    padding:'20px', marginBottom:'16px'
  }
  const sectionTitle = {
    fontSize:'1rem', fontWeight:'700',
    color:'#12333A', marginBottom:'16px',
    paddingBottom:'10px',
    borderBottom:'1px solid #DCEAEC'
  }
  const grid2 = {
    display:'grid',
    gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))',
    gap:'12px', marginBottom:'12px'
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
          }}
        />
      )}

      <div className="page-main">
        <Topbar
          title="Settings"
          onMenuToggle={() => setSidebarOpen(s => !s)}
        >
          <button
            onClick={handleSave}
            style={{
              background: saved ? '#02C39A' : '#028090',
              color:'white', border:'none',
              borderRadius:'8px', padding:'8px 20px',
              fontSize:'.88rem', fontWeight:'700',
              cursor:'pointer', transition:'background .3s'
            }}
          >
            {saved ? '✅ Saved!' : 'Save Settings'}
          </button>
        </Topbar>

        <div style={{ padding:'16px', maxWidth:'720px' }}>

          {/* SECTION 1 — Clinic Info */}
          <div style={card}>
            <h3 style={sectionTitle}>🏥 Clinic Information</h3>
            <div style={grid2}>
              <div>
                <label style={lbl}>Clinic Name</label>
                <input type="text"
                  placeholder="e.g. City Medical Practice"
                  value={settings.clinicName}
                  onChange={e => update('clinicName', e.target.value)}
                  style={inp}
                />
              </div>
              <div>
                <label style={lbl}>Doctor Full Name</label>
                <input type="text"
                  placeholder="e.g. Dr. James Wilson"
                  value={settings.doctorName}
                  onChange={e => update('doctorName', e.target.value)}
                  style={inp}
                />
              </div>
              <div>
                <label style={lbl}>Qualifications</label>
                <input type="text"
                  placeholder="e.g. MBBS, MD, MRCGP"
                  value={settings.qualifications}
                  onChange={e =>
                    update('qualifications', e.target.value)
                  }
                  style={inp}
                />
              </div>
              <div>
                <label style={lbl}>
                  Registration Number
                </label>
                <input type="text"
                  placeholder="e.g. GMC: 1234567"
                  value={settings.regNumber}
                  onChange={e => update('regNumber', e.target.value)}
                  style={inp}
                />
              </div>
              <div>
                <label style={lbl}>Phone</label>
                <input type="tel"
                  placeholder="+91 98765 43210"
                  value={settings.phone}
                  onChange={e => update('phone', e.target.value)}
                  style={inp}
                />
              </div>
              <div>
                <label style={lbl}>Email</label>
                <input type="email"
                  placeholder="doctor@clinic.com"
                  value={settings.email}
                  onChange={e => update('email', e.target.value)}
                  style={inp}
                />
              </div>
            </div>
            <div>
              <label style={lbl}>Clinic Address</label>
              <textarea
                placeholder="Full clinic address"
                value={settings.address}
                onChange={e => update('address', e.target.value)}
                style={{
                  ...inp, minHeight:'70px', resize:'vertical'
                }}
              />
            </div>
          </div>

          {/* SECTION 2 — Specialty */}
          <div style={card}>
            <h3 style={sectionTitle}>🩺 Clinic Specialty</h3>
            <div style={{
              display:'grid',
              gridTemplateColumns:
                'repeat(auto-fill,minmax(140px,1fr))',
              gap:'10px'
            }}>
              {SPECIALTIES.map(sp => (
                <div
                  key={sp.key}
                  onClick={() => update('specialty', sp.key)}
                  style={{
                    border: settings.specialty === sp.key
                      ? '2px solid #028090'
                      : '2px solid #DCEAEC',
                    background: settings.specialty === sp.key
                      ? '#E6F4F7' : 'white',
                    borderRadius:'10px',
                    padding:'14px 10px',
                    textAlign:'center',
                    cursor:'pointer',
                    transition:'all .15s'
                  }}
                >
                  <div style={{
                    fontSize:'1.8rem', marginBottom:'6px'
                  }}>
                    {sp.icon}
                  </div>
                  <div style={{
                    fontSize:'.78rem', fontWeight:'700',
                    color: settings.specialty === sp.key
                      ? '#028090' : '#12333A'
                  }}>
                    {sp.label}
                  </div>
                  {settings.specialty === sp.key && (
                    <div style={{
                      fontSize:'.65rem', color:'#028090',
                      marginTop:'3px'
                    }}>
                      ✓ Active
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* SECTION 3 — Working Hours */}
          <div style={card}>
            <h3 style={sectionTitle}>⏰ Working Hours</h3>
            <div style={grid2}>
              <div>
                <label style={lbl}>Opening Time</label>
                <input type="time"
                  value={settings.openTime}
                  onChange={e => update('openTime', e.target.value)}
                  style={inp}
                />
              </div>
              <div>
                <label style={lbl}>Closing Time</label>
                <input type="time"
                  value={settings.closeTime}
                  onChange={e =>
                    update('closeTime', e.target.value)
                  }
                  style={inp}
                />
              </div>
              <div>
                <label style={lbl}>
                  Appointment Duration
                </label>
                <select
                  value={settings.slotDuration}
                  onChange={e =>
                    update('slotDuration', e.target.value)
                  }
                  style={inp}
                >
                  <option value="10">10 minutes</option>
                  <option value="15">15 minutes</option>
                  <option value="20">20 minutes</option>
                  <option value="30">30 minutes</option>
                  <option value="45">45 minutes</option>
                  <option value="60">60 minutes</option>
                </select>
              </div>
            </div>

            <label style={{ ...lbl, marginBottom:'10px' }}>
              Working Days
            </label>
            <div style={{
              display:'flex', flexWrap:'wrap', gap:'8px'
            }}>
              {DAYS.map(day => (
                <button
                  key={day}
                  onClick={() => toggleDay(day)}
                  style={{
                    padding:'8px 16px',
                    borderRadius:'8px',
                    border:'1.5px solid',
                    borderColor: settings.workingDays.includes(day)
                      ? '#028090' : '#DCEAEC',
                    background: settings.workingDays.includes(day)
                      ? '#028090' : 'white',
                    color: settings.workingDays.includes(day)
                      ? 'white' : '#5B7C85',
                    fontWeight:'700',
                    fontSize:'.85rem',
                    cursor:'pointer'
                  }}
                >
                  {day}
                </button>
              ))}
            </div>
          </div>

          {/* SECTION 4 — Prescription Defaults */}
          <div style={card}>
            <h3 style={sectionTitle}>
              💊 Prescription Settings
            </h3>
            <div style={{ marginBottom:'12px' }}>
              <label style={lbl}>
                Clinic Letterhead Text
              </label>
              <textarea
                placeholder={
                  `${settings.clinicName}\n` +
                  `${settings.doctorName}\n` +
                  `${settings.qualifications}\n` +
                  `${settings.address}`
                }
                value={settings.letterhead}
                onChange={e =>
                  update('letterhead', e.target.value)
                }
                style={{
                  ...inp, minHeight:'90px', resize:'vertical'
                }}
              />
              <p style={{
                fontSize:'.75rem', color:'#5B7C85',
                marginTop:'4px'
              }}>
                Appears at top of printed prescriptions.
                Leave blank to auto-fill from clinic info above.
              </p>
            </div>
            <div style={grid2}>
              <div>
                <label style={lbl}>
                  Prescription Valid For
                </label>
                <select
                  value={settings.prescriptionValidity}
                  onChange={e =>
                    update('prescriptionValidity', e.target.value)
                  }
                  style={inp}
                >
                  <option value="7">7 days</option>
                  <option value="14">14 days</option>
                  <option value="30">30 days</option>
                  <option value="60">60 days</option>
                  <option value="90">90 days</option>
                </select>
              </div>
              <div>
                <label style={lbl}>Signature Text</label>
                <input type="text"
                  placeholder="e.g. Dr. James Wilson"
                  value={settings.signatureText}
                  onChange={e =>
                    update('signatureText', e.target.value)
                  }
                  style={inp}
                />
              </div>
            </div>
            <label style={{
              display:'flex', alignItems:'center',
              gap:'10px', cursor:'pointer',
              marginTop:'4px'
            }}>
              <input
                type="checkbox"
                checked={settings.showVitals}
                onChange={e =>
                  update('showVitals', e.target.checked)
                }
              />
              <span style={{
                fontSize:'.88rem', color:'#12333A',
                fontWeight:'600'
              }}>
                Show vitals on printed prescription
              </span>
            </label>
          </div>

          {/* SECTION 5 — WhatsApp Bot */}
          <div style={card}>
            <h3 style={sectionTitle}>
              📱 WhatsApp Bot Connection
            </h3>
            <div style={{
              background:'#E6F7F1',
              border:'1px solid #b2dfdb',
              borderRadius:'8px',
              padding:'10px 14px',
              marginBottom:'16px',
              fontSize:'.83rem',
              color:'#1a7a50'
            }}>
              💡 Holiday dates and available slots from this
              dashboard are read by your WhatsApp bot
              automatically. Keep settings updated.
            </div>
            <div style={grid2}>
              <div>
                <label style={lbl}>Bot WhatsApp Number</label>
                <input type="tel"
                  placeholder="+91 98765 43210"
                  value={settings.whatsappNumber}
                  onChange={e =>
                    update('whatsappNumber', e.target.value)
                  }
                  style={inp}
                />
              </div>
              <div>
                <label style={lbl}>n8n Webhook URL</label>
                <input type="text"
                  placeholder="https://your-domain/webhook/..."
                  value={settings.webhookUrl}
                  onChange={e =>
                    update('webhookUrl', e.target.value)
                  }
                  style={inp}
                />
              </div>
            </div>
            <div style={{
              display:'flex', alignItems:'center',
              gap:'8px'
            }}>
              <div style={{
                width:'10px', height:'10px',
                borderRadius:'50%',
                background: settings.webhookUrl
                  ? '#02C39A' : '#c0392b'
              }} />
              <span style={{
                fontSize:'.82rem', color:'#5B7C85'
              }}>
                {settings.webhookUrl
                  ? 'Webhook URL configured'
                  : 'Webhook URL not set'}
              </span>
            </div>
          </div>

          {/* SAVE BUTTON */}
          <button
            onClick={handleSave}
            style={{
              width:'100%',
              background: saved ? '#02C39A' : '#028090',
              color:'white', border:'none',
              borderRadius:'10px', padding:'14px',
              fontSize:'1rem', fontWeight:'700',
              cursor:'pointer', marginBottom:'40px',
              transition:'background .3s'
            }}
          >
            {saved ? '✅ Settings Saved!' : 'Save All Settings'}
          </button>

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