// Email server using Express and Nodemailer with Google Meet integration
const express = require('express')
const cors = require('cors')
const nodemailer = require('nodemailer')
const { google } = require('googleapis')
require('dotenv').config({ path: '.env.server' })

const app = express()
const PORT = process.env.PORT || 3001

// Middleware
app.use(cors())
app.use(express.json())

// Google Calendar setup
const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  'http://localhost:3001/auth/callback'
)

// Set credentials for service account if available
if (process.env.GOOGLE_REFRESH_TOKEN) {
  oauth2Client.setCredentials({
    refresh_token: process.env.GOOGLE_REFRESH_TOKEN
  })
}

const calendar = google.calendar({ version: 'v3', auth: oauth2Client })

// Create reusable transporter object using Gmail
const createTransporter = () => {
  return nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE || 'gmail',
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT) || 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  })
}

// Enhanced email templates with Google Calendar integration
const generatePresenterEmailBody = (webinar) => {
  const scheduledTime = new Date(`${webinar.date}T${webinar.time}:00`).toLocaleString()
  const startDateTime = new Date(`${webinar.date}T${webinar.time}:00`)
  const endDateTime = new Date(startDateTime.getTime() + 60 * 60 * 1000) // 1 hour duration
  
  // Generate Google Calendar link
  const calendarLink = generateGoogleCalendarLink({
    title: `Host: ${webinar.name}`,
    startTime: startDateTime,
    endTime: endDateTime,
    description: `You are the host for this webinar.\n\nAttendee: ${webinar.attendee.name} (${webinar.attendee.email})\n\nGoogle Meet: ${webinar.presenterLink || 'Meeting link will be provided'}`,
    location: webinar.presenterLink || 'Online Meeting'
  })
  
  return `
    <html>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <h2 style="color: #2c5282;">🎯 Host Confirmation: ${webinar.name}</h2>
        <p>Hello <strong>${webinar.presenter.name}</strong>,</p>
        <p>You are confirmed as the <strong>host/presenter</strong> for the following webinar:</p>
        
        <div style="background: #f7fafc; padding: 20px; border-left: 4px solid #4299e1; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #2d3748;">📅 Webinar Details</h3>
          <p><strong>📋 Name:</strong> ${webinar.name}</p>
          <p><strong>📅 Date & Time:</strong> ${scheduledTime}</p>
          <p><strong>💻 Platform:</strong> Google Meet + Email Notifications</p>
          <p><strong>🆔 Webinar ID:</strong> ${webinar.webinarId}</p>
          ${webinar.meetingId ? `<p><strong>🎥 Meeting ID:</strong> ${webinar.meetingId}</p>` : ''}
        </div>
        
        ${webinar.presenterLink ? `
        <div style="background: #e6ffed; padding: 20px; border-left: 4px solid #28a745; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #2d3748;">🎥 Google Meet Link (HOST)</h3>
          <p style="text-align: center;">
            <a href="${webinar.presenterLink}" 
               style="display: inline-block; background: #28a745; color: white; padding: 15px 30px; 
                      text-decoration: none; border-radius: 5px; font-weight: bold; font-size: 16px;">
              🎥 Join Google Meet as Host
            </a>
          </p>
          <p><small>Click this link to start the meeting as the host.</small></p>
        </div>
        ` : ''}
        </div>
        
        <div style="background: #e6fffa; padding: 20px; border-left: 4px solid #38b2ac; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #2d3748;">� Add to Google Calendar</h3>
          <p style="text-align: center;">
            <a href="${calendarLink}" 
               style="display: inline-block; background: #4285f4; color: white; padding: 15px 30px; 
                      text-decoration: none; border-radius: 5px; font-weight: bold; font-size: 16px;">
              � Add Host Event to Calendar
            </a>
          </p>
          <p><small>This will create a calendar event with all the details and send invites to the attendee.</small></p>
        </div>

        <div style="background: #fef5e7; padding: 20px; border-left: 4px solid #ed8936; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #2d3748;">👤 Attendee Information</h3>
          <p><strong>Name:</strong> ${webinar.attendee.name}</p>
          <p><strong>Email:</strong> ${webinar.attendee.email}</p>
          <p><strong>Phone:</strong> ${webinar.attendee.phone}</p>
        </div>
        
        <div style="background: #fff5f5; padding: 20px; border-left: 4px solid #f56565; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #2d3748;">⚠️ Important Notes for Hosts</h3>
          <ul>
            <li>Click the Google Meet link above to start the meeting as host</li>
            <li>Click the calendar link to add this event to your Google Calendar</li>
            <li>The calendar event will automatically invite the attendee</li>
            <li>Join 10-15 minutes early to test your setup</li>
            <li>Make sure your camera and microphone are working</li>
          </ul>
        </div>
        
        <p>Best regards,<br><strong>Webinar Management System with Nodemailer</strong></p>
      </body>
    </html>
  `
}

