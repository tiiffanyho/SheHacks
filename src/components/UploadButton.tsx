import { useRef } from 'react';

interface UploadButtonProps {
  onFileSelect?: (files: FileList | null) => void;
}

export function UploadButton({ onFileSelect }: UploadButtonProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      onFileSelect?.(files);
    }
  };

  return (
    <div>
      <button
        onClick={handleClick}
        className="w-16 h-16 bg-pink-100 hover:bg-pink-200 rounded-2xl transition-colors duration-200 flex items-center justify-center border-2 border-pink-200"
      >
        <svg 
          width="32" 
          height="32" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          className="text-pink-400"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="17 8 12 3 7 8" />
          <line x1="12" y1="3" x2="12" y2="15" />
        </svg>
      </button>

      <input
        ref={fileInputRef}
        type="file"
        onChange={handleFileChange}
        className="hidden"
        multiple
      />
    </div>
  );
}
