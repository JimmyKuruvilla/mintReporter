import { useState } from 'react'
import './styles.css'
import Button from '@mui/material/Button';
import { fatch } from '../../utils/fatch';

export const UploadCSV = () => {
  const [files, setFiles] = useState<FileList | null>(null)
  const [status, setStatus] = useState('')

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!files || files.length === 0) return

    setStatus('Uploading...')

    const form = new FormData()
    Array.from(files).forEach(f => form.append('files', f))

    try {
      const res = await fatch({
        path: 'upload',
        method: 'postRaw',
        body: form,
        headers: {}
      })

      setStatus(`Uploaded ${res.count} files`)
    } catch (err: any) {
      setStatus('Upload failed')
      console.error(err)
    }
  }

  const handleDeleteCsvs = async () => {
    setFiles(null)
    fatch({ path: 'inputs', method: 'delete', }).then((status200) => {
      console.warn('add reactivity and error handling')
    })
  }

  return (
    <div className='uploadCSV'>
      <form onSubmit={handleUpload} encType="multipart/form-data">
        <div>
          <input type="file" multiple onChange={(e) => setFiles(e.target.files)} />
          <p>{status}</p>
        </div>

        <div>
          <Button variant="contained" type="submit">Upload</Button>
        </div>

      </form>

      <Button variant="contained" onClick={handleDeleteCsvs}>Delete All</Button>

    </div>
  )
}