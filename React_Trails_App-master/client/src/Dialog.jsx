export default function Dialog({ message, closeAlert }){
    return (
      <>
        <div className="dialog-overlay"></div>
        <div className="alert">
          <div className="alert-content">
            <p>{message}</p>
            <button onClick={closeAlert} className="btn btn-dark btn-outline-danger">
              Close
            </button>
          </div>
        </div>
      </>
    );
}