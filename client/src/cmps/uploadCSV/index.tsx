import { useState } from 'react'
import './styles.css'
import Button from '@mui/material/Button';
import { fatch } from '../../utils/fatch';
import { IFileOnServer } from '../../../../server/constants';
import { useLoaderData } from 'react-router';

type UploadCSVLoaderData = {
  filesOnServer: IFileOnServer[],
}

export const UploadCSV = () => {
  const { filesOnServer }: UploadCSVLoaderData = useLoaderData()
  const [filesToUpload, setFilesToUpload] = useState<FileList | null>(null)

  console.count('render UploadCSV')
  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!filesToUpload || filesToUpload.length === 0) return

    const form = new FormData()
    Array.from(filesToUpload).forEach(f => form.append('files', f))

    try {
      const res = await fatch({
        path: 'uploads',
        method: 'postRaw',
        body: form,
        headers: {}
      })

    } catch (err: any) {
      console.error(err)
    }
  }

  const handleDeleteCsvs = async () => {
    fatch({ path: 'uploads', method: 'delete', }).then((status200) => {
      console.warn('add reactivity and error handling')
    })
  }

  return (
    <div className='uploadCSV'>
      <form onSubmit={handleUpload} encType="multipart/form-data">
        <div>
          <input type="file" multiple onChange={(e) => setFilesToUpload(e.target.files)} />
          <p>{status}</p>
        </div>

        <div>
          <Button sx={{ width: '100px' }} variant="contained" type="submit">Upload</Button>
        </div>
      </form>

      <Button sx={{ width: '100px' }} variant="contained" onClick={handleDeleteCsvs} color="error">Clear</Button>

      {
        filesOnServer.length > 0 && (
          <>
            <h3>Uploaded Files</h3>
            <ol>{filesOnServer.map((file, index) => <li key={index}>{file.filename}</li>)}</ol>
          </>
        )
      }
    </div >
  )
}