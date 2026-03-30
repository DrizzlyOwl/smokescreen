import { Button } from './Button';
import '../styles/AccessDenied.scss';

export const AccessDenied = ({ ticketId, onBack }: { ticketId: string, onBack: () => void }) => {
  return (
    <div className="access-denied">
      <div className="access-denied__watermark">LOCK</div>
      <div className="access-denied__content">
        <h1 className="access-denied__title">403 - ACCESS FORBIDDEN</h1>
        <p className="access-denied__description">
          Incident Ticket <span className="access-denied__ticket-id">{ticketId}</span> is restricted to 
          <strong> SRE EMERGENCY LEVEL 1 </strong> response team only.
        </p>
        <div className="access-denied__error-box">
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
