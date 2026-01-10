import { UploadButton } from '../components/UploadButton';

// Then in your component:
<UploadButton onFileSelect={(files) => {
  // Handle the files here
  console.log(files);
}} />