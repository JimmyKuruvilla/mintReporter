import React from 'react'
import { createRoot } from 'react-dom/client'

const App = () => {
  const [files, setFiles] = React.useState<FileList | null>(null)
  const [status, setStatus] = React.useState('')
  const [startDate, setStartDate] = React.useState('')
  const [endDate, setEndDate] = React.useState('')

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!files || files.length === 0) return

    setStatus('Uploading...')

    const form = new FormData()
    form.append('startDate', startDate)
    form.append('endDate', endDate)
    Array.from(files).forEach(f => form.append('files', f))

    try {
      const res = await fetch('http://localhost:4000/upload', {
        method: 'POST',
        body: form,
      })
      const json = await res.json()
      setStatus(`Uploaded ${json.count} files`)
    } catch (err: any) {
      setStatus('Upload failed')
      console.error(err)
    }
  }

  return (
    <div style={{ fontFamily: 'system-ui', padding: 24 }}>
      <h1>File Uploader</h1>
      <form onSubmit={handleUpload} encType="multipart/form-data">
        <input type="file" multiple onChange={(e) => setFiles(e.target.files)} />
        <input type="date" placeholder="Start Date" name="startDate" onChange={(e) => setStartDate(e.target.value)} />
        <input type="date" placeholder="End Date" name="endDate" onChange={(e) => setEndDate(e.target.value)} />
        <button type="submit">Upload</button>
      </form>
      <p>{status}</p>
    </div>
  )
}

createRoot(document.getElementById('root')!).render(<App />)

