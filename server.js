// Email server using Express and Nodemailer
const express = require('express')
const cors = require('cors')
const nodemailer = require('nodemailer')
require('dotenv').config()

const app = express()
const PORT = process.env.PORT || 3001

// Middleware
app.use(cors())
app.use(express.json())

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

// Email templates
const generatePresenterEmailBody = (webinar) => {
  const scheduledTime = new Date(`${webinar.date}T${webinar.time}:00`).toLocaleString()
  
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
          <p><strong>💻 Platform:</strong> ${webinar.platform}</p>
          <p><strong>🆔 Webinar ID:</strong> ${webinar.webinarId}</p>
        </div>
        
        <div style="background: #e6fffa; padding: 20px; border-left: 4px solid #38b2ac; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #2d3748;">🔗 Host Links</h3>
          <p><strong>🎤 Host Link:</strong> <a href="${webinar.presenterLink}" style="color: #3182ce; text-decoration: none; font-weight: bold;">Start Webinar as Host</a></p>
          <p><strong>👥 Attendee Link (for sharing):</strong> <a href="${webinar.attendeeLink}" style="color: #3182ce; text-decoration: none;">Join as Attendee</a></p>
          ${webinar.htmlLink ? `<p><strong>📅 Calendar Event:</strong> <a href="${webinar.htmlLink}" style="color: #3182ce; text-decoration: none;">View in Calendar</a></p>` : ''}
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
            <li>Please join 10-15 minutes before the scheduled time to test your setup</li>
            <li>Ensure your camera and microphone are working properly</li>
            <li>Have your presentation materials ready</li>
            <li>The attendee will receive a separate invitation email</li>
          </ul>
        </div>
        
        <p>Best regards,<br><strong>Webinar Management System</strong></p>
      </body>
    </html>
  `
}

const generateAttendeeEmailBody = (webinar) => {
  const scheduledTime = new Date(`${webinar.date}T${webinar.time}:00`).toLocaleString()
  
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
          <p><strong>💻 Platform:</strong> ${webinar.platform}</p>
          <p><strong>🎤 Presenter:</strong> ${webinar.presenter.name}</p>
        </div>
        
        <div style="background: #e6fffa; padding: 20px; border-left: 4px solid #38b2ac; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #2d3748;">🔗 Join Link</h3>
          <p style="text-align: center;">
            <a href="${webinar.attendeeLink}" 
               style="display: inline-block; background: #3182ce; color: white; padding: 15px 30px; 
                      text-decoration: none; border-radius: 5px; font-weight: bold; font-size: 16px;">
              🎯 Join Webinar
            </a>
          </p>
          ${webinar.htmlLink ? `<p><strong>📅 Calendar Event:</strong> <a href="${webinar.htmlLink}" style="color: #3182ce; text-decoration: none;">Add to Calendar</a></p>` : ''}
        </div>
        
        <div style="background: #fef5e7; padding: 20px; border-left: 4px solid #ed8936; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #2d3748;">📝 Instructions</h3>
          <ul>
            <li>Please join 5 minutes before the scheduled time</li>
            <li>Ensure you have a stable internet connection</li>
            <li>Test your audio and video beforehand if participation is required</li>
            <li>Have a notepad ready for taking notes</li>
          </ul>
        </div>
        
        <p>We look forward to your participation!</p>
        <p>Best regards,<br><strong>Webinar Management System</strong></p>
      </body>
    </html>
  `
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
