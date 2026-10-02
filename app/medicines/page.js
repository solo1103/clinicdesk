'use client'
import { useState } from 'react'
import Sidebar from '../../components/Sidebar'
import Topbar from '../../components/Topbar'
import { useApp } from '../../lib/AppContext'

const uid = () => Math.random().toString(36).slice(2,9)

const TYPES = [
  'Tablet','Capsule','Syrup','Injection',
  'Cream','Drops','Inhaler','Powder'
]
const CATEGORIES = [
  'Antibiotic','Painkiller','Antacid','Antiallergic',
  'Vitamin','Diabetes','BP','Thyroid','Steroid',
  'Antifungal','Antiparasitic','Other'
]

const EMPTY_FORM = {
  name:'', strength:'', type:'Tablet',
  category:'Other', notes:''
}

export default function MedicinesPage() {
  const { medicines, setMedicines } = useApp()
  const [sidebarOpen,  setSidebarOpen]  = useState(false)
  const [showModal,    setShowModal]    = useState(false)
  const [editId,       setEditId]       = useState(null)
  const [form,         setForm]         = useState(EMPTY_FORM)
  const [search,       setSearch]       = useState('')
  const [catFilter,    setCatFilter]    = useState('')
  const [typeFilter,   setTypeFilter]   = useState('')
  const [toast,        setToast]        = useState('')
  const [bulkText,     setBulkText]     = useState('')
  const [showBulk,     setShowBulk]     = useState(false)
  const [deleteConfirm,setDeleteConfirm]= useState(null)

  const showToast = (msg) => {
    setToast(msg)
    setTimeout(() => setToast(''), 2500)
  }

  const openAdd = () => {
    setEditId(null)
    setForm(EMPTY_FORM)
    setShowModal(true)
  }

  const openEdit = (med) => {
    setEditId(med.id)
    setForm({
      name:     med.name     || '',
      strength: med.strength || '',
      type:     med.type     || 'Tablet',
      category: med.category || 'Other',
      notes:    med.notes    || ''
    })
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setEditId(null)
    setForm(EMPTY_FORM)
  }

  const handleSave = () => {
    if (!form.name.trim()) {
      showToast('⚠️ Medicine name is required')
      return
    }
    if (editId) {
      setMedicines(medicines.map(m =>
        m.id === editId ? { ...m, ...form } : m
      ))
      showToast('✅ Medicine updated')
    } else {
      setMedicines([...medicines, { id: uid(), ...form }])
      showToast('✅ Medicine added')
    }
    closeModal()
  }

  const handleDelete = (id) => {
    setMedicines(medicines.filter(m => m.id !== id))
    setDeleteConfirm(null)
    showToast('🗑 Medicine removed')
  }

  const handleBulkAdd = () => {
    if (!bulkText.trim()) return
    const lines = bulkText
      .split('\n')
      .map(l => l.trim())
      .filter(Boolean)
    const newMeds = lines.map(line => {
      const parts = line.split(',').map(p => p.trim())
      return {
        id:       uid(),
        name:     parts[0] || line,
        strength: parts[1] || '',
        type:     parts[2] || 'Tablet',
        category: parts[3] || 'Other',
        notes:    ''
      }
    })
    setMedicines([...medicines, ...newMeds])
    setBulkText('')
    setShowBulk(false)
    showToast(`✅ Added ${newMeds.length} medicines`)
  }

  // Filtered list
  const filtered = (medicines || []).filter(m => {
    const q = search.toLowerCase()
    const matchQ = !q ||
      m.name?.toLowerCase().includes(q) ||
      m.strength?.toLowerCase().includes(q) ||
      m.category?.toLowerCase().includes(q)
    const matchCat  = !catFilter  || m.category === catFilter
    const matchType = !typeFilter || m.type     === typeFilter
    return matchQ && matchCat && matchType
  })

  // Type colors
  const typeColors = {
    Tablet:    { bg:'#E8F4FE', color:'#1a5fa6' },
    Capsule:   { bg:'#E6F7F1', color:'#1a7a50' },
    Syrup:     { bg:'#FFF4E5', color:'#B06000' },
    Injection: { bg:'#FFE8E8', color:'#c0392b' },
    Cream:     { bg:'#F3E8FF', color:'#6b21a8' },
    Drops:     { bg:'#FFF9E6', color:'#7a5a00' },
    Inhaler:   { bg:'#E8F4FE', color:'#1a5fa6' },
    Powder:    { bg:'#F4F4F4', color:'#555'    },
  }

  // ── Styles ──
  const card = {
    background:'white', borderRadius:'10px',
    boxShadow:'0 2px 12px rgba(1,58,71,.08)',
    overflow:'hidden'
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
          title="Medicine Manager"
          onMenuToggle={() => setSidebarOpen(s => !s)}
        >
          <button onClick={openAdd} style={{
            background:'#02C39A', color:'#012B35',
            border:'none', borderRadius:'8px',
            padding:'8px 16px', fontSize:'.85rem',
            fontWeight:'700', cursor:'pointer'
          }}>
            + Add Medicine
          </button>
        </Topbar>

        <div style={{ padding:'24px' }}>

          {/* STATS */}
          <div style={{
            display:'grid',
            gridTemplateColumns:'repeat(3,1fr)',
gap:'10px', marginBottom:'16px',
'@media(maxWidth:768px)': {
  gridTemplateColumns:'1fr'
}
          }}>
            {[
              { label:'Total Medicines',
                value: medicines?.length || 0,
                color:'#028090' },
              { label:'Categories',
                value: [...new Set(
                  medicines?.map(m=>m.category)||[]
                )].length,
                color:'#02C39A' },
              { label:'Showing Now',
                value: filtered.length,
                color:'#013A47' },
            ].map(s => (
              <div key={s.label} style={{
                background:'white', borderRadius:'10px',
                padding:'16px',
                boxShadow:'0 2px 12px rgba(1,58,71,.08)'
              }}>
                <div style={{
                  fontSize:'.75rem', fontWeight:'700',
                  color:'#5B7C85', textTransform:'uppercase',
                  letterSpacing:'.5px', marginBottom:'6px'
                }}>
                  {s.label}
                </div>
                <div style={{
                  fontSize:'2rem', fontWeight:'700',
                  color: s.color, lineHeight:1
                }}>
                  {s.value}
                </div>
              </div>
            ))}
          </div>

          {/* SEARCH + FILTERS */}
          <div style={{
            display:'flex', gap:'10px',
            flexWrap:'wrap', marginBottom:'16px'
          }}>
            <input
              type="text"
              placeholder="🔍 Search medicines..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{
                ...inp, flex:1,
                minWidth:'200px', maxWidth:'320px'
              }}
            />
            <select
              value={catFilter}
              onChange={e => setCatFilter(e.target.value)}
              style={{ ...inp, width:'auto' }}
            >
              <option value="">All Categories</option>
              {CATEGORIES.map(c =>
                <option key={c} value={c}>{c}</option>
              )}
            </select>
            <select
              value={typeFilter}
              onChange={e => setTypeFilter(e.target.value)}
              style={{ ...inp, width:'auto' }}
            >
              <option value="">All Types</option>
              {TYPES.map(t =>
                <option key={t} value={t}>{t}</option>
              )}
            </select>
            {(search||catFilter||typeFilter) && (
              <button
                onClick={() => {
                  setSearch('')
                  setCatFilter('')
                  setTypeFilter('')
                }}
                style={{
                  background:'none',
                  border:'1.5px solid #DCEAEC',
                  borderRadius:'8px',
                  padding:'8px 14px',
                  fontSize:'.85rem',
                  color:'#5B7C85', cursor:'pointer'
                }}
              >
                Clear filters
              </button>
            )}
          </div>

          {/* TABLE */}
          <div style={{ ...card, marginBottom:'20px' }}>
            {filtered.length === 0 ? (
              <div style={{
                textAlign:'center', padding:'48px',
                color:'#5B7C85'
              }}>
                <div style={{ fontSize:'2.5rem', marginBottom:'12px' }}>
                  💊
                </div>
                <p style={{ fontWeight:'600', marginBottom:'6px' }}>
                  {search||catFilter||typeFilter
                    ? 'No medicines match your filters'
                    : 'No medicines yet'}
                </p>
                <p style={{ fontSize:'.85rem' }}>
                  {search||catFilter||typeFilter
                    ? 'Try changing your search'
                    : 'Click "+ Add Medicine" to build your list'}
                </p>
              </div>
            ) : (
              <div style={{ overflowX:'auto' }}>
                <table style={{
                  width:'100%', borderCollapse:'collapse'
                }}>
                  <thead>
                    <tr style={{ background:'#F4F9F9' }}>
                      {['Medicine','Strength','Type',
                        'Category','Notes','Actions'
                       ].map(h => (
                        <th key={h} style={{
                          padding:'10px 16px',
                          textAlign:'left',
                          fontSize:'.75rem',
                          fontWeight:'700',
                          color:'#5B7C85',
                          textTransform:'uppercase',
                          letterSpacing:'.5px',
                          borderBottom:'1px solid #DCEAEC',
                          whiteSpace:'nowrap'
                        }}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((med, i) => (
                      <tr key={med.id}
                        style={{
                          borderBottom:
                            i < filtered.length-1
                            ? '1px solid #DCEAEC' : 'none'
                        }}
                      >
                        <td style={{ padding:'12px 16px' }}>
                          <span style={{
                            fontWeight:'700',
                            color:'#12333A',
                            fontSize:'.9rem'
                          }}>
                            {med.name}
                          </span>
                        </td>
                        <td style={{
                          padding:'12px 16px',
                          color:'#5B7C85',
                          fontSize:'.88rem'
                        }}>
                          {med.strength || '—'}
                        </td>
                        <td style={{ padding:'12px 16px' }}>
                          <span style={{
                            display:'inline-block',
                            padding:'3px 10px',
                            borderRadius:'20px',
                            fontSize:'.75rem',
                            fontWeight:'700',
                            background:
                              typeColors[med.type]?.bg || '#F4F4F4',
                            color:
                              typeColors[med.type]?.color || '#555'
                          }}>
                            {med.type}
                          </span>
                        </td>
                        <td style={{ padding:'12px 16px' }}>
                          <span style={{
                            display:'inline-block',
                            padding:'3px 10px',
                            borderRadius:'20px',
                            fontSize:'.75rem',
                            fontWeight:'600',
                            background:'#F4F9F9',
                            color:'#5B7C85'
                          }}>
                            {med.category || 'Other'}
                          </span>
                        </td>
                        <td style={{
                          padding:'12px 16px',
                          color:'#5B7C85',
                          fontSize:'.82rem',
                          maxWidth:'180px',
                          overflow:'hidden',
                          textOverflow:'ellipsis',
                          whiteSpace:'nowrap'
                        }}>
                          {med.notes || '—'}
                        </td>
                        <td style={{ padding:'12px 16px' }}>
                          <div style={{
                            display:'flex', gap:'6px'
                          }}>
                            <button
                              onClick={() => openEdit(med)}
                              style={{
                                background:'#E8F4FE',
                                color:'#1a5fa6',
                                border:'none',
                                borderRadius:'6px',
                                padding:'5px 10px',
                                fontSize:'.78rem',
                                fontWeight:'600',
                                cursor:'pointer'
                              }}
                            >
                              ✏️ Edit
                            </button>
                            <button
                              onClick={() =>
                                setDeleteConfirm(med.id)
                              }
                              style={{
                                background:'#FFE8E8',
                                color:'#c0392b',
                                border:'none',
                                borderRadius:'6px',
                                padding:'5px 10px',
                                fontSize:'.78rem',
                                fontWeight:'600',
                                cursor:'pointer'
                              }}
                            >
                              🗑
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* BULK ADD */}
          <div style={{
            background:'white', borderRadius:'10px',
            boxShadow:'0 2px 12px rgba(1,58,71,.08)',
            padding:'20px'
          }}>
            <div style={{
              display:'flex',
              justifyContent:'space-between',
              alignItems:'center',
              marginBottom: showBulk ? '16px' : '0'
            }}>
              <div>
                <p style={{
                  fontWeight:'700', color:'#12333A',
                  fontSize:'.9rem', margin:0
                }}>
                  📋 Bulk Add Medicines
                </p>
                <p style={{
                  color:'#5B7C85', fontSize:'.8rem',
                  margin:'4px 0 0 0'
                }}>
                  Add multiple medicines at once
                </p>
              </div>
              <button
                onClick={() => setShowBulk(s => !s)}
                style={{
                  background:'none',
                  border:'1.5px solid #DCEAEC',
                  borderRadius:'8px',
                  padding:'7px 14px',
                  fontSize:'.83rem',
                  color:'#028090',
                  fontWeight:'600',
                  cursor:'pointer'
                }}
              >
                {showBulk ? 'Hide' : 'Show'}
              </button>
            </div>

            {showBulk && (
              <>
                <p style={{
                  color:'#5B7C85', fontSize:'.82rem',
                  marginBottom:'8px'
                }}>
                  One medicine per line. Format: 
                  <strong> Name, Strength, Type, Category</strong>
                  <br/>Example: Amoxicillin, 500mg, Capsule, Antibiotic
                </p>
                <textarea
                  value={bulkText}
                  onChange={e => setBulkText(e.target.value)}
                  placeholder={
                    `Amoxicillin, 500mg, Capsule, Antibiotic\n` +
                    `Paracetamol, 650mg, Tablet, Painkiller\n` +
                    `Omeprazole, 20mg, Capsule, Antacid`
                  }
                  style={{
                    ...inp,
                    minHeight:'120px',
                    resize:'vertical',
                    marginBottom:'12px',
                    fontFamily:'monospace',
                    fontSize:'.85rem'
                  }}
                />
                <button
                  onClick={handleBulkAdd}
                  style={{
                    background:'#028090', color:'white',
                    border:'none', borderRadius:'8px',
                    padding:'9px 20px', fontSize:'.88rem',
                    fontWeight:'700', cursor:'pointer'
                  }}
                >
                  Add All Medicines
                </button>
              </>
            )}
          </div>

        </div>
      </div>

      {/* ADD / EDIT MODAL */}
      {showModal && (
        <div
          onClick={closeModal}
          style={{
            position:'fixed', inset:0,
            background:'rgba(0,0,0,.5)',
            zIndex:1000,
            display:'flex',
            alignItems:'center',
            justifyContent:'center',
            padding:'16px'
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background:'white',
              borderRadius:'14px',
              padding:'28px',
              width:'100%',
              maxWidth:'440px',
              boxShadow:'0 20px 60px rgba(0,0,0,.25)'
            }}
          >
            <div style={{
              display:'flex',
              justifyContent:'space-between',
              alignItems:'center',
              marginBottom:'20px'
            }}>
              <h2 style={{
                fontSize:'1.1rem', fontWeight:'700',
                color:'#12333A', margin:0
              }}>
                {editId ? '✏️ Edit Medicine' : '+ Add Medicine'}
              </h2>
              <button
                onClick={closeModal}
                style={{
                  background:'none', border:'none',
                  fontSize:'1.4rem', cursor:'pointer',
                  color:'#5B7C85', lineHeight:1
                }}
              >
                ×
              </button>
            </div>

            <div style={{ marginBottom:'14px' }}>
              <label style={lbl}>
                Medicine Name *
              </label>
              <input
                type="text"
                placeholder="e.g. Amoxicillin"
                value={form.name}
                onChange={e =>
                  setForm({ ...form, name: e.target.value })
                }
                style={{
                  ...inp,
                  borderColor: form.name ? '#DCEAEC' : '#028090'
                }}
                autoFocus
              />
            </div>

            <div style={{ marginBottom:'14px' }}>
              <label style={lbl}>Strength</label>
              <input
                type="text"
                placeholder="e.g. 500mg, 10ml, 0.05%"
                value={form.strength}
                onChange={e =>
                  setForm({ ...form, strength: e.target.value })
                }
                style={inp}
              />
            </div>

            <div style={{
              display:'grid',
              gridTemplateColumns:'1fr 1fr',
              gap:'12px',
              marginBottom:'14px'
            }}>
              <div>
                <label style={lbl}>Type</label>
                <select
                  value={form.type}
                  onChange={e =>
                    setForm({ ...form, type: e.target.value })
                  }
                  style={inp}
                >
                  {TYPES.map(t =>
                    <option key={t} value={t}>{t}</option>
                  )}
                </select>
              </div>
              <div>
                <label style={lbl}>Category</label>
                <select
                  value={form.category}
                  onChange={e =>
                    setForm({ ...form, category: e.target.value })
                  }
                  style={inp}
                >
                  {CATEGORIES.map(c =>
                    <option key={c} value={c}>{c}</option>
                  )}
                </select>
              </div>
            </div>

            <div style={{ marginBottom:'20px' }}>
              <label style={lbl}>
                Notes (optional)
              </label>
              <textarea
                placeholder="e.g. Take with food, avoid alcohol"
                value={form.notes}
                onChange={e =>
                  setForm({ ...form, notes: e.target.value })
                }
                style={{
                  ...inp,
                  minHeight:'70px',
                  resize:'vertical'
                }}
              />
            </div>

            <div style={{
              display:'flex', gap:'10px'
            }}>
              <button
                onClick={handleSave}
                style={{
                  flex:1, background:'#028090',
                  color:'white', border:'none',
                  borderRadius:'8px', padding:'11px',
                  fontSize:'.95rem', fontWeight:'700',
                  cursor:'pointer'
                }}
              >
                {editId ? 'Save Changes' : 'Add Medicine'}
              </button>
              <button
                onClick={closeModal}
                style={{
                  background:'white', color:'#5B7C85',
                  border:'1.5px solid #DCEAEC',
                  borderRadius:'8px', padding:'11px 18px',
                  fontSize:'.95rem', cursor:'pointer'
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRM */}
      {deleteConfirm && (
        <div
          onClick={() => setDeleteConfirm(null)}
          style={{
            position:'fixed', inset:0,
            background:'rgba(0,0,0,.5)',
            zIndex:1000,
            display:'flex',
            alignItems:'center',
            justifyContent:'center',
            padding:'16px'
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background:'white', borderRadius:'14px',
              padding:'28px', width:'100%', maxWidth:'360px',
              textAlign:'center'
            }}
          >
            <div style={{
              fontSize:'2.5rem', marginBottom:'12px'
            }}>
              🗑️
            </div>
            <h3 style={{
              fontSize:'1rem', fontWeight:'700',
              color:'#12333A', marginBottom:'8px'
            }}>
              Remove this medicine?
            </h3>
            <p style={{
              color:'#5B7C85', fontSize:'.85rem',
              marginBottom:'20px'
            }}>
              It will be removed from your list.
              Past prescriptions using it are not affected.
            </p>
            <div style={{
              display:'flex', gap:'10px',
              justifyContent:'center'
            }}>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                style={{
                  background:'#E53E3E', color:'white',
                  border:'none', borderRadius:'8px',
                  padding:'10px 20px', fontSize:'.9rem',
                  fontWeight:'700', cursor:'pointer'
                }}
              >
                Yes, Remove
              </button>
              <button
                onClick={() => setDeleteConfirm(null)}
                style={{
                  background:'white', color:'#5B7C85',
                  border:'1.5px solid #DCEAEC',
                  borderRadius:'8px',
                  padding:'10px 20px', fontSize:'.9rem',
                  cursor:'pointer'
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

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