const generateAttendeeEmailBody = (webinar) => {
  const scheduledTime = new Date(`${webinar.date}T${webinar.time}:00`).toLocaleString()
  const startDateTime = new Date(`${webinar.date}T${webinar.time}:00`)
  const endDateTime = new Date(startDateTime.getTime() + 60 * 60 * 1000) // 1 hour duration
  
  // Generate Google Calendar link
  const calendarLink = generateGoogleCalendarLink({
    title: `Attend: ${webinar.name}`,
    startTime: startDateTime,
    endTime: endDateTime,
    description: `You are invited to attend this webinar.\n\nPresenter: ${webinar.presenter.name} (${webinar.presenter.email})\n\nGoogle Meet: ${webinar.attendeeLink || 'Meeting link will be provided'}`,
    location: webinar.attendeeLink || 'Online Meeting'
  })
  
  return `
    <html>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <h2 style="color: #2c5282;">🎓 Webinar Invitation: ${webinar.name}</h2>
        <p>Hello <strong>${webinar.attendee.name}</strong>,</p>
        <p>You are invited to attend the following webinar:</p>
        
        <div style="background: #f7fafc; padding: 20px; border-left: 4px solid #4299e1; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #2d3748;">📅 Webinar Details</h3>
          <p><strong>📋 Name:</strong> ${webinar.name}</p>
          <p><strong>📅 Date & Time:</strong> ${scheduledTime}</p>
          <p><strong>💻 Platform:</strong> Google Meet + Email Notifications</p>
          <p><strong>🎤 Presenter:</strong> ${webinar.presenter.name}</p>
          ${webinar.meetingId ? `<p><strong>🎥 Meeting ID:</strong> ${webinar.meetingId}</p>` : ''}
        </div>
        
        ${webinar.attendeeLink ? `
        <div style="background: #e6ffed; padding: 20px; border-left: 4px solid #28a745; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #2d3748;">🎥 Google Meet Link</h3>
          <p style="text-align: center;">
            <a href="${webinar.attendeeLink}" 
               style="display: inline-block; background: #28a745; color: white; padding: 15px 30px; 
                      text-decoration: none; border-radius: 5px; font-weight: bold; font-size: 16px;">
              🎥 Join Google Meet
            </a>
          </p>
          <p><small>Click this link to join the webinar at the scheduled time.</small></p>
        </div>
        ` : ''}
        </div>
        
        <div style="background: #e6fffa; padding: 20px; border-left: 4px solid #38b2ac; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #2d3748;">� Add to Google Calendar</h3>
          <p style="text-align: center;">
            <a href="${calendarLink}" 
               style="display: inline-block; background: #4285f4; color: white; padding: 15px 30px; 
                      text-decoration: none; border-radius: 5px; font-weight: bold; font-size: 16px;">
              📅 Add to My Calendar
            </a>
          </p>
          <p><small>This will add the webinar to your Google Calendar with all the details.</small></p>
        </div>
        
        <div style="background: #fef5e7; padding: 20px; border-left: 4px solid #ed8936; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #2d3748;">📝 Instructions</h3>
          <ul>
            <li>Click the Google Meet link above to join the webinar</li>
            <li>Click the calendar link to save this event to your calendar</li>
            <li>You'll receive calendar reminders before the webinar</li>
            <li>Join 5 minutes before the scheduled time</li>
            <li>Make sure your camera and microphone are ready</li>
          </ul>
        </div>
        
        <p>We look forward to your participation!</p>
        <p>Best regards,<br><strong>Webinar Management System with Nodemailer</strong></p>
      </body>
    </html>
  `
}

// Function to generate Google Calendar links
const generateGoogleCalendarLink = ({ title, startTime, endTime, description, location }) => {
  const formatDateTime = (date) => {
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'
  }
  
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: title,
    dates: `${formatDateTime(startTime)}/${formatDateTime(endTime)}`,
    details: description,
    location: location || '',
    sf: 'true',
    output: 'xml'
  })
  
  return `https://calendar.google.com/calendar/render?${params.toString()}`
}

