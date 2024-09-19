import { forwardRef } from 'react';
import './ErrorModal.css';

const ErrorModal = forwardRef(function ErrorModal({ header, content, onClose }, ref) {
  const handleClose = () => {
    ref.current.close(); // Close the dialog
  };

  return (
    <dialog ref={ref} className="error-modal">
      <div className="error-modal-content">
        <h2 className = "modal-header">{header}</h2>
        <p>{content}</p>
        <form method="dialog">
          <button type="button" onClick={handleClose}>Close</button>
        </form>
      </div>
    </dialog>
  );
});

export default ErrorModal;