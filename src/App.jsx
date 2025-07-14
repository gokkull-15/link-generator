import "./App.css";
import WebinarManager from "./components/WebinarManager";

function App() {
  return (
    <div className="app">
      <header className="app-header">
        <h1>🎥 Google Meet Webinar Manager</h1>
        <p>
          <strong>Create Google Meet Events + Email Notifications</strong>
        </p>
        <p>
          Create individual meetings or upload Excel files to schedule multiple
          webinars with real Google Meet integration
        </p>
        <div className="focus-note">
          <small>
            🎯 <strong>FEATURES:</strong> Create Google Meet events, send
            professional email invitations, and manage webinars with calendar
            integration.
          </small>
        </div>
      </header>
      <main className="app-main">
        <WebinarManager />
      </main>
    </div>
  );
}

export default App;
