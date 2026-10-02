'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const NAV = [
  { href:'/dashboard',    icon:'📊', label:'Dashboard'    },
  { href:'/patients',     icon:'👥', label:'Patients'     },
  { href:'/consultation', icon:'🩺', label:'Consultation' },
  { href:'/prescriptions',icon:'📄', label:'Prescriptions'},
  { href:'/bookings',     icon:'📅', label:'Bookings'     },
  { href:'/medicines',    icon:'💊', label:'Medicines'    },
  { href:'/holidays',     icon:'🗓️', label:'Holidays'    },
  { href:'/settings',     icon:'⚙️', label:'Settings'    },
]

export default function Sidebar({ open, onClose }) {
  const path = usePathname()

  return (
    <>
      {/* Sidebar */}
      <aside style={{
        width: '240px',
        background: '#013A47',
        position: 'fixed',
        top: 0,
        left: 0,
        height: '100vh',
        zIndex: 100,
        display: 'flex',
        flexDirection: 'column',
        transform: open ? 'translateX(0)' : undefined,
        transition: 'transform .25s ease',
        overflowY: 'auto',
      }}
        className={`sidebar-nav-wrap ${open ? 'sidebar-open' : ''}`}
      >
        {/* Logo */}
        <div style={{
          padding: '20px 16px',
          borderBottom: '1px solid #02505F',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          flexShrink: 0,
        }}>
          <div style={{
            width: '36px', height: '36px',
            background: '#02C39A',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.1rem',
            flexShrink: 0,
          }}>
            🩺
          </div>
          <div>
            <div style={{
              color: 'white', fontWeight: '700', fontSize: '.95rem'
            }}>
              ClinicDesk
            </div>
            <div style={{
              color: 'rgba(255,255,255,.45)', fontSize: '.68rem'
            }}>
              Clinic Management
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '8px 0' }}>
          {NAV.map(item => {
            const active = path === item.href ||
              path.startsWith(item.href + '/')
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '11px 16px',
                  color: active
                    ? 'white'
                    : 'rgba(255,255,255,.6)',
                  background: active ? '#02505F' : 'transparent',
                  borderLeft: active
                    ? '3px solid #02C39A'
                    : '3px solid transparent',
                  fontSize: '.88rem',
                  fontWeight: active ? '700' : '500',
                  textDecoration: 'none',
                  transition: 'all .15s',
                }}
              >
                <span style={{ fontSize: '1rem', width: '20px' }}>
                  {item.icon}
                </span>
                {item.label}
              </Link>
            )
          })}
        </nav>

        {/* Footer */}
        <div style={{
          padding: '12px 16px',
          borderTop: '1px solid #02505F',
          flexShrink: 0,
        }}>
          <div style={{
            background: '#02505F',
            borderRadius: '8px',
            padding: '10px 12px',
            marginBottom: '8px',
          }}>
            <div style={{
              color: 'white', fontSize: '.82rem',
              fontWeight: '600',
            }}>
              ClinicDesk
            </div>
            <div style={{
              color: 'rgba(255,255,255,.45)', fontSize: '.7rem'
            }}>
              Staff Dashboard
            </div>
          </div>
          <Link
            href="/"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              color: 'rgba(255,255,255,.45)',
              fontSize: '.8rem',
              textDecoration: 'none',
            }}
          >
            🚪 Sign out
          </Link>
        </div>
      </aside>

      {/* Mobile CSS override */}
      <style>{`
        @media (max-width: 768px) {
          .sidebar-nav-wrap {
            transform: translateX(-100%);
          }
          .sidebar-nav-wrap.sidebar-open {
            transform: translateX(0) !important;
          }
        }
        @media (min-width: 769px) {
          .sidebar-nav-wrap {
            transform: translateX(0) !important;
          }
        }
      `}</style>
    </>
  )
}