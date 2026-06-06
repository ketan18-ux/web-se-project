export default function Stepper({ status }) {
  const isPending = status === 'pending';
  const isApproved = status === 'approved';
  const isRejected = status === 'rejected';

  return (
    <div className="stepper">
      <div className="step">
        <div className="step-dot done">✓</div>
        <div className="step-label done">Applied</div>
      </div>

      <div className={`step-line ${!isPending ? 'done' : ''}`} />

      <div className="step">
        <div className={`step-dot ${isPending ? 'active' : 'done'}`}>
          {isPending ? '⏳' : '✓'}
        </div>
        <div className={`step-label ${isPending ? 'active' : 'done'}`}>Under Review</div>
      </div>

      <div className={`step-line ${!isPending ? (isApproved ? 'done' : 'active') : ''}`} />

      <div className="step">
        <div className={`step-dot ${isApproved ? 'done' : isRejected ? 'rejected' : ''}`}>
          {isApproved ? '✓' : isRejected ? '✕' : ''}
        </div>
        <div className={`step-label ${isApproved ? 'done' : isRejected ? 'rejected' : ''}`}>
          {isRejected ? 'Rejected' : 'Approved'}
        </div>
      </div>
    </div>
  );
}
