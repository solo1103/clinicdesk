'use client'
export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import Sidebar from '../../components/Sidebar'
import Topbar from '../../components/Topbar'
import { useApp } from '../../lib/AppContext'

const SPECIALTIES = [
  {key:'general',     icon:'🩺',label:'General Physician'},
  {key:'dental',      icon:'🦷',label:'Dental Clinic'},
  {key:'dermatology', icon:'🧴',label:'Dermatology'},
  {key:'pediatrics',  icon:'👶',label:'Pediatrics'},
  {key:'gynecology',  icon:'🤰',label:'Gynecology'},
  {key:'orthopedic',  icon:'🦴',label:'Orthopedic'},
  {key:'ent',         icon:'👂',label:'ENT'},
  {key:'ophthalmology',icon:'👁️',label:'Ophthalmology'},
]

const DAYS = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun']
const KEY  = 'clinicdesk_settings'

const DEFAULT = {
  clinicName:'My Clinic',doctorName:'Dr. Name',
  qualifications:'MBBS',regNumber:'',
  phone:'',email:'',address:'',
  specialty:'general',
  openTime:'09:00',closeTime:'18:00',
  slotDuration:'30',
  workingDays:['Mon','Tue','Wed','Thu','Fri','Sat'],
  letterhead:'',prescriptionValidity:'30',
  showVitals:true,signatureText:'',
  whatsappNumber:'',webhookUrl:'',
}