// Function to create Google Meet event
const createGoogleMeetEvent = async (webinar) => {
  try {
    const startDateTime = new Date(`${webinar.date}T${webinar.time}:00`)
    const endDateTime = new Date(startDateTime.getTime() + 60 * 60 * 1000) // 1 hour duration

    const event = {
      summary: webinar.name,
      description: `Webinar: ${webinar.name}\nPresenter: ${webinar.presenter.name} (${webinar.presenter.email})\nAttendee: ${webinar.attendee.name} (${webinar.attendee.email})`,
      start: {
        dateTime: startDateTime.toISOString(),
        timeZone: 'UTC'
      },
      end: {
        dateTime: endDateTime.toISOString(),
        timeZone: 'UTC'
      },
      attendees: [
        { email: webinar.presenter.email, displayName: webinar.presenter.name },
        { email: webinar.attendee.email, displayName: webinar.attendee.name }
      ],
      conferenceData: {
        createRequest: {
          requestId: `webinar-${webinar.webinarId}-${Date.now()}`,
          conferenceSolutionKey: { type: 'hangoutsMeet' }
        }
      },
      reminders: {
        useDefault: false,
        overrides: [
          { method: 'email', minutes: 24 * 60 }, // 24 hours before
          { method: 'popup', minutes: 15 } // 15 minutes before
        ]
      }
    }

    // Try to create a real Google Calendar event if credentials are available
    if (process.env.GOOGLE_REFRESH_TOKEN) {
      try {
        const response = await calendar.events.insert({
          calendarId: 'primary',
          resource: event,
          conferenceDataVersion: 1,
          sendUpdates: 'all'
        })

        const createdEvent = response.data
        
        return {
          platform: 'Google Meet',
          meetingId: createdEvent.id,
          presenterLink: createdEvent.hangoutLink || createdEvent.conferenceData?.entryPoints?.[0]?.uri,
          attendeeLink: createdEvent.hangoutLink || createdEvent.conferenceData?.entryPoints?.[0]?.uri,
          calendarEventId: createdEvent.id,
          status: 'scheduled',
          startTime: createdEvent.start.dateTime,
          endTime: createdEvent.end.dateTime,
          htmlLink: createdEvent.htmlLink
        }
      } catch (apiError) {
        console.warn('Failed to create real Google Calendar event:', apiError.message)
        // Fall back to mock implementation
      }
    }

    // Fallback to mock data if real API isn't configured
    const meetingId = `meet-${webinar.webinarId}-${Date.now()}`
    const meetLink = `https://meet.google.com/${meetingId}`
    
    return {
      platform: 'Google Meet',
      meetingId: meetingId,
      presenterLink: meetLink,
      attendeeLink: meetLink,
      calendarEventId: `cal-${meetingId}`,
      status: 'scheduled (demo)',
      startTime: startDateTime.toISOString(),
      endTime: endDateTime.toISOString(),
      htmlLink: `https://calendar.google.com/calendar/event?eid=${meetingId}`
    }
  } catch (error) {
    console.error('Failed to create Google Meet event:', error)
    // Fallback to mock data
    const meetingId = `meet-${webinar.webinarId}-${Date.now()}`
    const meetLink = `https://meet.google.com/${meetingId}`
    
    return {
      platform: 'Google Meet',
      meetingId: meetingId,
      presenterLink: meetLink,
      attendeeLink: meetLink,
      calendarEventId: `cal-${meetingId}`,
      status: 'scheduled (demo)',
      startTime: new Date(`${webinar.date}T${webinar.time}:00`).toISOString(),
      endTime: new Date(new Date(`${webinar.date}T${webinar.time}:00`).getTime() + 60 * 60 * 1000).toISOString(),
      htmlLink: `https://calendar.google.com/calendar/event?eid=${meetingId}`
    }
  }
}

