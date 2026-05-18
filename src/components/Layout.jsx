import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../lib/useAuth'

export default function Layout() {
  const { user, profile, signOut } = useAuth()
  const navigate = useNavigate()

  return (
    <div style={styles.shell}>
      {/* ── Sidebar ── */}
      <aside style={styles.sidebar}>
        {/* Logo */}
        <div style={styles.logo} onClick={() => navigate('/')} role="button" tabIndex={0}>
          <div style={styles.logoIcon}>
            <i className="ti ti-shield-bolt" style={{ fontSize: 18 }} />
          </div>
          <div>
            <div style={styles.logoName}>ScamDetector</div>
            <div style={styles.logoSub}>AI fraud protection</div>
          </div>
        </div>

        {/* Nav */}
        <nav style={styles.nav}>
          <NavItem to="/" icon="ti-home-2" label="Scan" />
          {user && <NavItem to="/family" icon="ti-users" label="Family" />}
          {user && <NavItem to="/profile" icon="ti-user-circle" label="Profile" />}
        </nav>

        {/* Extension CTA */}
        <div style={styles.extensionCta}>
          <div style={styles.extensionInner}>
            <i className="ti ti-puzzle" style={{ fontSize: 18, color: '#FF4444' }} />
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#F0F0F2', marginBottom: 2 }}>Chrome Extension</div>
              <div style={{ fontSize: 11, color: '#8888A0', lineHeight: 1.4 }}>Detect scams without opening the app</div>
            </div>
            <a
              href="https://github.com/yashieeeeee/scamdetector/raw/main/extension.zip"
              target="_blank"
              rel="noopener noreferrer"
              style={styles.extensionBtn}
            >
              Add
            </a>
          </div>
        </div>

        {/* User area */}
        <div style={styles.userArea}>
          {user ? (
            <div style={styles.userCard}>
              <div style={{ ...styles.avatar, background: profile?.avatar_color || '#FF4444' }}>
                {(profile?.display_name || user.email || 'U').substring(0, 2).toUpperCase()}
              </div>
              <div style={styles.userInfo}>
                <div style={styles.userName}>{profile?.display_name || 'You'}</div>
                <div style={styles.userEmail}>{user.email}</div>
              </div>
              <button style={styles.signOutBtn} onClick={signOut} title="Sign out">
                <i className="ti ti-logout" style={{ fontSize: 15 }} />
              </button>
            </div>
          ) : (
            <div style={styles.guestCard}>
              <i className="ti ti-cloud-off" style={{ fontSize: 15, color: '#444458' }} />
              <div style={{ fontSize: 12, color: '#8888A0', lineHeight: 1.4 }}>
                <span style={{ fontWeight: 500, color: '#8888A0' }}>Not signed in</span><br />
                Sign in to sync history
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* ── Main ── */}
      <main style={styles.main}>
        <div style={styles.content}>
          <Outlet />
        </div>
      </main>
    </div>
  )
}

function NavItem({ to, icon, label }) {
  return (
    <NavLink
      to={to}
      end={to === '/'}
      style={({ isActive }) => ({
        ...styles.navItem,
        background: isActive ? 'rgba(255,68,68,0.1)' : 'transparent',
        color: isActive ? '#FF4444' : '#8888A0',
        fontWeight: isActive ? 600 : 400,
        borderLeft: isActive ? '2px solid #FF4444' : '2px solid transparent',
      })}
    >
      <i className={`ti ${icon}`} style={{ fontSize: 17 }} />
      {label}
    </NavLink>
  )
}

const styles = {
  shell: { display: 'flex', minHeight: '100vh' },
  sidebar: {
    width: 230, flexShrink: 0,
    background: '#111114',
    borderRight: '1px solid rgba(255,255,255,0.05)',
    display: 'flex', flexDirection: 'column', padding: '1.25rem 0',
    position: 'sticky', top: 0, height: '100vh',
    fontFamily: "'DM Sans', sans-serif",
  },
  logo: {
    display: 'flex', alignItems: 'center', gap: 10,
    padding: '0 1.25rem 1.25rem', cursor: 'pointer',
    borderBottom: '1px solid rgba(255,255,255,0.05)', marginBottom: '0.75rem',
  },
  logoIcon: {
    width: 36, height: 36,
    background: 'linear-gradient(135deg, #FF4444, #cc2222)',
    borderRadius: 10,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    color: '#fff', flexShrink: 0,
    boxShadow: '0 4px 12px rgba(255,68,68,0.3)',
  },
  logoName: { fontSize: 15, fontWeight: 700, color: '#F0F0F2', fontFamily: "'Syne', sans-serif", letterSpacing: '-0.2px' },
  logoSub: { fontSize: 11, color: '#444458', marginTop: 1 },
  nav: { display: 'flex', flexDirection: 'column', gap: 2, padding: '0 0.75rem', flex: 1 },
  navItem: {
    display: 'flex', alignItems: 'center', gap: 9,
    padding: '9px 14px', borderRadius: '0 8px 8px 0', fontSize: 14,
    transition: 'all 0.15s', textDecoration: 'none',
    marginLeft: '-0.75rem', paddingLeft: '1.25rem',
  },
  extensionCta: {
    margin: '0.75rem',
    background: 'rgba(255,68,68,0.06)',
    border: '1px solid rgba(255,68,68,0.15)',
    borderRadius: 10,
    padding: '12px',
  },
  extensionInner: { display: 'flex', alignItems: 'flex-start', gap: 8 },
  extensionBtn: {
    marginLeft: 'auto', flexShrink: 0,
    fontSize: 11, fontWeight: 600,
    padding: '4px 10px', borderRadius: 6,
    background: '#FF4444', color: '#fff',
    border: 'none', cursor: 'pointer',
    textDecoration: 'none', display: 'inline-block',
    marginTop: 2,
  },
  userArea: {
    padding: '0.75rem 1rem',
    borderTop: '1px solid rgba(255,255,255,0.05)',
    marginTop: 'auto',
  },
  userCard: { display: 'flex', alignItems: 'center', gap: 8 },
  avatar: {
    width: 30, height: 30, borderRadius: '50%',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 12, fontWeight: 700, color: '#fff', flexShrink: 0,
  },
  userInfo: { flex: 1, minWidth: 0 },
  userName: { fontSize: 13, fontWeight: 500, color: '#F0F0F2', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  userEmail: { fontSize: 11, color: '#444458', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  signOutBtn: {
    background: 'none', border: 'none', color: '#444458', cursor: 'pointer',
    padding: '3px 4px', borderRadius: 5, flexShrink: 0, transition: 'color 0.15s',
  },
  guestCard: { display: 'flex', alignItems: 'flex-start', gap: 8, padding: '4px 0' },
  main: { flex: 1, overflow: 'auto' },
  content: { maxWidth: 700, margin: '0 auto', padding: '2rem 1.5rem' },
}