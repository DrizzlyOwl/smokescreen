export const PANE_STYLES = {
  container: (isMinimized: boolean, width: string, zIndex: number = 100, isActive: boolean = false) => ({
    position: 'absolute' as const,
    width: isMinimized ? '220px' : width,
    background: '#1a1d21',
    border: isActive ? '1px solid var(--terminal-green)' : '1px solid #35373b',
    borderRadius: '8px',
    zIndex,
    boxShadow: isActive ? '0 0 20px rgba(24, 255, 98, 0.2), 0 4px 12px rgba(0, 0, 0, 0.6)' : '0 4px 12px rgba(0, 0, 0, 0.4)',
    color: '#d1d2d3',
    transition: 'width 0.3s ease, border-color 0.2s ease, box-shadow 0.2s ease',
    overflow: 'hidden' as const,
    display: 'flex',
    flexDirection: 'column' as const
  }),
  header: (isDragging: boolean, isActive: boolean = false) => ({
    padding: '10px 12px',
    fontWeight: '900',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    cursor: isDragging ? 'grabbing' : 'grab',
    userSelect: 'none' as const,
    background: isActive ? '#1e231e' : '#121519',
    fontSize: 'var(--text-l3)',
    borderBottom: isActive ? '1px solid rgba(24, 255, 98, 0.2)' : '1px solid transparent'
  }),
  headerTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  minimizeBtn: {
    background: 'none',
    border: 'none',
    color: 'white',
    cursor: 'pointer',
    fontFamily: 'inherit',
    fontWeight: 'bold',
    fontSize: 'var(--text-l3)',
    padding: '0 5px'
  },
  content: (height: string) => ({
    height,
    overflow: 'hidden' as const,
    padding: '0',
    background: '#1a1d21',
    boxSizing: 'border-box' as const,
    display: 'flex',
    flexDirection: 'column' as const
  })
};
