# Webinar Management System

A comprehensive webinar management application that allows you to upload Excel files with webinar details, schedule meetings on Google Meet/Zoom, and send **real email notifications using Nodemailer**.

## 🚀 Features

- **📁 Excel File Upload**: Upload CSV/Excel files with webinar details
- **🔗 Real Google Meet Integration**: Create actual scheduled Google Meet links with calendar events
- **📧 Real Email Notifications**: Send professional email invitations using Nodemailer
- **👥 Dual Notifications**: Separate emails for presenters (hosts) and attendees
- **💻 Modern UI**: Clean, responsive interface with status indicators
- **🔄 Fallback System**: Mock implementations when services are unavailable

## 🛠️ Setup Instructions

### 1. Clone and Install
```bash
git clone <repository-url>
cd link-generator
npm install
```

### 2. Environment Configuration

#### Frontend (.env)
```bash
# Google Meet API (optional - for real Google Meet links)
VITE_GOOGLE_CLIENT_ID=your_google_client_id
VITE_GOOGLE_CLIENT_SECRET=your_google_client_secret
VITE_GOOGLE_REDIRECT_URI=http://localhost:5173/auth/callback
```

#### Backend (.env.server)
```bash
# Email Configuration (Required for real email sending)
EMAIL_SERVICE=gmail
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_gmail_app_password
EMAIL_FROM=your_email@gmail.com
EMAIL_FROM_NAME=Webinar Management System
PORT=3001
```

### 3. Gmail Setup (for real emails)

1. Go to [Google Account Settings](https://myaccount.google.com/)
2. Navigate to **Security** > **2-Step Verification**
3. Go to **App passwords** and generate a new app password
4. Update `.env.server` with your Gmail address and app password

### 4. Google Meet Setup (optional)

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google Calendar API
4. Create OAuth 2.0 credentials
5. Update `.env` with your credentials

## 🏃‍♂️ Running the Application

### Option 1: Run Both Frontend and Backend
```bash
npm run dev:full
```

### Option 2: Run Separately

**Terminal 1 (Backend):**
```bash
npm run server
```

**Terminal 2 (Frontend):**
```bash
npm run dev
```

## 📖 Usage

1. **Start the Application**: Open http://localhost:5174 (or the port shown)

2. **Check Status**: Verify Google and Email server status in the interface

3. **Upload Excel File**: 
   - Use the provided `sample-webinars.csv` or create your own
   - Required columns: Webinar ID, Name, Date, Time, Presenter details, Attendee details

4. **Schedule Webinars**:
   - Click "Schedule Zoom" for demo Zoom links
   - Click "Schedule Meet" for Google Meet links (real if authenticated)

5. **Send Notifications**:
   - Click "Send Email Notifications" to send emails to both presenter and attendee
   - Emails include meeting links, calendar events, and instructions

## Usage Guide

### Step 1: Prepare Your Excel File

The application expects an Excel file with the following columns:

| Column Name | Description | Example |
|-------------|-------------|---------|
| Webinar ID | Unique identifier | WEB-001 |
| Webinar Name | Title of the webinar | Digital Marketing Trends 2025 |
| Date | Webinar date | 2025-07-20 |
| Time | Webinar time | 10:00 |
| Presenter Name | Full name of presenter | John Smith |
| Presenter Email | Email address | john.smith@company.com |
| Presenter Phone | Phone number | +1-555-0101 |
| Attendee Name | Full name of attendee | Alice Johnson |
| Attendee Email | Email address | alice.johnson@email.com |
| Attendee Phone | Phone number | +1-555-0201 |

**Tip:** Click "Download Sample Excel" button to get a pre-formatted template with 10 sample webinars.

### Step 2: Upload Your Excel File

1. **Method 1:** Drag and drop your Excel file onto the upload area
2. **Method 2:** Click the upload area and select your file

The system will automatically process your file and display all webinars in a table format.

### Step 3: Schedule Webinars

For each webinar, you can:

1. **Schedule on Zoom:** Click "Schedule Zoom" to create a Zoom meeting
2. **Schedule on Google Meet:** Click "Schedule Meet" to create a Google Meet
3. **View Generated Links:** After scheduling, presenter and attendee links will be displayed

### Step 4: Send Notifications

Once webinars are scheduled:

1. **Email Notifications:** Click "Email" to send formatted invitations
2. **WhatsApp Reminders:** Click "WhatsApp" to send text reminders

## Technical Implementation

### Architecture

```
src/
├── components/
│   ├── WebinarManager.jsx      # Main container component
│   ├── ExcelUploader.jsx       # File upload and processing
│   ├── WebinarTable.jsx        # Data display and actions
│   └── *.css                   # Component styling
├── services/
│   ├── webinarService.js       # Zoom/Meet API integration
│   └── notificationService.js  # Email/WhatsApp services
├── utils/
│   └── sampleData.js          # Sample Excel generator
└── App.jsx                    # Root component
```

### Key Technologies

- **React 19** - UI framework
- **Vite** - Build tool and dev server
- **XLSX** - Excel file processing
- **React Dropzone** - File upload handling
- **Lucide React** - Modern icon library
- **Date-fns** - Date manipulation
- **UUID** - Unique ID generation

### Mock Services (Proof of Concept)

The current implementation uses mock services for:

1. **Zoom API Integration** - Generates mock meeting links
2. **Google Meet API Integration** - Generates mock meeting links
3. **Email Service** - Simulates email sending
4. **WhatsApp API** - Simulates message sending

### Production Implementation

For production use, replace mock services with:

1. **Zoom SDK** - Real Zoom API integration
2. **Google Calendar API** - Real Google Meet creation
3. **Email Service** - Nodemailer, SendGrid, or similar
4. **WhatsApp Business API** - Twilio, MessageBird, or similar

## Customization

### Email Templates

Edit `src/services/notificationService.js` to customize email templates:

```javascript
const generateEmailBody = (webinar) => {
  return `
    <html>
      <body>
        <!-- Your custom email template -->
      </body>
    </html>
  `
}
```

### WhatsApp Messages

Customize WhatsApp message format in the same file:

```javascript
const generateWhatsAppMessage = (webinar) => {
  return `🎯 *Custom Webinar Reminder*
  
  📅 *${webinar.name}*
  // Your custom message format
  `
}
```

### Styling

The application uses CSS modules for styling. Key files:

- `src/App.css` - Global styles and theme
- `src/components/*.css` - Component-specific styles

## Environment Variables (Production)

Create a `.env` file for production configuration:

```env
# Zoom Configuration
ZOOM_API_KEY=your_zoom_api_key
ZOOM_API_SECRET=your_zoom_api_secret

# Google Configuration
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Email Configuration
EMAIL_SERVICE=gmail
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

# WhatsApp Configuration
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_token
WHATSAPP_FROM=whatsapp:+14155238886
```

## Browser Support

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For questions or support, please create an issue in the repository.

---

**Note:** This is a proof-of-concept implementation with mock services. For production use, implement real API integrations and add proper error handling, authentication, and data validation.+ Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
