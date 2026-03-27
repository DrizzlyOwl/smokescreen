import { Button } from './Button';

export const AccessDenied = ({ ticketId, onBack }: { ticketId: string, onBack: () => void }) => {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100%',
      padding: '40px',
      textAlign: 'center'
    }}>
      <div style={{ fontSize: '10rem', color: 'var(--terminal-red)', opacity: 0.1, position: 'absolute' }}>LOCK</div>
      <div style={{ zIndex: 5 }}>
        <h1 style={{ color: 'var(--terminal-red)', fontSize: '4rem' }}>403 - ACCESS FORBIDDEN</h1>
        <p style={{ fontSize: '1.5rem', marginBottom: '20px' }}>
          Incident Ticket <span style={{ color: 'var(--terminal-amber)' }}>{ticketId}</span> is restricted to 
          <strong> SRE EMERGENCY LEVEL 1 </strong> response team only.
        </p>
        <div style={{ 
          border: '1px solid var(--terminal-red)', 
          padding: '20px', 
          background: 'rgba(255, 0, 0, 0.05)',
          display: 'inline-block',
          marginBottom: '40px'
        }}>
          VPN CONNECTION ERROR: <br/> 
          LOCAL NODE IP 10.42.1.255 IS NOT IN THE PERMITTED SUBNET FOR SRE-INCIDENT-TRACKING.
        </div>
        <div>
          <Button onClick={onBack} variant="danger" size="large">RE-AUTHENTICATE</Button>
        </div>
      </div>
    </div>
  );
};
