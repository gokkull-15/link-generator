// Enhanced notification service with real Nodemailer backend integration

const API_BASE_URL = 'http://localhost:3001/api'

export const sendEmailNotifications = async (webinar) => {
  try {
    // First, schedule the Google Meet event
    const meetData = await scheduleGoogleMeetEvent(webinar)
    
    // Add meet data to webinar object for email templates
    const webinarWithMeet = {
      ...webinar,
      presenterLink: meetData.presenterLink,
      attendeeLink: meetData.attendeeLink,
      meetingId: meetData.meetingId,
      calendarEventId: meetData.calendarEventId
    }
    
    // Then send email notifications with the meet links
    const response = await fetch(`${API_BASE_URL}/send-notifications`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ webinar: webinarWithMeet })
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
    }

    const result = await response.json()
    console.log('Email notifications sent via Nodemailer:', result)
    
    // Return combined result
    return {
      ...result,
      meetData,
      message: 'Google Meet scheduled and email notifications sent successfully'
    }
    
  } catch (error) {
    console.error('Failed to send email notifications:', error)
    
    // Fallback to mock implementation if server is not available
    if (error.message.includes('fetch')) {
      console.warn('Email server not available, using mock implementation')
      return await sendMockEmailNotifications(webinar)
    }
    
    throw error
  }
}

// Function to schedule Google Meet event
export const scheduleGoogleMeetEvent = async (webinar) => {
  try {
    const response = await fetch(`${API_BASE_URL}/schedule-google-meet`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ webinar })
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
    }

    const result = await response.json()
    console.log('Google Meet event scheduled:', result)
    return result
    
  } catch (error) {
    console.error('Failed to schedule Google Meet event:', error)
    throw error
  }
}

// Fallback mock implementation
const sendMockEmailNotifications = async (webinar) => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 1000))
  
  const presenterEmailData = {
    to: webinar.presenter.email,
    subject: `Host Confirmation: ${webinar.name}`,
    sent: true,
    timestamp: new Date().toISOString(),
    type: 'presenter',
    mock: true
  }

  const attendeeEmailData = {
    to: webinar.attendee.email,
    subject: `Webinar Invitation: ${webinar.name}`,
    sent: true,
    timestamp: new Date().toISOString(),
    type: 'attendee',
    mock: true
  }
  
  console.log('Mock email notifications sent:', { presenterEmailData, attendeeEmailData })
  return { 
    success: true,
    message: 'Mock email notifications sent (server not available)',
    presenterEmailData, 
    attendeeEmailData 
  }
}

// Function to test email server connection
export const testEmailConnection = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/test-config`)
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    return await response.json()
  } catch (error) {
    console.error('Email server connection test failed:', error)
    return { emailConfigured: false, error: error.message }
  }
}

// Function to check email server health
export const checkEmailServerHealth = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/health`)
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    return await response.json()
  } catch (error) {
    console.error('Email server health check failed:', error)
    return { status: 'ERROR', error: error.message }
  }
}

// Check Google Calendar authentication status
export const checkGoogleAuthStatus = async () => {
  try {
    const response = await fetch(`${API_BASE_URL.replace('/api', '')}/auth/status`)
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error('Failed to check Google auth status:', error)
    return {
      isConfigured: false,
      hasRefreshToken: false,
      canCreateMeetings: false
    }
  }
}

// Open Google authentication window
export const authenticateWithGoogle = () => {
  const authWindow = window.open(
    `${API_BASE_URL.replace('/api', '')}/auth/google`,
    'googleAuth',
    'width=500,height=600,scrollbars=yes,resizable=yes'
  )
  
  return new Promise((resolve) => {
    const checkClosed = setInterval(() => {
      if (authWindow.closed) {
        clearInterval(checkClosed)
        resolve(true)
      }
    }, 1000)
  })
}

// WhatsApp functionality removed for now - focusing on email notifications only

// Real implementation examples for production use:
/*
For production, you would use services like:
- SendGrid: https://sendgrid.com/
- Mailgun: https://www.mailgun.com/
- Amazon SES: https://aws.amazon.com/ses/
- Postmark: https://postmarkapp.com/

Example with SendGrid:
import sgMail from '@sendgrid/mail'
sgMail.setApiKey(process.env.SENDGRID_API_KEY)

const msg = {
  to: 'recipient@example.com',
  from: 'sender@example.com',
  subject: 'Subject',
  html: '<p>HTML content</p>',
}

await sgMail.send(msg)
*/
/*
import nodemailer from 'nodemailer'
import twilio from 'twilio'

const transporter = nodemailer.createTransporter({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
})

const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
)

export const sendEmailNotifications = async (webinar) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: [webinar.presenter.email, webinar.attendee.email],
    subject: `Webinar Invitation: ${webinar.name}`,
    html: generateEmailBody(webinar)
  }
  
  const result = await transporter.sendMail(mailOptions)
  return result
}

export const sendWhatsAppReminders = async (webinar) => {
  const message = generateWhatsAppMessage(webinar)
  
  const promises = [
    twilioClient.messages.create({
      body: message,
      from: 'whatsapp:+14155238886', // Twilio Sandbox number
      to: `whatsapp:${webinar.presenter.phone}`
    }),
    twilioClient.messages.create({
      body: message,
      from: 'whatsapp:+14155238886',
      to: `whatsapp:${webinar.attendee.phone}`
    })
  ]
  
  const results = await Promise.all(promises)
  return results
}
*/
