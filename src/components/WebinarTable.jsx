import {
  Calendar,
  Clock,
  User,
  Mail,
  Phone,
  Video,
  Send,
  ExternalLink,
} from "lucide-react";
import { format } from "date-fns";
import "./WebinarTable.css";

const WebinarTable = ({
  webinars,
  onSendNotifications,
  loading,
  emailOnly = false,
}) => {
  const formatDate = (dateString) => {
    try {
      return format(new Date(dateString), "MMM dd, yyyy");
    } catch {
      return dateString;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "scheduled":
        return "green";
      case "pending":
        return "orange";
      case "error":
        return "red";
      default:
        return "gray";
    }
  };

  return (
    <div className="webinar-table-container">
      <div className="table-wrapper">
        <table className="webinar-table">
          <thead>
            <tr>
              <th>Webinar Details</th>
              <th>Presenter</th>
              <th>Attendee</th>
              <th>Schedule & Links</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {webinars.map((webinar) => (
              <tr key={webinar.id}>
                <td className="webinar-details">
                  <div className="detail-item">
                    <strong>{webinar.name}</strong>
                  </div>
                  <div className="detail-item">
                    <span className="badge">ID: {webinar.webinarId}</span>
                  </div>
                  <div className="detail-item">
                    <Calendar size={16} />
                    <span>{formatDate(webinar.date)}</span>
                  </div>
                  <div className="detail-item">
                    <Clock size={16} />
                    <span>{webinar.time}</span>
                  </div>
                  <div className="detail-item">
                    <span
                      className={`status status-${getStatusColor(
                        webinar.status
                      )}`}
                    >
                      {webinar.status}
                    </span>
                  </div>
                </td>

                <td className="contact-info">
                  <div className="contact-item">
                    <User size={16} />
                    <span>{webinar.presenter.name}</span>
                  </div>
                  <div className="contact-item">
                    <Mail size={16} />
                    <span>{webinar.presenter.email}</span>
                  </div>
                  <div className="contact-item">
                    <Phone size={16} />
                    <span>{webinar.presenter.phone}</span>
                  </div>
                </td>

                <td className="contact-info">
                  <div className="contact-item">
                    <User size={16} />
                    <span>{webinar.attendee.name}</span>
                  </div>
                  <div className="contact-item">
                    <Mail size={16} />
                    <span>{webinar.attendee.email}</span>
                  </div>
                  <div className="contact-item">
                    <Phone size={16} />
                    <span>{webinar.attendee.phone}</span>
                  </div>
                </td>

                <td className="schedule-links">
                  {/* COMMENTED OUT - Scheduling functionality
                  <div className="platform-buttons">
                    <button
                      onClick={() => onSchedule(webinar, 'zoom')}
                      disabled={loading}
                      className="btn btn-zoom"
                    >
                      <Video size={16} />
                      Schedule Zoom
                    </button>
                    <button
                      onClick={() => onSchedule(webinar, 'google-meet')}
                      disabled={loading}
                      className="btn btn-google"
                      title={!isGoogleAuth ? 'Connect Google account for real Meet links' : 'Create real Google Meet link'}
                    >
                      <Video size={16} />
                      {isGoogleAuth ? 'Schedule Meet' : 'Schedule Meet (Demo)'}
                    </button>
                  </div>
                  
                  {!isGoogleAuth && (
                    <div className="auth-warning">
                      <small>💡 Connect Google for real scheduled links</small>
                    </div>
                  )}
                  */}

                  {/* EMAIL ONLY MODE - Show message */}
                  <div className="email-only-message">
                    <h4>📧 Email Notifications Only</h4>
                    <p>
                      This simplified version focuses on Nodemailer email
                      notifications with Google Calendar invites.
                    </p>
                    <p>
                      <strong>
                        Scheduling functionality is commented out.
                      </strong>
                    </p>
                  </div>

                  {webinar.presenterLink && (
                    <div className="links">
                      <div className="platform-info">
                        <span
                          className={`platform-badge ${webinar.platform?.toLowerCase()}`}
                        >
                          {webinar.platform}
                        </span>
                        {webinar.status && (
                          <span
                            className={`status-badge ${
                              webinar.status.includes("demo") ? "demo" : "real"
                            }`}
                          >
                            {webinar.status.includes("demo") ? "Demo" : "Real"}
                          </span>
                        )}
                      </div>
                      <div className="link-item presenter-link">
                        <strong>🎤 Host Link:</strong>
                        <a
                          href={webinar.presenterLink}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <ExternalLink size={14} />
                          Start as Host
                        </a>
                      </div>
                      <div className="link-item attendee-link">
                        <strong>👥 Attendee Link:</strong>
                        <a
                          href={webinar.attendeeLink}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <ExternalLink size={14} />
                          Join as Attendee
                        </a>
                      </div>
                      {webinar.htmlLink && (
                        <div className="link-item calendar-link">
                          <strong>📅 Calendar Event:</strong>
                          <a
                            href={webinar.htmlLink}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <ExternalLink size={14} />
                            View in Calendar
                          </a>
                        </div>
                      )}
                      <div className="platform-badge">
                        Platform:{" "}
                        <span className="platform-name">
                          {webinar.platform}
                        </span>
                      </div>
                    </div>
                  )}
                </td>

                <td className="actions">
                  <div className="action-buttons">
                    <button
                      onClick={() => onSendNotifications(webinar)}
                      disabled={loading || !webinar.presenterLink}
                      className="btn btn-email"
                      title="Send Email Notifications to Presenter and Attendee"
                    >
                      <Send size={16} />
                      Send Email Notifications
                    </button>
                  </div>

                  {!webinar.presenterLink && (
                    <div className="no-links-message">
                      <small>
                        Schedule webinar first to send notifications
                      </small>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default WebinarTable;
