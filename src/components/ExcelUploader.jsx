import { useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import * as XLSX from 'xlsx'
import { Upload, FileSpreadsheet, Download } from 'lucide-react'
import { v4 as uuidv4 } from 'uuid'
import { generateSampleExcel } from '../utils/sampleData'
import './ExcelUploader.css'

const ExcelUploader = ({ onUpload }) => {
  const processExcelFile = useCallback((file) => {
    const reader = new FileReader()
    
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result)
        const workbook = XLSX.read(data, { type: 'array' })
        const worksheetName = workbook.SheetNames[0]
        const worksheet = workbook.Sheets[worksheetName]
        const jsonData = XLSX.utils.sheet_to_json(worksheet)
        
        // Transform the data to match our webinar structure
        const webinars = jsonData.map(row => ({
          id: uuidv4(),
          webinarId: row['Webinar ID'] || row['webinar_id'] || '',
          name: row['Webinar Name'] || row['webinar_name'] || '',
          date: row['Date'] || row['date'] || '',
          time: row['Time'] || row['time'] || '',
          presenter: {
            name: row['Presenter Name'] || row['presenter_name'] || '',
            email: row['Presenter Email'] || row['presenter_email'] || '',
            phone: row['Presenter Phone'] || row['presenter_phone'] || ''
          },
          attendee: {
            name: row['Attendee Name'] || row['attendee_name'] || '',
            email: row['Attendee Email'] || row['attendee_email'] || '',
            phone: row['Attendee Phone'] || row['attendee_phone'] || ''
          },
          status: 'pending',
          platform: null,
          presenterLink: null,
          attendeeLink: null
        }))
        
        onUpload(webinars)
      } catch (error) {
        console.error('Error processing Excel file:', error)
        alert('Error processing Excel file. Please check the format.')
      }
    }
    
    reader.readAsArrayBuffer(file)
  }, [onUpload])

  const onDrop = useCallback((acceptedFiles) => {
    const file = acceptedFiles[0]
    if (file) {
      processExcelFile(file)
    }
  }, [processExcelFile])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls'],
      'text/csv': ['.csv']
    },
    multiple: false
  })

  return (
    <div className="excel-uploader">
      <div className="upload-actions">
        <button 
          onClick={generateSampleExcel}
          className="btn btn-sample"
        >
          <Download size={16} />
          Download Sample Excel
        </button>
      </div>
      
      <div {...getRootProps()} className={`dropzone ${isDragActive ? 'active' : ''}`}>
        <input {...getInputProps()} />
        <div className="dropzone-content">
          {isDragActive ? (
            <>
              <Upload size={48} />
              <p>Drop the Excel file here...</p>
            </>
          ) : (
            <>
              <FileSpreadsheet size={48} />
              <p>Drag & drop an Excel file here, or click to select</p>
              <small>Supports .xlsx, .xls, and .csv files</small>
            </>
          )}
        </div>
      </div>
      
      <div className="format-info">
        <h4>Expected Excel Format:</h4>
        <div className="format-columns">
          <ul>
            <li>Webinar ID</li>
            <li>Webinar Name</li>
            <li>Date</li>
            <li>Time</li>
          </ul>
          <ul>
            <li>Presenter Name</li>
            <li>Presenter Email</li>
            <li>Presenter Phone</li>
          </ul>
          <ul>
            <li>Attendee Name</li>
            <li>Attendee Email</li>
            <li>Attendee Phone</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default ExcelUploader
