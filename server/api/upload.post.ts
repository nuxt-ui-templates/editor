import { blob } from 'hub:blob'

export default eventHandler(async (event) => {
  return blob.handleUpload(event, {
    formKey: 'file',
    multiple: false,
    ensure: {
      maxSize: '2MB',
      types: ['image']
    },
    put: {
      addRandomSuffix: true
    }
  })
})
