import * as XLSX from 'xlsx'

export const generateSampleExcel = () => {
  const sampleData = [
    {
      'Webinar ID': 'WEB-001',
      'Webinar Name': 'Digital Marketing Trends 2025',
      'Date': '2025-07-20',
      'Time': '10:00',
      'Presenter Name': 'John Smith',
      'Presenter Email': 'john.smith@company.com',
      'Presenter Phone': '+1-555-0101',
      'Attendee Name': 'Alice Johnson',
      'Attendee Email': 'alice.johnson@email.com',
      'Attendee Phone': '+1-555-0201'
    },
    {
      'Webinar ID': 'WEB-002',
      'Webinar Name': 'AI in Healthcare',
      'Date': '2025-07-20',
      'Time': '14:30',
      'Presenter Name': 'Dr. Sarah Davis',
      'Presenter Email': 'sarah.davis@hospital.com',
      'Presenter Phone': '+1-555-0102',
      'Attendee Name': 'Bob Wilson',
      'Attendee Email': 'bob.wilson@email.com',
      'Attendee Phone': '+1-555-0202'
    },
    {
      'Webinar ID': 'WEB-003',
      'Webinar Name': 'Remote Work Best Practices',
      'Date': '2025-07-21',
      'Time': '09:00',
      'Presenter Name': 'Mike Chen',
      'Presenter Email': 'mike.chen@tech.com',
      'Presenter Phone': '+1-555-0103',
      'Attendee Name': 'Carol Brown',
      'Attendee Email': 'carol.brown@email.com',
      'Attendee Phone': '+1-555-0203'
    },
    {
      'Webinar ID': 'WEB-004',
      'Webinar Name': 'Financial Planning for Entrepreneurs',
      'Date': '2025-07-21',
      'Time': '16:00',
      'Presenter Name': 'Emma Rodriguez',
      'Presenter Email': 'emma.rodriguez@finance.com',
      'Presenter Phone': '+1-555-0104',
      'Attendee Name': 'David Lee',
      'Attendee Email': 'david.lee@email.com',
      'Attendee Phone': '+1-555-0204'
    },
    {
      'Webinar ID': 'WEB-005',
      'Webinar Name': 'Cybersecurity Fundamentals',
      'Date': '2025-07-22',
      'Time': '11:00',
      'Presenter Name': 'James Taylor',
      'Presenter Email': 'james.taylor@security.com',
      'Presenter Phone': '+1-555-0105',
      'Attendee Name': 'Lisa Garcia',
      'Attendee Email': 'lisa.garcia@email.com',
      'Attendee Phone': '+1-555-0205'
    },
    {
      'Webinar ID': 'WEB-006',
      'Webinar Name': 'Cloud Computing Basics',
      'Date': '2025-07-22',
      'Time': '13:30',
      'Presenter Name': 'Rachel Kim',
      'Presenter Email': 'rachel.kim@cloud.com',
      'Presenter Phone': '+1-555-0106',
      'Attendee Name': 'Tom Anderson',
      'Attendee Email': 'tom.anderson@email.com',
      'Attendee Phone': '+1-555-0206'
    },
    {
      'Webinar ID': 'WEB-007',
      'Webinar Name': 'Sustainable Business Practices',
      'Date': '2025-07-23',
      'Time': '10:30',
      'Presenter Name': 'Alex Green',
      'Presenter Email': 'alex.green@sustainability.com',
      'Presenter Phone': '+1-555-0107',
      'Attendee Name': 'Sophie Miller',
      'Attendee Email': 'sophie.miller@email.com',
      'Attendee Phone': '+1-555-0207'
    },
    {
      'Webinar ID': 'WEB-008',
      'Webinar Name': 'Data Analytics for Beginners',
      'Date': '2025-07-23',
      'Time': '15:00',
      'Presenter Name': 'Kevin Zhang',
      'Presenter Email': 'kevin.zhang@analytics.com',
      'Presenter Phone': '+1-555-0108',
      'Attendee Name': 'Nina Patel',
      'Attendee Email': 'nina.patel@email.com',
      'Attendee Phone': '+1-555-0208'
    },
    {
      'Webinar ID': 'WEB-009',
      'Webinar Name': 'Mobile App Development',
      'Date': '2025-07-24',
      'Time': '12:00',
      'Presenter Name': 'Oliver Johnson',
      'Presenter Email': 'oliver.johnson@mobile.com',
      'Presenter Phone': '+1-555-0109',
      'Attendee Name': 'Ryan Thompson',
      'Attendee Email': 'ryan.thompson@email.com',
      'Attendee Phone': '+1-555-0209'
    },
    {
      'Webinar ID': 'WEB-010',
      'Webinar Name': 'E-commerce Growth Strategies',
      'Date': '2025-07-24',
      'Time': '17:30',
      'Presenter Name': 'Maya Singh',
      'Presenter Email': 'maya.singh@ecommerce.com',
      'Presenter Phone': '+1-555-0110',
      'Attendee Name': 'Chris Wilson',
      'Attendee Email': 'chris.wilson@email.com',
      'Attendee Phone': '+1-555-0210'
    }
  ]

  const worksheet = XLSX.utils.json_to_sheet(sampleData)
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Webinars')

  // Auto-fit column widths
  const colWidths = Object.keys(sampleData[0]).map(key => ({
    wch: Math.max(key.length, 20)
  }))
  worksheet['!cols'] = colWidths

  XLSX.writeFile(workbook, 'sample-webinars.xlsx')
}
