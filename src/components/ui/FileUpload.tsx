import React, { useState } from 'react';
import { Upload, X, FileText, Image, File } from 'lucide-react';

interface FileUploadProps {
  label?: string;
  onChange: (file: File | null) => void;
  accept?: string;
  maxSize?: number; // in MB
  error?: string;
  value?: File | null;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  label,
  onChange,
  accept = 'image/jpeg,image/png,application/pdf',
  maxSize = 5, // Default 5MB
  error,
  value,
}) => {
  const [preview, setPreview] = useState<string | null>(null);
  const [fileType, setFileType] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  
  const handleClick = () => {
    fileInputRef.current?.click();
  };
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      validateAndSetFile(file);
    }
  };
  
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };
  
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      validateAndSetFile(file);
    }
  };
  
  const validateAndSetFile = (file: File) => {
    // Validate file type
    if (!accept.includes(file.type)) {
      setLocalError(`File type not accepted. Please upload ${accept.replace(/,/g, ' or ')}`);
      return;
    }
    
    // Validate file size
    if (file.size > maxSize * 1024 * 1024) {
      setLocalError(`File is too large. Maximum allowed size is ${maxSize}MB`);
      return;
    }
    
    setLocalError(null);
    setFileName(file.name);
    setFileType(file.type);
    
    // Create preview for images
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setPreview(null);
    }
    
    onChange(file);
  };
  
  const handleRemove = () => {
    setPreview(null);
    setFileName(null);
    setFileType(null);
    onChange(null);
    
    // Reset the file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  const getFileIcon = () => {
    if (!fileType) return <Upload size={24} />;
    
    if (fileType.startsWith('image/')) {
      return <Image size={24} />;
    } else if (fileType.includes('pdf')) {
      return <FileText size={24} />;
    } else {
      return <File size={24} />;
    }
  };
  
  const displayError = error || localError;
  
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          {label}
        </label>
      )}
      
      <div 
        className={`
          border-2 border-dashed rounded-lg p-4 flex flex-col items-center justify-center 
          cursor-pointer h-32 transition-colors
          ${dragActive ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20' : 'border-gray-300 dark:border-gray-600 hover:border-emerald-500 dark:hover:border-emerald-500'}
          ${displayError ? 'border-red-300 dark:border-red-600' : ''}
        `}
        onClick={handleClick}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept={accept}
          onChange={handleChange}
        />
        
        {fileName ? (
          <div className="flex flex-col items-center">
            <div className="flex items-center space-x-2 mb-2">
              {getFileIcon()}
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate max-w-[200px]">
                {fileName}
              </span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemove();
                }}
                className="text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400"
              >
                <X size={16} />
              </button>
            </div>
            
            {preview && (
              <div className="w-20 h-20 overflow-hidden rounded-md border border-gray-200 dark:border-gray-700">
                <img src={preview} alt="Preview" className="w-full h-full object-cover" />
              </div>
            )}
          </div>
        ) : (
          <>
            <Upload className="h-8 w-8 text-gray-400 dark:text-gray-500 mb-2" />
            <p className="text-sm text-gray-500 dark:text-gray-400">
              <span className="font-medium text-emerald-600 dark:text-emerald-400">
                Click to upload
              </span>{' '}
              or drag and drop
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {accept.includes('image') ? 'PNG, JPG' : ''} 
              {accept.includes('image') && accept.includes('pdf') ? ' or ' : ''}
              {accept.includes('pdf') ? 'PDF' : ''} 
              {` (max ${maxSize}MB)`}
            </p>
          </>
        )}
      </div>
      
      {displayError && (
        <p className="mt-1 text-sm text-red-600 dark:text-red-400">{displayError}</p>
      )}
    </div>
  );
};