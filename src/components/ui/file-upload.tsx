
import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Upload, File, X, Loader2, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface FileUploadProps {
  onFileSelect: (files: File[]) => void;
  accept?: Record<string, string[]>;
  maxFiles?: number;
  disabled?: boolean;
  onUploadComplete?: (uploadedFiles: UploadedFile[]) => void;
}

interface UploadedFile {
  name: string;
  url: string;
  fileId: string;
  mimeType: string;
}

export function FileUpload({ 
  onFileSelect, 
  accept = {
    'image/*': ['.jpeg', '.jpg', '.png'],
    'application/pdf': ['.pdf']
  },
  maxFiles = 5,
  disabled = false,
  onUploadComplete
}: FileUploadProps) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [uploadProgress, setUploadProgress] = useState<Record<string, boolean>>({});

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

  const uploadToGoogleDrive = async (file: File): Promise<UploadedFile> => {
    const folderId = '1hv-RZ1JvRSPgQmbRUUNTngNVQhiQCZaB'; // Target folder ID
    
    // Convert file to base64
    const fileContent = await new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        resolve(result.split(',')[1]); // Remove data:... prefix
      };
      reader.readAsDataURL(file);
    });

    const { data, error } = await supabase.functions.invoke('upload-to-drive', {
      body: {
        fileName: file.name,
        fileContent,
        mimeType: file.type,
        folderId
      }
    });

    if (error) {
      throw new Error(error.message);
    }

    if (!data.success) {
      throw new Error(data.error || 'Upload failed');
    }

    return {
      name: data.fileName,
      url: data.webViewLink,
      fileId: data.fileId,
      mimeType: file.type
    };
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) {
      toast.error('Pilih file terlebih dahulu');
      return;
    }

    const newUploadProgress: Record<string, boolean> = {};
    selectedFiles.forEach(file => {
      newUploadProgress[file.name] = true;
    });
    setUploadProgress(newUploadProgress);

    try {
      const uploadPromises = selectedFiles.map(async (file) => {
        try {
          const uploadedFile = await uploadToGoogleDrive(file);
          setUploadProgress(prev => ({ ...prev, [file.name]: false }));
          return uploadedFile;
        } catch (error) {
          setUploadProgress(prev => ({ ...prev, [file.name]: false }));
          console.error(`Error uploading ${file.name}:`, error);
          toast.error(`Gagal mengupload ${file.name}`);
          throw error;
        }
      });

      const results = await Promise.all(uploadPromises);
      const newUploadedFiles = [...uploadedFiles, ...results];
      setUploadedFiles(newUploadedFiles);
      setSelectedFiles([]);
      setUploadProgress({});
      
      toast.success(`${results.length} file berhasil diupload ke Google Drive`);
      
      if (onUploadComplete) {
        onUploadComplete(newUploadedFiles);
      }
    } catch (error) {
      console.error('Upload error:', error);
      setUploadProgress({});
    }
  };

  const removeSelectedFile = (index: number) => {
    const newFiles = selectedFiles.filter((_, i) => i !== index);
    setSelectedFiles(newFiles);
    onFileSelect(newFiles);
  };

  const removeUploadedFile = (index: number) => {
    const newUploadedFiles = uploadedFiles.filter((_, i) => i !== index);
    setUploadedFiles(newUploadedFiles);
    if (onUploadComplete) {
      onUploadComplete(newUploadedFiles);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const isUploading = Object.values(uploadProgress).some(Boolean);

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
              ${disabled || isUploading ? 'opacity-50 cursor-not-allowed' : 'hover:border-blue-400 hover:bg-blue-50'}
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
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">File yang dipilih:</Label>
                <Button
                  type="button"
                  onClick={handleUpload}
                  disabled={disabled || isUploading}
                  size="sm"
                >
                  {isUploading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {isUploading ? 'Mengupload...' : 'Upload ke Google Drive'}
                </Button>
              </div>
              {selectedFiles.map((file, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <div className="flex items-center space-x-2">
                    {uploadProgress[file.name] ? (
                      <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
                    ) : (
                      <File className="h-4 w-4 text-gray-500" />
                    )}
                    <div>
                      <p className="text-sm font-medium">{file.name}</p>
                      <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeSelectedFile(index)}
                    disabled={disabled || uploadProgress[file.name]}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          {uploadedFiles.length > 0 && (
            <div className="mt-4 space-y-2">
              <Label className="text-sm font-medium text-green-700">File berhasil diupload:</Label>
              {uploadedFiles.map((file, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-green-50 rounded border border-green-200">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <div>
                      <p className="text-sm font-medium text-green-800">{file.name}</p>
                      <a 
                        href={file.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-xs text-blue-600 hover:underline"
                      >
                        Lihat di Google Drive
                      </a>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeUploadedFile(index)}
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
