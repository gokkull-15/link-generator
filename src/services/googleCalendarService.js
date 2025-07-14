// Google Calendar Service for creating real Google Meet links
import { addHours } from 'date-fns'

class GoogleCalendarService {
  constructor() {
    this.isAuthenticated = false
    this.accessToken = null
  }

  // Initialize Google API
  async initialize() {
    if (typeof window === 'undefined') return false
    
    try {
      await this.loadGoogleAPI()
      return true
    } catch (error) {
      console.error('Failed to initialize Google API:', error)
      return false
    }
  }

  // Load Google API script
  loadGoogleAPI() {
    return new Promise((resolve, reject) => {
      if (window.gapi) {
        resolve(window.gapi)
        return
      }

      const script = document.createElement('script')
      script.src = 'https://apis.google.com/js/api.js'
      script.onload = () => {
        window.gapi.load('client:auth2', () => {
          window.gapi.client.init({
            apiKey: import.meta.env.VITE_GOOGLE_API_KEY,
            clientId: import.meta.env.VITE_GOOGLE_CLIENT_ID,
            discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest'],
            scope: 'https://www.googleapis.com/auth/calendar.events'
          }).then(() => {
            resolve(window.gapi)
          }).catch(reject)
        })
      }
      script.onerror = reject
      document.head.appendChild(script)
    })
  }

  // Authenticate with Google
  async authenticate() {
    try {
      const authInstance = window.gapi.auth2.getAuthInstance()
      const user = await authInstance.signIn()
      this.accessToken = user.getAuthResponse().access_token
      this.isAuthenticated = true
      return true
    } catch (error) {
      console.error('Authentication failed:', error)
      return false
    }
  }

  // Create Google Meet event with real scheduling
  async createMeetEvent(webinar) {
    if (!this.isAuthenticated) {
      // For demo purposes, return mock data if not authenticated
      return this.createMockMeetEvent(webinar)
    }

    try {
      const startDateTime = new Date(`${webinar.date}T${webinar.time}:00`)
      const endDateTime = addHours(startDateTime, 1) // 1 hour duration

      const event = {
        summary: webinar.name,
        description: `Webinar: ${webinar.name}\nPresenter: ${webinar.presenter.name} (${webinar.presenter.email})\nAttendee: ${webinar.attendee.name} (${webinar.attendee.email})`,
        start: {
          dateTime: startDateTime.toISOString(),
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
        },
        end: {
          dateTime: endDateTime.toISOString(),
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
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

      const response = await window.gapi.client.calendar.events.insert({
        calendarId: 'primary',
        resource: event,
        conferenceDataVersion: 1,
        sendUpdates: 'all'
      })

      const meetingData = response.result
      const meetLink = meetingData.hangoutLink || meetingData.conferenceData?.entryPoints?.[0]?.uri

      return {
        platform: 'Google Meet',
        meetingId: meetingData.id,
        presenterLink: meetLink, // Same link for both, but presenter gets calendar invite
        attendeeLink: meetLink,
        calendarEventId: meetingData.id,
        status: 'scheduled',
        startTime: startDateTime.toISOString(),
        endTime: endDateTime.toISOString(),
        htmlLink: meetingData.htmlLink
      }
    } catch (error) {
      console.error('Failed to create Google Meet event:', error)
      // Fallback to mock data
      return this.createMockMeetEvent(webinar)
    }
  }

  // Create mock Google Meet event for demo purposes
  createMockMeetEvent(webinar) {
    const startDateTime = new Date(`${webinar.date}T${webinar.time}:00`)
    const endDateTime = addHours(startDateTime, 1)
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
  }

  // Check if user is signed in
  isSignedIn() {
    if (!window.gapi || !window.gapi.auth2) return false
    const authInstance = window.gapi.auth2.getAuthInstance()
    return authInstance && authInstance.isSignedIn.get()
  }

  // Sign out
  async signOut() {
    if (window.gapi && window.gapi.auth2) {
      const authInstance = window.gapi.auth2.getAuthInstance()
      await authInstance.signOut()
      this.isAuthenticated = false
      this.accessToken = null
    }
  }
}

// Create singleton instance
const googleCalendarService = new GoogleCalendarService()

export default googleCalendarService
