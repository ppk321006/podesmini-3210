
import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Upload, File, X, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface FileUploadProps {
  onFileSelect: (files: File[]) => void;
  accept?: Record<string, string[]>;
  maxFiles?: number;
  disabled?: boolean;
}

export function FileUpload({ 
  onFileSelect, 
  accept = {
    'image/*': ['.jpeg', '.jpg', '.png'],
    'application/pdf': ['.pdf']
  },
  maxFiles = 5,
  disabled = false
}: FileUploadProps) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > maxFiles) {
      toast.error(`Maksimal ${maxFiles} file dapat dipilih`);
      return;
    }

    // Check file size (max 10MB per file)
    const oversizedFiles = acceptedFiles.filter(file => file.size > 10 * 1024 * 1024);
    if (oversizedFiles.length > 0) {
      toast.error('Ukuran file tidak boleh lebih dari 10MB');
      return;
    }

    setSelectedFiles(acceptedFiles);
    onFileSelect(acceptedFiles);
  }, [onFileSelect, maxFiles]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept,
    maxFiles,
    disabled
  });

  const removeFile = (index: number) => {
    const newFiles = selectedFiles.filter((_, i) => i !== index);
    setSelectedFiles(newFiles);
    onFileSelect(newFiles);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-4">
      <Label>Upload Dokumentasi/Foto</Label>
      <Card>
        <CardContent className="p-4">
          <div
            {...getRootProps()}
            className={`
              border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
              ${isDragActive ? 'border-blue-400 bg-blue-50' : 'border-gray-300'}
              ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-blue-400 hover:bg-blue-50'}
            `}
          >
            <input {...getInputProps()} />
            <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            {isDragActive ? (
              <p className="text-blue-600">Lepaskan file di sini...</p>
            ) : (
              <div>
                <p className="text-gray-600 mb-2">
                  Drag & drop file atau klik untuk memilih
                </p>
                <p className="text-sm text-gray-500">
                  Mendukung JPG, PNG, PDF (Maks. 10MB per file)
                </p>
              </div>
            )}
          </div>

          {selectedFiles.length > 0 && (
            <div className="mt-4 space-y-2">
              <Label className="text-sm font-medium">File yang dipilih:</Label>
              {selectedFiles.map((file, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <div className="flex items-center space-x-2">
                    <File className="h-4 w-4 text-gray-500" />
                    <div>
                      <p className="text-sm font-medium">{file.name}</p>
                      <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFile(index)}
                    disabled={disabled}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
