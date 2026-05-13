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
          <div style={styles.logoIcon}><i className="ti ti-shield-check" /></div>
          <div>
            <div style={styles.logoName}>ScamDetector</div>
            <div style={styles.logoSub}>AI fraud protection</div>
          </div>
        </div>

        {/* Nav */}
        <nav style={styles.nav}>
          <NavItem to="/" icon="ti-home" label="Scan" />
          {user && <NavItem to="/family" icon="ti-users" label="Family" />}
          {user && <NavItem to="/profile" icon="ti-user-circle" label="Profile & Settings" />}
        </nav>

        {/* User area */}
        <div style={styles.userArea}>
          {user ? (
            <div style={styles.userCard}>
              <div style={{ ...styles.avatar, background: profile?.avatar_color || '#E24B4A' }}>
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
              <i className="ti ti-cloud-off" style={{ fontSize: 16, color: '#999' }} />
              <div style={{ fontSize: 12, color: '#888', lineHeight: 1.4 }}>
                <span style={{ fontWeight: 500, color: '#555' }}>Not signed in</span><br />
                Sign in to sync history
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* ── Main content ── */}
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
        background: isActive ? 'rgba(226,75,74,0.08)' : 'transparent',
        color: isActive ? '#E24B4A' : '#555',
        fontWeight: isActive ? 500 : 400,
      })}
    >
      <i className={`ti ${icon}`} style={{ fontSize: 18 }} />
      {label}
    </NavLink>
  )
}

const styles = {
  shell: { display: 'flex', minHeight: '100vh', background: '#f8f7f5' },
  sidebar: {
    width: 220, flexShrink: 0, background: '#fff',
    borderRight: '0.5px solid rgba(0,0,0,0.08)',
    display: 'flex', flexDirection: 'column', padding: '1.25rem 0',
    position: 'sticky', top: 0, height: '100vh'
  },
  logo: {
    display: 'flex', alignItems: 'center', gap: 10,
    padding: '0 1.25rem 1.25rem', cursor: 'pointer',
    borderBottom: '0.5px solid rgba(0,0,0,0.06)', marginBottom: '0.75rem'
  },
  logoIcon: {
    width: 34, height: 34, background: '#E24B4A', borderRadius: 8,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    color: '#fff', fontSize: 17, flexShrink: 0
  },
  logoName: { fontSize: 16, fontWeight: 600, color: '#1a1a18', letterSpacing: '-0.2px' },
  logoSub: { fontSize: 11, color: '#999', marginTop: 1 },
  nav: { display: 'flex', flexDirection: 'column', gap: 2, padding: '0 0.75rem', flex: 1 },
  navItem: {
    display: 'flex', alignItems: 'center', gap: 9,
    padding: '8px 12px', borderRadius: 8, fontSize: 14,
    transition: 'all 0.15s', textDecoration: 'none'
  },
  userArea: {
    padding: '0.75rem 1rem',
    borderTop: '0.5px solid rgba(0,0,0,0.06)',
    marginTop: 'auto'
  },
  userCard: { display: 'flex', alignItems: 'center', gap: 8 },
  avatar: {
    width: 30, height: 30, borderRadius: '50%',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 12, fontWeight: 600, color: '#fff', flexShrink: 0
  },
  userInfo: { flex: 1, minWidth: 0 },
  userName: { fontSize: 13, fontWeight: 500, color: '#1a1a18', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  userEmail: { fontSize: 11, color: '#999', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  signOutBtn: {
    background: 'none', border: 'none', color: '#bbb', cursor: 'pointer',
    padding: '3px 4px', borderRadius: 5, flexShrink: 0,
    transition: 'color 0.15s'
  },
  guestCard: { display: 'flex', alignItems: 'flex-start', gap: 8, padding: '4px 0' },
  main: { flex: 1, overflow: 'auto' },
  content: { maxWidth: 680, margin: '0 auto', padding: '2rem 1.5rem' },
}