// Route to send webinar notifications
app.post('/api/send-notifications', async (req, res) => {
  try {
    const { webinar } = req.body

    if (!webinar) {
      return res.status(400).json({ error: 'Webinar data is required' })
    }

    // Validate required email configuration
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      return res.status(500).json({ 
        error: 'Email configuration missing. Please set EMAIL_USER and EMAIL_PASS environment variables.' 
      })
    }

    const transporter = createTransporter()

    // Verify transporter configuration
    await transporter.verify()

    // Prepare email options for presenter
    const presenterMailOptions = {
      from: `"${process.env.EMAIL_FROM_NAME || 'Webinar Management'}" <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`,
      to: webinar.presenter.email,
      subject: `🎯 Host Confirmation: ${webinar.name}`,
      html: generatePresenterEmailBody(webinar)
    }

    // Prepare email options for attendee
    const attendeeMailOptions = {
      from: `"${process.env.EMAIL_FROM_NAME || 'Webinar Management'}" <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`,
      to: webinar.attendee.email,
      subject: `🎓 Webinar Invitation: ${webinar.name}`,
      html: generateAttendeeEmailBody(webinar)
    }

    // Send emails
    const [presenterResult, attendeeResult] = await Promise.all([
      transporter.sendMail(presenterMailOptions),
      transporter.sendMail(attendeeMailOptions)
    ])

    console.log('Email sent to presenter:', presenterResult.messageId)
    console.log('Email sent to attendee:', attendeeResult.messageId)

    res.json({
      success: true,
      message: 'Email notifications sent successfully',
      presenterEmailData: {
        to: webinar.presenter.email,
        messageId: presenterResult.messageId,
        sent: true,
        timestamp: new Date().toISOString(),
        type: 'presenter'
      },
      attendeeEmailData: {
        to: webinar.attendee.email,
        messageId: attendeeResult.messageId,
        sent: true,
        timestamp: new Date().toISOString(),
        type: 'attendee'
      }
    })

  } catch (error) {
    console.error('Email sending error:', error)
    res.status(500).json({
      error: 'Failed to send email notifications',
      details: error.message
    })
  }
})

// Route to schedule Google Meet webinar
app.post('/api/schedule-google-meet', async (req, res) => {
  try {
    const { webinar } = req.body

    if (!webinar) {
      return res.status(400).json({ error: 'Webinar data is required' })
    }

    // Create Google Meet event
    const meetData = await createGoogleMeetEvent(webinar)
    
    console.log('Google Meet webinar scheduled:', meetData)
    
    res.json({
      success: true,
      message: 'Google Meet webinar scheduled successfully',
      ...meetData
    })

  } catch (error) {
    console.error('Google Meet scheduling error:', error)
    res.status(500).json({
      error: 'Failed to schedule Google Meet webinar',
      details: error.message
    })
  }
})

// Google OAuth routes
app.get('/auth/google', (req, res) => {
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: [
      'https://www.googleapis.com/auth/calendar',
      'https://www.googleapis.com/auth/calendar.events'
    ],
    prompt: 'consent'
  })
  res.redirect(authUrl)
})

app.get('/auth/callback', async (req, res) => {
  const { code } = req.query
  
  try {
    const { tokens } = await oauth2Client.getToken(code)
    oauth2Client.setCredentials(tokens)
    
    // Store the refresh token (in production, store this securely)
    console.log('Refresh Token:', tokens.refresh_token)
    console.log('Access Token:', tokens.access_token)
    
    res.send(`
      <html>
        <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
          <h2 style="color: #4285f4;">✅ Google Calendar Connected!</h2>
          <p>You can now create real Google Meet events with calendar invitations.</p>
          <p><strong>Next step:</strong> Add the refresh token to your .env.server file:</p>
          <pre style="background: #f1f3f4; padding: 15px; border-radius: 5px; text-align: left; max-width: 600px; margin: 20px auto;">GOOGLE_REFRESH_TOKEN=${tokens.refresh_token}</pre>
          <p><button onclick="window.close()">Close this window</button></p>
        </body>
      </html>
    `)
  } catch (error) {
    console.error('Error exchanging code for tokens:', error)
    res.status(500).send('Authentication failed')
  }
})

app.get('/auth/status', (req, res) => {
  const isConfigured = !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET)
  const hasRefreshToken = !!process.env.GOOGLE_REFRESH_TOKEN
  
  res.json({
    isConfigured,
    hasRefreshToken,
    canCreateMeetings: isConfigured && hasRefreshToken
  })
})

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Email server is running' })
})

// Test email configuration endpoint
app.get('/api/test-config', (req, res) => {
  const config = {
    emailConfigured: !!(process.env.EMAIL_USER && process.env.EMAIL_PASS),
    emailUser: process.env.EMAIL_USER ? '***configured***' : 'not set',
    emailService: process.env.EMAIL_SERVICE || 'gmail',
    emailHost: process.env.EMAIL_HOST || 'smtp.gmail.com',
    emailPort: process.env.EMAIL_PORT || '587'
  }
  res.json(config)
})

app.listen(PORT, () => {
  console.log(`Email server running on port ${PORT}`)
  console.log('Email configuration:', {
    user: process.env.EMAIL_USER ? '***configured***' : 'NOT SET',
    pass: process.env.EMAIL_PASS ? '***configured***' : 'NOT SET',
    service: process.env.EMAIL_SERVICE || 'gmail'
  })
})
