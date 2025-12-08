import React, { useCallback } from 'react';
import { useDropzone, Accept } from 'react-dropzone';
import { Upload, File, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface FileDropzoneProps {
  onFileSelect: (file: File) => void;
  accept?: Accept;
  maxSize?: number;
  selectedFile?: File | null;
  onClear?: () => void;
  label?: string;
  description?: string;
  className?: string;
}

const FileDropzone: React.FC<FileDropzoneProps> = ({
  onFileSelect,
  accept,
  maxSize = 50 * 1024 * 1024, // 50MB default
  selectedFile,
  onClear,
  label = 'Drop file here or click to browse',
  description = 'Supported formats based on note type',
  className,
}) => {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        onFileSelect(acceptedFiles[0]);
      }
    },
    [onFileSelect]
  );

  const { getRootProps, getInputProps, isDragActive, fileRejections } = useDropzone({
    onDrop,
    accept,
    maxSize,
    multiple: false,
  });

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  if (selectedFile) {
    return (
      <div className={cn('p-4 rounded-lg border border-border bg-card', className)}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <File className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="font-medium text-sm truncate max-w-[200px]">{selectedFile.name}</p>
              <p className="text-xs text-muted-foreground">{formatFileSize(selectedFile.size)}</p>
            </div>
          </div>
          {onClear && (
            <Button variant="ghost" size="icon" onClick={onClear}>
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      {...getRootProps()}
      className={cn(
        'relative border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all',
        isDragActive
          ? 'border-primary bg-primary/5'
          : 'border-border hover:border-primary/50 hover:bg-muted/50',
        className
      )}
    >
      <input {...getInputProps()} />
      <div className="flex flex-col items-center gap-2">
        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
          <Upload className="h-6 w-6 text-primary" />
        </div>
        <p className="font-medium">{isDragActive ? 'Drop the file here' : label}</p>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      {fileRejections.length > 0 && (
        <p className="text-sm text-destructive mt-2">
          {fileRejections[0].errors[0].message}
        </p>
      )}
    </div>
  );
};

export default FileDropzone;
