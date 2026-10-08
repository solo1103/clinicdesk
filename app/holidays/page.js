'use client'
export const dynamic = 'force-dynamic'

import { useState } from 'react'
import Sidebar from '../../components/Sidebar'
import Topbar from '../../components/Topbar'
import { useApp } from '../../lib/AppContext'

const uid = () => Math.random().toString(36).slice(2,9)
const today = () => new Date().toISOString().slice(0,10)
const fmtDate = d => {
  if(!d) return ''
  return new Date(d+'T00:00:00').toLocaleDateString('en-GB',{
    weekday:'long',day:'2-digit',month:'long',year:'numeric'
  })
}

export default function HolidaysPage() {
  const { holidays, setHolidays } = useApp()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [date,        setDate]        = useState('')
  const [reason,      setReason]      = useState('')
  const [toast,       setToast]       = useState('')
  const [deleteId,    setDeleteId]    = useState(null)

  const showToast = msg => {
    setToast(msg)
    setTimeout(() => setToast(''), 2500)
  }

  const upcoming = (holidays||[])
    .filter(h => h.date >= today())
    .sort((a,b) => a.date.localeCompare(b.date))

  const past = (holidays||[])
    .filter(h => h.date < today())
    .sort((a,b) => b.date.localeCompare(a.date))

  const handleAdd = () => {
    if(!date){ showToast('⚠️ Please select a date'); return }
    if(!reason.trim()){ showToast('⚠️ Please enter a reason'); return }
    if((holidays||[]).find(h => h.date===date)){
      showToast('⚠️ This date is already blocked'); return
    }
    setHolidays([...(holidays||[]),
      { id:uid(), date, reason:reason.trim() }])
    setDate(''); setReason('')
    showToast('🗓️ Date blocked successfully')
  }

  const handleDelete = id => {
    setHolidays((holidays||[]).filter(h => h.id!==id))
    setDeleteId(null)
    showToast('✅ Holiday removed')
  }

  const quickReasons = [
    'Weekly Off','Bank Holiday','Personal Leave',
    'Clinic Maintenance','National Holiday'
  ]

  const inp = {
    width:'100%',padding:'9px 12px',
    border:'1.5px solid #DCEAEC',borderRadius:'8px',
    fontSize:'.9rem',color:'#12333A',
    background:'white',boxSizing:'border-box'
  }

  const HCard = ({ h, isPast }) => {
    const d = new Date(h.date+'T00:00:00')
    return (
      <div style={{
        background:'white',borderRadius:'12px',
        boxShadow:'0 2px 12px rgba(1,58,71,.08)',
        padding:'14px 16px',
        display:'flex',alignItems:'center',
        gap:'14px',opacity:isPast?.55:1
      }}>
        <div style={{
          background:'#013A47',borderRadius:'10px',
          padding:'10px 14px',textAlign:'center',
          minWidth:'58px',flexShrink:0
        }}>
          <span style={{
            fontSize:'1.3rem',fontWeight:'700',
            color:'#02C39A',display:'block',lineHeight:1
          }}>
            {d.getDate()}
          </span>
          <span style={{
            fontSize:'.65rem',
            color:'rgba(255,255,255,.6)',
            textTransform:'uppercase'
          }}>
            {d.toLocaleDateString('en-GB',{month:'short'})}
          </span>
        </div>
        <div style={{flex:1,minWidth:0}}>
          <div style={{fontWeight:'700',color:'#12333A',fontSize:'.92rem'}}>
            {h.reason}
          </div>
          <div style={{fontSize:'.78rem',color:'#5B7C85',marginTop:'2px'}}>
            {fmtDate(h.date)}
            {isPast&&(
              <span style={{marginLeft:'8px',color:'#c0392b',fontStyle:'italic'}}>
                · Past
              </span>
            )}
          </div>
        </div>
        {!isPast&&(
          <button onClick={()=>setDeleteId(h.id)}
            style={{
              background:'#FFE8E8',color:'#c0392b',
              border:'none',borderRadius:'8px',
              padding:'7px 12px',fontSize:'.8rem',
              fontWeight:'600',cursor:'pointer',flexShrink:0
            }}>
            🗑
          </button>
        )}
      </div>
    )
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
        <Topbar title="Holidays & Closures"
          onMenuToggle={()=>setSidebarOpen(s=>!s)}/>

        <div style={{padding:'16px'}}>

          {/* WARNING BANNER */}
          <div style={{
            background:'#FFF9E6',border:'1px solid #F6D860',
            borderRadius:'10px',padding:'12px 16px',
            marginBottom:'20px',display:'flex',
            alignItems:'flex-start',gap:'10px'
          }}>
            <span style={{fontSize:'1.2rem'}}>⚠️</span>
            <div>
              <p style={{fontWeight:'700',color:'#7a5a00',
                fontSize:'.88rem',margin:'0 0 2px 0'}}>
                WhatsApp Bot Connected
              </p>
              <p style={{color:'#7a5a00',fontSize:'.82rem',margin:0}}>
                Dates blocked here are automatically hidden from
                patients in the WhatsApp booking bot.
              </p>
            </div>
          </div>

          {/* UPCOMING */}
          <h2 style={{fontSize:'1rem',fontWeight:'700',
            color:'#12333A',marginBottom:'12px'}}>
            📅 Upcoming Closures ({upcoming.length})
          </h2>
          {upcoming.length===0?(
            <div style={{
              background:'white',borderRadius:'12px',
              padding:'32px',textAlign:'center',color:'#5B7C85',
              boxShadow:'0 2px 12px rgba(1,58,71,.08)',
              marginBottom:'20px'
            }}>
              <div style={{fontSize:'2rem',marginBottom:'8px'}}>✅</div>
              <p style={{margin:0,fontWeight:'600'}}>
                No closures scheduled
              </p>
            </div>
          ):(
            <div style={{display:'flex',flexDirection:'column',
              gap:'10px',marginBottom:'20px'}}>
              {upcoming.map(h=>
                <HCard key={h.id} h={h} isPast={false}/>
              )}
            </div>
          )}

          {/* ADD FORM */}
          <div style={{
            background:'white',borderRadius:'12px',
            boxShadow:'0 2px 12px rgba(1,58,71,.08)',
            padding:'20px',marginBottom:'20px'
          }}>
            <h3 style={{fontSize:'1rem',fontWeight:'700',
              color:'#12333A',marginBottom:'16px'}}>
              🚫 Block a Date
            </h3>
            <div style={{
              display:'grid',
              gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))',
              gap:'12px',marginBottom:'12px'
            }}>
              <div>
                <label style={{fontSize:'.78rem',fontWeight:'700',
                  color:'#12333A',display:'block',marginBottom:'4px'}}>
                  Date *
                </label>
                <input type="date" min={today()} value={date}
                  onChange={e=>setDate(e.target.value)} style={inp}/>
              </div>
              <div>
                <label style={{fontSize:'.78rem',fontWeight:'700',
                  color:'#12333A',display:'block',marginBottom:'4px'}}>
                  Reason *
                </label>
                <input type="text"
                  placeholder="e.g. Diwali, Weekly Off"
                  value={reason}
                  onChange={e=>setReason(e.target.value)}
                  style={inp}/>
              </div>
            </div>

            <div style={{
              display:'flex',flexWrap:'wrap',
              gap:'8px',marginBottom:'16px'
            }}>
              {quickReasons.map(r=>(
                <button key={r} onClick={()=>setReason(r)}
                  style={{
                    background:reason===r?'#028090':'#F4F9F9',
                    color:reason===r?'white':'#5B7C85',
                    border:'1px solid #DCEAEC',
                    borderRadius:'20px',padding:'5px 14px',
                    fontSize:'.78rem',fontWeight:'600',
                    cursor:'pointer'
                  }}>
                  {r}
                </button>
              ))}
            </div>

            <button onClick={handleAdd} style={{
              background:'#028090',color:'white',
              border:'none',borderRadius:'8px',
              padding:'11px 24px',fontSize:'.92rem',
              fontWeight:'700',cursor:'pointer'
            }}>
              🚫 Block This Date
            </button>
          </div>

          {/* PAST */}
          {past.length>0&&(
            <div>
              <h2 style={{fontSize:'.9rem',fontWeight:'700',
                color:'#5B7C85',marginBottom:'12px'}}>
                Past Closures ({past.length})
              </h2>
              <div style={{display:'flex',flexDirection:'column',gap:'8px'}}>
                {past.slice(0,5).map(h=>
                  <HCard key={h.id} h={h} isPast={true}/>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* DELETE CONFIRM */}
      {deleteId&&(
        <div onClick={()=>setDeleteId(null)} style={{
          position:'fixed',inset:0,
          background:'rgba(0,0,0,.5)',zIndex:1000,
          display:'flex',alignItems:'center',
          justifyContent:'center',padding:'16px'
        }}>
          <div onClick={e=>e.stopPropagation()} style={{
            background:'white',borderRadius:'14px',
            padding:'28px',width:'100%',maxWidth:'340px',
            textAlign:'center'
          }}>
            <div style={{fontSize:'2.5rem',marginBottom:'12px'}}>🗓️</div>
            <h3 style={{fontSize:'1rem',fontWeight:'700',
              color:'#12333A',marginBottom:'8px'}}>
              Remove this closure?
            </h3>
            <p style={{color:'#5B7C85',fontSize:'.85rem',
              marginBottom:'20px'}}>
              Patients will be able to book this date on WhatsApp again.
            </p>
            <div style={{display:'flex',gap:'10px',justifyContent:'center'}}>
              <button onClick={()=>handleDelete(deleteId)} style={{
                background:'#E53E3E',color:'white',border:'none',
                borderRadius:'8px',padding:'10px 20px',
                fontSize:'.9rem',fontWeight:'700',cursor:'pointer'
              }}>
                Yes, Remove
              </button>
              <button onClick={()=>setDeleteId(null)} style={{
                background:'white',color:'#5B7C85',
                border:'1.5px solid #DCEAEC',borderRadius:'8px',
                padding:'10px 20px',fontSize:'.9rem',cursor:'pointer'
              }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

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