export default function SettingsPage() {
  const { setSpecialty } = useApp() || {}
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [settings,    setSettings]    = useState(DEFAULT)
  const [toast,       setToast]       = useState('')
  const [saved,       setSaved]       = useState(false)

  useEffect(()=>{
    try {
      const s = localStorage.getItem(KEY)
      if(s) setSettings({...DEFAULT,...JSON.parse(s)})
    } catch{}
  },[])

  const showToast = msg => {
    setToast(msg); setTimeout(()=>setToast(''),2500)
  }

  const update = (k,v) => setSettings(s=>({...s,[k]:v}))

  const toggleDay = day => {
    const days = settings.workingDays.includes(day)
      ? settings.workingDays.filter(d=>d!==day)
      : [...settings.workingDays,day]
    update('workingDays',days)
  }

  const handleSave = () => {
    try {
      localStorage.setItem(KEY,JSON.stringify(settings))
      if(setSpecialty) setSpecialty(settings.specialty)
      setSaved(true)
      showToast('✅ Settings saved')
      setTimeout(()=>setSaved(false),3000)
    } catch {
      showToast('❌ Could not save')
    }
  }

  const inp = {
    width:'100%',padding:'9px 12px',
    border:'1.5px solid #DCEAEC',borderRadius:'8px',
    fontSize:'.9rem',color:'#12333A',
    background:'white',boxSizing:'border-box'
  }
  const lbl = {
    fontSize:'.78rem',fontWeight:'700',color:'#12333A',
    display:'block',marginBottom:'4px',
    textTransform:'uppercase',letterSpacing:'.5px'
  }
  const card = {
    background:'white',borderRadius:'12px',
    boxShadow:'0 2px 12px rgba(1,58,71,.08)',
    padding:'20px',marginBottom:'16px'
  }
  const sTitle = {
    fontSize:'1rem',fontWeight:'700',color:'#12333A',
    marginBottom:'16px',paddingBottom:'10px',
    borderBottom:'1px solid #DCEAEC'
  }
  const grid2 = {
    display:'grid',
    gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))',
    gap:'12px',marginBottom:'12px'
  }

  return (
    <div style={{display:'flex',minHeight:'100vh'}}>
      <Sidebar open={sidebarOpen}
        onClose={()=>setSidebarOpen(false)}/>
      {sidebarOpen&&(
        <div onClick={()=>setSidebarOpen(false)}
          style={{position:'fixed',inset:0,
            background:'rgba(0,0,0,.4)',zIndex:99}}/>
      )}

      <div className="page-main">
        <Topbar title="Settings"
          onMenuToggle={()=>setSidebarOpen(s=>!s)}>
          <button onClick={handleSave} style={{
            background:saved?'#02C39A':'#028090',
            color:'white',border:'none',borderRadius:'8px',
            padding:'8px 20px',fontSize:'.88rem',
            fontWeight:'700',cursor:'pointer',
            transition:'background .3s'
          }}>
            {saved?'✅ Saved!':'Save Settings'}
          </button>
        </Topbar>

        <div style={{padding:'16px',maxWidth:'700px'}}>

          {/* CLINIC INFO */}
          <div style={card}>
            <h3 style={sTitle}>🏥 Clinic Information</h3>
            <div style={grid2}>
              {[
                {key:'clinicName',label:'Clinic Name',
                  ph:'City Medical Practice'},
                {key:'doctorName',label:'Doctor Name',
                  ph:'Dr. James Wilson'},
                {key:'qualifications',label:'Qualifications',
                  ph:'MBBS, MD'},
                {key:'regNumber',label:'Registration No.',
                  ph:'GMC: 1234567'},
                {key:'phone',label:'Phone',ph:'+91 98765 43210'},
                {key:'email',label:'Email',ph:'doctor@clinic.com'},
              ].map(f=>(
                <div key={f.key}>
                  <label style={lbl}>{f.label}</label>
                  <input type="text" placeholder={f.ph}
                    value={settings[f.key]}
                    onChange={e=>update(f.key,e.target.value)}
                    style={inp}/>
                </div>
              ))}
            </div>
            <div>
              <label style={lbl}>Address</label>
              <textarea placeholder="Full clinic address"
                value={settings.address}
                onChange={e=>update('address',e.target.value)}
                style={{...inp,minHeight:'60px',resize:'vertical'}}/>
            </div>
          </div>

          {/* SPECIALTY */}
          <div style={card}>
            <h3 style={sTitle}>🩺 Clinic Specialty</h3>
            <div style={{
              display:'grid',
              gridTemplateColumns:
                'repeat(auto-fill,minmax(130px,1fr))',
              gap:'10px'
            }}>
              {SPECIALTIES.map(sp=>(
                <div key={sp.key}
                  onClick={()=>update('specialty',sp.key)}
                  style={{
                    border:`2px solid ${
                      settings.specialty===sp.key
                        ?'#028090':'#DCEAEC'
                    }`,
                    background:settings.specialty===sp.key
                      ?'#E6F4F7':'white',
                    borderRadius:'10px',padding:'14px 10px',
                    textAlign:'center',cursor:'pointer',
                    transition:'all .15s'
                  }}>
                  <div style={{
                    fontSize:'1.8rem',marginBottom:'6px'
                  }}>
                    {sp.icon}
                  </div>
                  <div style={{
                    fontSize:'.75rem',fontWeight:'700',
                    color:settings.specialty===sp.key
                      ?'#028090':'#12333A'
                  }}>
                    {sp.label}
                  </div>
                  {settings.specialty===sp.key&&(
                    <div style={{
                      fontSize:'.65rem',color:'#028090',
                      marginTop:'3px'
                    }}>
                      ✓ Active
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* WORKING HOURS */}
          <div style={card}>
            <h3 style={sTitle}>⏰ Working Hours</h3>
            <div style={grid2}>
              <div>
                <label style={lbl}>Opening Time</label>
                <input type="time" value={settings.openTime}
                  onChange={e=>update('openTime',e.target.value)}
                  style={inp}/>
              </div>
              <div>
                <label style={lbl}>Closing Time</label>
                <input type="time" value={settings.closeTime}
                  onChange={e=>update('closeTime',e.target.value)}
                  style={inp}/>
              </div>
              <div>
                <label style={lbl}>Slot Duration</label>
                <select value={settings.slotDuration}
                  onChange={e=>update('slotDuration',e.target.value)}
                  style={inp}>
                  {['10','15','20','30','45','60'].map(d=>
                    <option key={d} value={d}>{d} minutes</option>
                  )}
                </select>
              </div>
            </div>
            <label style={{...lbl,marginBottom:'10px'}}>
              Working Days
            </label>
            <div style={{display:'flex',flexWrap:'wrap',gap:'8px'}}>
              {DAYS.map(day=>(
                <button key={day} onClick={()=>toggleDay(day)}
                  style={{
                    padding:'8px 14px',borderRadius:'8px',
                    border:'1.5px solid',
                    borderColor:settings.workingDays.includes(day)
                      ?'#028090':'#DCEAEC',
                    background:settings.workingDays.includes(day)
                      ?'#028090':'white',
                    color:settings.workingDays.includes(day)
                      ?'white':'#5B7C85',
                    fontWeight:'700',fontSize:'.85rem',
                    cursor:'pointer'
                  }}>
                  {day}
                </button>
              ))}
            </div>
          </div>

          {/* PRESCRIPTION */}
          <div style={card}>
            <h3 style={sTitle}>💊 Prescription Settings</h3>
            <div style={{marginBottom:'12px'}}>
              <label style={lbl}>Letterhead Text</label>
              <textarea
                placeholder="Clinic name, doctor name, address..."
                value={settings.letterhead}
                onChange={e=>update('letterhead',e.target.value)}
                style={{...inp,minHeight:'70px',resize:'vertical'}}/>
              <p style={{
                fontSize:'.73rem',color:'#5B7C85',marginTop:'4px'
              }}>
                Leave blank to auto-fill from clinic info above.
              </p>
            </div>
            <div style={grid2}>
              <div>
                <label style={lbl}>Prescription Valid For</label>
                <select value={settings.prescriptionValidity}
                  onChange={e=>update('prescriptionValidity',
                    e.target.value)}
                  style={inp}>
                  {['7','14','30','60','90'].map(d=>
                    <option key={d} value={d}>{d} days</option>
                  )}
                </select>
              </div>
              <div>
                <label style={lbl}>Signature Text</label>
                <input type="text" placeholder="Dr. Name"
                  value={settings.signatureText}
                  onChange={e=>update('signatureText',e.target.value)}
                  style={inp}/>
              </div>
            </div>
            <label style={{
              display:'flex',alignItems:'center',
              gap:'10px',cursor:'pointer',marginTop:'4px'
            }}>
              <input type="checkbox" checked={settings.showVitals}
                onChange={e=>update('showVitals',e.target.checked)}/>
              <span style={{
                fontSize:'.88rem',color:'#12333A',fontWeight:'600'
              }}>
                Show vitals on printed prescription
              </span>
            </label>
          </div>

          {/* WHATSAPP BOT */}
          <div style={card}>
            <h3 style={sTitle}>📱 WhatsApp Bot</h3>
            <div style={{
              background:'#E6F7F1',border:'1px solid #b2dfdb',
              borderRadius:'8px',padding:'10px 14px',
              marginBottom:'14px',fontSize:'.82rem',color:'#1a7a50'
            }}>
              💡 Holiday dates and available slots are read by your
              WhatsApp bot automatically.
            </div>
            <div style={grid2}>
              <div>
                <label style={lbl}>Bot WhatsApp Number</label>
                <input type="tel"
                  placeholder="+91 98765 43210"
                  value={settings.whatsappNumber}
                  onChange={e=>update('whatsappNumber',e.target.value)}
                  style={inp}/>
              </div>
              <div>
                <label style={lbl}>n8n Webhook URL</label>
                <input type="text"
                  placeholder="https://your-domain/webhook/..."
                  value={settings.webhookUrl}
                  onChange={e=>update('webhookUrl',e.target.value)}
                  style={inp}/>
              </div>
            </div>
            <div style={{
              display:'flex',alignItems:'center',gap:'8px'
            }}>
              <div style={{
                width:'10px',height:'10px',borderRadius:'50%',
                background:settings.webhookUrl?'#02C39A':'#c0392b'
              }}/>
              <span style={{fontSize:'.82rem',color:'#5B7C85'}}>
                {settings.webhookUrl
                  ?'Webhook URL configured'
                  :'Webhook URL not set'}
              </span>
            </div>
          </div>

          {/* SAVE BUTTON */}
          <button onClick={handleSave} style={{
            width:'100%',
            background:saved?'#02C39A':'#028090',
            color:'white',border:'none',borderRadius:'10px',
            padding:'14px',fontSize:'1rem',fontWeight:'700',
            cursor:'pointer',marginBottom:'40px',
            transition:'background .3s'
          }}>
            {saved?'✅ Settings Saved!':'Save All Settings'}
          </button>
        </div>
      </div>

      {toast&&(
        <div style={{
          position:'fixed',bottom:'24px',right:'24px',
          background:'#12333A',color:'white',
          padding:'12px 20px',borderRadius:'10px',
          fontSize:'.88rem',fontWeight:'500',
          boxShadow:'0 8px 24px rgba(0,0,0,.2)',zIndex:9999
        }}>
          {toast}
        </div>
      )}
    </div>
  )
}