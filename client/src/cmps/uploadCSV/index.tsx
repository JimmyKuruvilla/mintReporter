import { useContext, useState } from 'react'
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { GlobalContext } from '../../contexts/global';
import Button from '@mui/material/Button';

export const UploadCSV = () => {
  const { ctx, setCtx } = useContext(GlobalContext)
  const [files, setFiles] = useState<FileList | null>(null)
  const [status, setStatus] = useState('')
  const [startDate, setStartDate] = useState(ctx.uploadStartDate)
  const [endDate, setEndDate] = useState(ctx.uploadEndDate)

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!files || files.length === 0) return

    setStatus('Uploading...')

    const form = new FormData()
    form.append('startDate', startDate.format('YYYY-MM-DD'))
    form.append('endDate', endDate.format('YYYY-MM-DD'))
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

  const handleSetStartDate = (pickedDate: any) => {
    setStartDate(pickedDate)
    setCtx({ ...ctx, uploadStartDate: pickedDate })
  }

  const handleSetEndDate = (pickedDate: any) => {
    setEndDate(pickedDate)
    setCtx({ ...ctx, uploadEndDate: pickedDate })
  }

  return (
    <div className='uploadCSV'>
      <form onSubmit={handleUpload} encType="multipart/form-data">
        <input type="file" multiple onChange={(e) => setFiles(e.target.files)} />
        <DatePicker defaultValue={ctx.uploadStartDate} onChange={handleSetStartDate}></DatePicker>
        <DatePicker defaultValue={ctx.uploadEndDate} onChange={handleSetEndDate}></DatePicker>
        <Button variant="contained" type="submit">Upload</Button>
      </form>
      <p>{status}</p>
    </div>
  )
}