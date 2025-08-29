'use client' // ✅ important for Next.js App Router

import React, { useEffect } from 'react'
import { CKEditor } from '@ckeditor/ckeditor5-react'
import ClassicEditor from '@ckeditor/ckeditor5-build-classic'

type Props = {
  value: string
  onChange: (data: string) => void
  settingMode?: string
}

const MyCKEditor: React.FC<Props> = ({ value, onChange, settingMode }) => {
  useEffect(() => {
    let styleElement: HTMLStyleElement | null = null

    if (settingMode === 'dark') {
      styleElement = document.createElement('style')
      styleElement.setAttribute('data-ckeditor-dark', 'true') // helpful for future cleanup

      styleElement.innerHTML = `
      .ck.ck-editor__main > .ck-editor__editable {
        background-color: #30334e !important;
        color: #fff !important;
      }
      .ck.ck-toolbar {
        background-color: #30334e !important;
        border-color: #444 !important;
      }
      .ck.ck-toolbar button.ck-on {
        background-color: #444 !important;
      }
      .ck.ck-toolbar .ck-button {
        color: #ccc !important;
      }
    `
      document.head.appendChild(styleElement)
    }

    // ✅ Clean up on mode change
    return () => {
      if (styleElement) {
        document.head.removeChild(styleElement)
      }
    }
  }, [settingMode])

  return (
    <CKEditor
      editor={ClassicEditor as any}
      data={value}
      config={{
        toolbar: [
          'heading',
          '|',
          'bold',
          'italic',
          'underline',
          'strikethrough',
          '|',
          'link',
          'bulletedList',
          'numberedList',
          'blockQuote',
          '|',
          'insertTable',
          '|',
          'undo',
          'redo'
          // 🚫 Removed: 'imageUpload', 'insertImage', 'mediaEmbed'
        ],
        table: {
          contentToolbar: ['tableColumn', 'tableRow', 'mergeTableCells', 'tableCellProperties', 'tableProperties']
        }
        // removePlugins: ['Image', 'ImageToolbar', 'ImageCaption', 'ImageUpload', 'MediaEmbed']
      }}
      onReady={editor => {
        // Set fixed height
        const editable = editor.ui.getEditableElement()
        if (editable) {
          editable.style.height = '400px'
          // editable.style.borderRadius = '8px'
        }
      }}
      onChange={(_, editor) => {
        const data = editor.getData()
        onChange(data)
      }}
    />
  )
}

export default MyCKEditor
