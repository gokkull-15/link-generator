import { useState } from "react";
import "./MeetCreator.css";

const MeetCreator = ({ onMeetCreated }) => {
  const [formData, setFormData] = useState({
    name: "",
    date: "",
    time: "",
    presenterName: "",
    presenterEmail: "",
    attendeeName: "",
    attendeeEmail: "",
    attendeePhone: "",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [createdMeet, setCreatedMeet] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const scheduleGoogleMeet = async (webinarData) => {
    try {
      const response = await fetch(
        "http://localhost:3001/api/schedule-google-meet",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ webinar: webinarData }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to schedule Google Meet");
      }

      return await response.json();
    } catch (error) {
      console.error("Failed to schedule Google Meet:", error);
      throw error;
    }
  };

  const sendNotifications = async (webinarData) => {
    try {
      const response = await fetch(
        "http://localhost:3001/api/send-notifications",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ webinar: webinarData }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to send notifications");
      }

      return await response.json();
    } catch (error) {
      console.error("Failed to send notifications:", error);
      throw error;
    }
  };

  const handleCreateMeet = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      // Validate form
      const requiredFields = [
        "name",
        "date",
        "time",
        "presenterName",
        "presenterEmail",
        "attendeeName",
        "attendeeEmail",
      ];
      const missingFields = requiredFields.filter(
        (field) => !formData[field].trim()
      );

      if (missingFields.length > 0) {
        throw new Error(
          `Please fill in all required fields: ${missingFields.join(", ")}`
        );
      }

      // Validate email formats
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.presenterEmail)) {
        throw new Error("Please enter a valid presenter email address");
      }
      if (!emailRegex.test(formData.attendeeEmail)) {
        throw new Error("Please enter a valid attendee email address");
      }

      // Create webinar object
      const webinarData = {
        id: `meet-${Date.now()}`,
        webinarId: `WEB-${Date.now()}`,
        name: formData.name,
        date: formData.date,
        time: formData.time,
        presenter: {
          name: formData.presenterName,
          email: formData.presenterEmail,
        },
        attendee: {
          name: formData.attendeeName,
          email: formData.attendeeEmail,
          phone: formData.attendeePhone || "Not provided",
        },
        platform: "Google Meet",
      };

      setMessage("Creating Google Meet event...");

      // Step 1: Schedule Google Meet
      const meetData = await scheduleGoogleMeet(webinarData);

      // Add meet data to webinar object
      const webinarWithMeet = {
        ...webinarData,
        presenterLink: meetData.presenterLink,
        attendeeLink: meetData.attendeeLink,
        meetingId: meetData.meetingId,
        calendarEventId: meetData.calendarEventId,
        htmlLink: meetData.htmlLink,
      };

      setCreatedMeet(webinarWithMeet);
      setMessage(
        `✅ Google Meet event created successfully! Meeting ID: ${meetData.meetingId}`
      );

      // Notify parent component
      if (onMeetCreated) {
        onMeetCreated(webinarWithMeet);
      }
    } catch (error) {
      setMessage(`❌ Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSendNotifications = async () => {
    if (!createdMeet) return;

    setLoading(true);
    setMessage("Sending email notifications...");

    try {
      await sendNotifications(createdMeet);
      setMessage(
        "✅ Email notifications sent successfully to both presenter and attendee!"
      );
    } catch (error) {
      setMessage(`❌ Error sending notifications: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFormData({
      name: "",
      date: "",
      time: "",
      presenterName: "",
      presenterEmail: "",
      attendeeName: "",
      attendeeEmail: "",
      attendeePhone: "",
    });
    setCreatedMeet(null);
    setMessage("");
  };

  return (
    <div className="meet-creator">
      <h2>🎥 Create Google Meet Event</h2>
      <p>Create a new Google Meet event and send invitations to participants</p>

      {message && (
        <div
          className={`message ${message.includes("❌") ? "error" : "success"}`}
        >
          {message}
        </div>
      )}

      <form onSubmit={handleCreateMeet} className="meet-form">
        <div className="form-section">
          <h3>📅 Meeting Details</h3>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="name">Meeting Name *</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="e.g., Weekly Team Standup"
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="date">Date *</label>
              <input
                type="date"
                id="date"
                name="date"
                value={formData.date}
                onChange={handleInputChange}
                min={new Date().toISOString().split("T")[0]}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="time">Time *</label>
              <input
                type="time"
                id="time"
                name="time"
                value={formData.time}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>
        </div>

        <div className="form-section">
          <h3>🎤 Presenter Details</h3>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="presenterName">Presenter Name *</label>
              <input
                type="text"
                id="presenterName"
                name="presenterName"
                value={formData.presenterName}
                onChange={handleInputChange}
                placeholder="e.g., John Smith"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="presenterEmail">Presenter Email *</label>
              <input
                type="email"
                id="presenterEmail"
                name="presenterEmail"
                value={formData.presenterEmail}
                onChange={handleInputChange}
                placeholder="e.g., john@company.com"
                required
              />
            </div>
          </div>
        </div>

        <div className="form-section">
          <h3>👤 Attendee Details</h3>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="attendeeName">Attendee Name *</label>
              <input
                type="text"
                id="attendeeName"
                name="attendeeName"
                value={formData.attendeeName}
                onChange={handleInputChange}
                placeholder="e.g., Jane Doe"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="attendeeEmail">Attendee Email *</label>
              <input
                type="email"
                id="attendeeEmail"
                name="attendeeEmail"
                value={formData.attendeeEmail}
                onChange={handleInputChange}
                placeholder="e.g., jane@company.com"
                required
              />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="attendeePhone">Attendee Phone (Optional)</label>
              <input
                type="tel"
                id="attendeePhone"
                name="attendeePhone"
                value={formData.attendeePhone}
                onChange={handleInputChange}
                placeholder="e.g., +1 234 567 8900"
              />
            </div>
          </div>
        </div>

        <div className="form-actions">
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? "⏳ Creating Meeting..." : "🎥 Create Google Meet"}
          </button>

          <button
            type="button"
            className="btn btn-secondary"
            onClick={handleReset}
            disabled={loading}
          >
            🔄 Reset Form
          </button>
        </div>
      </form>

      {createdMeet && (
        <div className="created-meet-section">
          <h3>✅ Meeting Created Successfully!</h3>
          <div className="meet-details">
            <div className="meet-info">
              <h4>📋 Meeting Information</h4>
              <p>
                <strong>Name:</strong> {createdMeet.name}
              </p>
              <p>
                <strong>Date & Time:</strong>{" "}
                {new Date(
                  `${createdMeet.date}T${createdMeet.time}`
                ).toLocaleString()}
              </p>
              <p>
                <strong>Meeting ID:</strong> {createdMeet.meetingId}
              </p>
              <p>
                <strong>Presenter:</strong> {createdMeet.presenter.name} (
                {createdMeet.presenter.email})
              </p>
              <p>
                <strong>Attendee:</strong> {createdMeet.attendee.name} (
                {createdMeet.attendee.email})
              </p>
            </div>

            {createdMeet.presenterLink && (
              <div className="meet-links">
                <h4>🔗 Meeting Links</h4>
                <p>
                  <strong>Host Link:</strong>
                  <a
                    href={createdMeet.presenterLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="meet-link"
                  >
                    {createdMeet.presenterLink}
                  </a>
                </p>
                <p>
                  <strong>Join Link:</strong>
                  <a
                    href={createdMeet.attendeeLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="meet-link"
                  >
                    {createdMeet.attendeeLink}
                  </a>
                </p>
              </div>
            )}
          </div>

          <div className="notification-section">
            <button
              className="btn btn-success btn-large"
              onClick={handleSendNotifications}
              disabled={loading}
            >
              {loading ? "⏳ Sending..." : "📧 Send Email Notifications"}
            </button>
            <p className="notification-note">
              This will send professional email invitations with Google Meet
              links to both the presenter and attendee.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default MeetCreator;
