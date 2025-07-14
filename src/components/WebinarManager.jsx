import { useState, useEffect } from "react";
import ExcelUploader from "./ExcelUploader";
import WebinarTable from "./WebinarTable";
import MeetCreator from "./MeetCreator";
import {
  sendEmailNotifications,
  testEmailConnection,
  checkGoogleAuthStatus,
  authenticateWithGoogle,
} from "../services/notificationService";
import "./WebinarManager.css";

const WebinarManager = () => {
  const [webinars, setWebinars] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [emailServerStatus, setEmailServerStatus] = useState("unknown");
  const [googleAuthStatus, setGoogleAuthStatus] = useState({
    isConfigured: false,
    hasRefreshToken: false,
    canCreateMeetings: false,
  });
  const [activeTab, setActiveTab] = useState("create"); // "create" or "upload"

  useEffect(() => {
    // Check email server status and Google auth status - MAIN FOCUS
    checkEmailServer();
    checkGoogleAuth();
  }, []);

  const checkEmailServer = async () => {
    try {
      const result = await testEmailConnection();
      setEmailServerStatus(
        result.emailConfigured ? "configured" : "not-configured"
      );
    } catch {
      setEmailServerStatus("offline");
    }
  };

  const checkGoogleAuth = async () => {
    try {
      const status = await checkGoogleAuthStatus();
      setGoogleAuthStatus(status);
    } catch (error) {
      console.error("Failed to check Google auth status:", error);
      setGoogleAuthStatus({
        isConfigured: false,
        hasRefreshToken: false,
        canCreateMeetings: false,
      });
    }
  };

  const handleGoogleAuth = async () => {
    setLoading(true);
    try {
      await authenticateWithGoogle();
      setMessage(
        "Google authentication window opened. Please complete the process."
      );
      // Recheck status after authentication
      setTimeout(async () => {
        await checkGoogleAuth();
      }, 3000);
    } catch (error) {
      setMessage(`Google authentication error: ${error.message}`);
    } finally {
      setLoading(false);
      setTimeout(() => setMessage(""), 5000);
    }
  };

  // COMMENTED OUT - Google authentication functions
  // const handleGoogleAuth = async () => {
  //   setLoading(true)
  //   try {
  //     const success = await authenticateGoogle()
  //     if (success) {
  //       setIsGoogleAuth(true)
  //       setMessage('Successfully authenticated with Google')
  //     } else {
  //       setMessage('Failed to authenticate with Google')
  //     }
  //   } catch (error) {
  //     setMessage(`Google authentication error: ${error.message}`)
  //   } finally {
  //     setLoading(false)
  //     setTimeout(() => setMessage(''), 3000)
  //   }
  // }

  // const handleGoogleSignOut = async () => {
  //   setLoading(true)
  //   try {
  //     await signOutGoogle()
  //     setIsGoogleAuth(false)
  //     setMessage('Successfully signed out from Google')
  //   } catch (error) {
  //     setMessage(`Sign out error: ${error.message}`)
  //   } finally {
  //     setLoading(false)
  //     setTimeout(() => setMessage(''), 3000)
  //   }
  // }

  const handleExcelUpload = (webinarData) => {
    setWebinars(webinarData);
    setMessage(
      `Successfully loaded ${webinarData.length} webinars from Excel file`
    );
    setTimeout(() => setMessage(""), 3000);
  };

  const handleMeetCreated = (newMeet) => {
    // Add the created meet to the webinars list
    setWebinars((prev) => [...prev, newMeet]);
    setMessage(`✅ Google Meet "${newMeet.name}" created successfully!`);
    setTimeout(() => setMessage(""), 3000);
  };

  // COMMENTED OUT - Scheduling functionality
  // const handleScheduleWebinar = async (webinar, platform) => {
  //   setLoading(true)
  //   try {
  //     let scheduledWebinar
  //     if (platform === 'zoom') {
  //       scheduledWebinar = await scheduleZoomWebinar(webinar)
  //     } else if (platform === 'google-meet') {
  //       scheduledWebinar = await scheduleGoogleMeetWebinar(webinar)
  //     }

  //     // Update the webinar with the generated links
  //     setWebinars(prev => prev.map(w =>
  //       w.id === webinar.id ? { ...w, ...scheduledWebinar } : w
  //     ))

  //     setMessage(`Successfully scheduled webinar on ${platform}`)
  //     setTimeout(() => setMessage(''), 3000)
  //   } catch (error) {
  //     setMessage(`Error scheduling webinar: ${error.message}`)
  //     setTimeout(() => setMessage(''), 5000)
  //   } finally {
  //     setLoading(false)
  //   }
  // }

  // MAIN FOCUS - Email notifications with Google Calendar and Google Meet
  const handleSendNotifications = async (webinar) => {
    setLoading(true);
    try {
      const result = await sendEmailNotifications(webinar);
      setMessage(
        result.meetData
          ? `✅ Google Meet scheduled and email notifications sent successfully! Meeting ID: ${result.meetData.meetingId}`
          : "✅ Email notifications sent successfully with calendar invites"
      );
      setTimeout(() => setMessage(""), 5000);
    } catch (error) {
      setMessage(`Error: ${error.message}`);
      setTimeout(() => setMessage(""), 5000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="webinar-manager">
      {message && (
        <div
          className={`message ${
            message.includes("Error") || message.includes("Failed")
              ? "error"
              : "success"
          }`}
        >
          {message}
        </div>
      )}

      {/* Google Meet Integration */}
      <section className="auth-section">
        <h2>🎥 Google Meet Integration</h2>
        <div className="auth-controls">
          <div className="auth-status">
            <span
              className={`auth-indicator ${
                googleAuthStatus.canCreateMeetings
                  ? "authenticated"
                  : "not-authenticated"
              }`}
            >
              {googleAuthStatus.canCreateMeetings
                ? "✅ Google Calendar connected"
                : googleAuthStatus.isConfigured
                ? "⚠️ Google Calendar configured, authentication needed"
                : "❌ Google Calendar not configured"}
            </span>
            {googleAuthStatus.isConfigured &&
              !googleAuthStatus.hasRefreshToken && (
                <button
                  onClick={handleGoogleAuth}
                  disabled={loading}
                  className="btn btn-primary"
                >
                  {loading ? "Authenticating..." : "Authenticate Google"}
                </button>
              )}
            <button
              onClick={checkGoogleAuth}
              disabled={loading}
              className="btn btn-secondary"
            >
              {loading ? "Checking..." : "Refresh Status"}
            </button>
          </div>
        </div>
        <p className="auth-note">
          {googleAuthStatus.canCreateMeetings
            ? "✅ Ready to create real Google Meet events with calendar invites!"
            : googleAuthStatus.isConfigured
            ? "⚠️ Google API configured. Click 'Authenticate Google' to enable real Google Meet creation."
            : "❌ Configure Google API credentials in .env.server to enable Google Meet integration."}
        </p>
      </section>

      {/* Email Service */}
      <section className="auth-section">
        <h2>📧 Nodemailer Email Service</h2>
        <div className="auth-controls">
          <div className="auth-status">
            <span
              className={`auth-indicator ${
                emailServerStatus === "configured"
                  ? "authenticated"
                  : "not-authenticated"
              }`}
            >
              {emailServerStatus === "configured"
                ? "✅ Email server configured"
                : emailServerStatus === "offline"
                ? "❌ Email server offline"
                : emailServerStatus === "not-configured"
                ? "⚠️ Email server not configured"
                : "⏳ Checking email server..."}
            </span>
            <button
              onClick={checkEmailServer}
              disabled={loading}
              className="btn btn-secondary"
            >
              {loading ? "Checking..." : "Refresh Status"}
            </button>
          </div>
        </div>
        <p className="auth-note">
          {emailServerStatus === "configured"
            ? "✅ Email server is ready! Emails will include Google Calendar invites and Google Meet links."
            : emailServerStatus === "offline"
            ? "❌ Email server is not running. Start it with 'npm run server' in a separate terminal."
            : "⚠️ Email server needs to be configured with proper credentials."}
        </p>
      </section>

      <section className="tabs-section">
        <div className="tabs">
          <button
            className={`tab ${activeTab === "create" ? "active" : ""}`}
            onClick={() => setActiveTab("create")}
          >
            🎥 Create Meeting
          </button>
          <button
            className={`tab ${activeTab === "upload" ? "active" : ""}`}
            onClick={() => setActiveTab("upload")}
          >
            📊 Upload Excel
          </button>
        </div>
      </section>

      {activeTab === "create" && (
        <section className="create-section">
          <MeetCreator onMeetCreated={handleMeetCreated} />
        </section>
      )}

      {activeTab === "upload" && (
        <section className="upload-section">
          <h2>Upload Webinar Details</h2>
          <ExcelUploader onUpload={handleExcelUpload} />
        </section>
      )}

      {webinars.length > 0 && (
        <section className="webinars-section">
          <h2>
            Webinars ({webinars.length}) - Schedule Google Meet & Send
            Notifications
          </h2>
          <WebinarTable
            webinars={webinars}
            onSendNotifications={handleSendNotifications}
            loading={loading}
            emailOnly={true}
          />
        </section>
      )}
    </div>
  );
};

export default WebinarManager;
