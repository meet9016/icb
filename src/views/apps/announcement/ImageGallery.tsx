// React Imports
import { useEffect, useRef, useState } from 'react'

import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogContentText from '@mui/material/DialogContentText'
import type { DialogProps } from '@mui/material/Dialog'

// Third-party Imports
import classnames from 'classnames'
import { Button, Card, CardMedia, Grid, IconButton, Typography } from '@mui/material'

type ConfirmationDialogProps = {
  open: boolean
  setOpen: (open: boolean) => void
  images?: string[] // Optional prop for images
}
const ImageGallery = ({ open, setOpen, images }: ConfirmationDialogProps) => {
  // States
  // const [open, setOpen] = useState<boolean>(false)

  const [scroll, setScroll] = useState<DialogProps['scroll']>('paper')
  const [openPdf, setOpenPdf] = useState(false)
  const [selectedPdfUrl, setSelectedPdfUrl] = useState('')
  // Refs
  const descriptionElementRef = useRef<HTMLElement>(null)
  const extension = selectedPdfUrl.split('.').pop()

  const handleClickOpen = (scrollType: DialogProps['scroll']) => () => {
    setOpen(true)
    setScroll(scrollType)
  }

  const handleClose = () => setOpen(false)

  useEffect(() => {
    if (open) {
      const { current: descriptionElement } = descriptionElementRef

      if (descriptionElement !== null) {
        descriptionElement.focus()
      }
    }
  }, [open])

  return (
    <div className="flex gap-4">
      <Dialog
        open={open}
        scroll={scroll}
        onClose={handleClose}
        aria-labelledby="scroll-dialog-title"
        aria-describedby="scroll-dialog-description"
        closeAfterTransition={false}
      >
        <DialogTitle id="scroll-dialog-title">Documents</DialogTitle>

        <IconButton
          onClick={handleClose}
          style={{ position: 'absolute', top: 10, right: 10, zIndex: 10 }}
        >
          <i className="ri-close-line text-xl" />
        </IconButton>
        <DialogContent dividers={scroll === 'paper'}>
          <DialogContentText id="scroll-dialog-description" tabIndex={-1}>
            {/* Grid to handle the layout of images */}
            <Grid container spacing={2}>
              {images?.map((image: any, index) => {
                const isPdf = image.file_url.endsWith('.pdf');
                const isVideo = image.file_url.endsWith('.mp4');
                const isDoc = image.file_url.endsWith('.doc');

                return (
                  <Grid item xs={4} key={index}>
                    <Card>
                      {isPdf ? (
                        // 👉 PDF Preview
                        <div
                          style={{ position: 'relative', height: '150px', cursor: 'pointer' }}
                          onClick={() => {
                            setSelectedPdfUrl(image.file_url)
                            setOpenPdf(true)
                          }}
                        >
                          <iframe
                            src={image.file_url}
                            width="100%"
                            height="150"
                            style={{
                              borderRadius: '10px',
                              // marginBottom: '8px',
                              border: 'none',
                              pointerEvents: 'none'
                            }}
                            title={`PDF ${index + 1}`}
                            allow="fullscreen"
                          />
                        </div>
                      ) : isVideo ? (
                         <div
                          style={{ position: 'relative', cursor: 'pointer' }}
                          onClick={() => {
                            setSelectedPdfUrl(image.file_url)
                            setOpenPdf(true)
                          }}
                        >
                        <iframe
                          src={image.file_url}
                          width="100%"
                          height="150"
                          style={{
                            borderRadius: '10px',
                            // marginBottom: '8px',
                            border: 'none',
                            pointerEvents: 'none'
                          }}
                          title={`Video ${index + 1}`}
                           allow="fullscreen"
                        />
                        </div>
                      ) : isDoc ? (
                          <div
                            style={{ position: 'relative', cursor: 'pointer', textAlign: 'center' }}
                            onClick={() => {
                              setSelectedPdfUrl(image.file_url)
                              setOpenPdf(true)
                            }}
                          >
                           <CardMedia
                              component="img"
                              image="/icons/word-file-icon.png"
                              alt="Word File"
                              sx={{
                                height: 150,
                                width: 120,
                                objectFit: 'contain',
                                borderRadius: '10px',
                                margin: '0 auto'
                              }}
                            />
                            <Button
                              size="small"
                              onClick={() => window.open(image.file_url, '_blank')}
                            >
                              View Word File
                            </Button>
                            
                            <Typography variant="body2" mt={1}>
                              {/* {file.name || file.file_path?.split('/').pop()} */}
                            </Typography>
                          </div>
                      ) : (
                        <div
                          style={{ position: 'relative', cursor: 'pointer' }}
                          onClick={() => {
                            setSelectedPdfUrl(image.file_url)
                            setOpenPdf(true)
                          }}
                        >
                          <CardMedia
                            component="img"
                            image={image.file_url}
                            alt={`Image ${index + 1}`}
                            sx={{
                              height: 150,
                              width: 250,
                              objectFit: 'cover',
                              borderRadius: '10px'
                            }}
                          />
                        </div>
                      )}
                    </Card>
                  </Grid>
                );
              })}
            </Grid>
          </DialogContentText>
        </DialogContent>

      </Dialog>

      {openPdf &&
        <Dialog open={openPdf} onClose={() => setOpenPdf(false)} fullWidth maxWidth="md">
          <DialogContent>
            {/* <div style={{ position: 'relative', height: '80vh' }}>
              <iframe
                src={selectedPdfUrl}
                width="100%"
                height="100%"
                style={{ border: 'none' }}
                title="Full PDF"
                allow="fullscreen"
              />
              <IconButton
                onClick={() => setOpenPdf(false)}
                style={{ position: 'absolute', top: 10, right: 10, zIndex: 10 }}
              >
                <i className="ri-close-line text-xl" />
              </IconButton>
              
            </div> */}
            <FilePreview
              fileUrl={selectedPdfUrl}
              fileType={extension ?? ''}
              onClose={() => setOpenPdf(false)}
            />
          </DialogContent>
        </Dialog>
      }
    </div>
  )
}

export default ImageGallery

const FilePreview = ({ fileUrl, fileType, onClose }: { fileUrl: string, fileType: string, onClose: () => void }) => {
  const isImage = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(fileType.toLowerCase())
  const isVideo = fileType.startsWith('mp4') || fileType.startsWith('mp3')
  const isPdf = fileType === 'pdf'
  const isDoc = fileType === 'doc'

  return (
    <div style={{ position: 'relative', height: '80vh', width: '100%' }}>
      {/* PDF */}
      {isPdf && (
        <iframe
          src={fileUrl}
          width="100%"
          height="100%"
          style={{ border: 'none' }}
          title="PDF Viewer"
          allow="fullscreen"
        />
      )}
      {/* Doc */}
      {isDoc && (
        <iframe
          src={fileUrl}
          width="100%"
          height="100%"
          style={{ border: 'none' }}
          title="Doc Viewer"
          allow="fullscreen"
        />
      )}

      {/* Video */}
      {isVideo && (
        <video
          src={fileUrl}
          width="100%"
          height="100%"
          controls
          style={{ objectFit: 'cover', borderRadius: '8px' }}
        />
      )}

      {/* Image */}
      {isImage && (
        <img
          src={fileUrl}
          alt="Preview"
          style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: '8px' }}
        />
      )}

      {/* Close button */}
      <IconButton
        onClick={onClose}
        style={{ position: 'absolute', top: 10, right: 10, zIndex: 10, backgroundColor: '#fff' }}
      >
        <i className="ri-close-line text-xl" />
      </IconButton>
    </div>
  )
}