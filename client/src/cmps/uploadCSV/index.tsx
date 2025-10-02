import Button from '@mui/material/Button';
import { useState } from 'react';
import { useLoaderData } from 'react-router';
import { fatch } from '../../utils/fatch';
import './styles.css';
import { IFileOnServer } from '../../../../server/services/file';

type UploadCSVLoaderData = {
  filesOnServer: IFileOnServer[],
}

export const UploadCSV = () => {
  const { filesOnServer }: UploadCSVLoaderData = useLoaderData()
  const [localFilesOnServer, setLocalFilesOnServer] = useState(filesOnServer)
  const [filesToUpload, setFilesToUpload] = useState<FileList | null>(null)

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!filesToUpload || filesToUpload.length === 0) return

    const form = new FormData()
    Array.from(filesToUpload).forEach(f => form.append('files', f))

    try {
      const files = await fatch({
        path: 'uploads',
        method: 'postRaw',
        body: form,
        headers: {}
      })
      setLocalFilesOnServer(files)

    } catch (err: any) {
      console.error(err)
    }
  }

  const handleDeleteCsvs = async () => {
    fatch({ path: 'uploads', method: 'delete', }).then(() => {
      setLocalFilesOnServer([]);
    })
  }

  return (
    <div className='uploadCSV'>
      <form onSubmit={handleUpload} encType="multipart/form-data">
        <div className='buttons'>
          <input type="file" multiple onChange={(e) => setFilesToUpload(e.target.files)} />

          <div className='right'>
            <Button sx={{ width: '100px' }} variant="contained" type="submit">Upload</Button>
            <Button sx={{ width: '100px' }} variant="contained" onClick={handleDeleteCsvs} color="error">Clear</Button>
          </div>
        </div>
      </form>

      {
        localFilesOnServer.length > 0 && (
          <>
            <h3>Uploaded Files</h3>
            <ol>{localFilesOnServer.map((file, index) => <li key={index}>{file.filename}</li>)}</ol>
          </>
        )
      }
    </div >
  )
}