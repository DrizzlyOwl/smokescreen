export const TechnicalTypography = {
  section: {
    marginBottom: '25px',
  },
  title: (themeColor: string) => ({
    color: themeColor,
    fontSize: '1.25rem',
    margin: '0 0 10px 0',
    fontWeight: '900',
    textTransform: 'uppercase' as const,
    letterSpacing: '1px',
  }),
  h2: {
    color: '#fff',
    fontSize: '1.1rem',
    margin: '0 0 10px 0',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    fontWeight: 'bold',
  },
  h3: (color: string = 'var(--terminal-amber)') => ({
    color,
    fontSize: '1rem',
    margin: '0 0 15px 0',
    letterSpacing: '1px',
    fontWeight: 'bold',
    textTransform: 'uppercase' as const,
  }),
  p: {
    margin: 0,
    fontSize: '0.9rem',
    lineHeight: '1.5',
    color: '#adbac7',
  },
  intro: (themeColor: string) => ({
    fontSize: '1.1rem',
    color: themeColor,
    opacity: 0.9,
    fontStyle: 'italic',
    lineHeight: '1.4',
  }),
  label: (themeColor: string) => ({
    fontSize: '0.75rem',
    color: themeColor,
    opacity: 0.6,
    letterSpacing: '2px',
    textTransform: 'uppercase' as const,
  }),
  number: (themeColor: string) => ({
    color: themeColor,
    fontWeight: 'bold',
  }),
  bold: (themeColor: string) => ({
    color: themeColor,
    fontWeight: 'bold',
  }),
  footer: {
    fontSize: '0.8rem',
    opacity: 0.3,
    textAlign: 'center' as const,
  }
};
