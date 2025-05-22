
import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { FileUpload } from "@/types/pendataan";
import { Upload, File, X, Image } from "lucide-react";
import { useDropzone } from "react-dropzone";

// Zod schema for form validation
const formSchema = z.object({
  desa_id: z.string({
    required_error: "Silahkan pilih desa",
  }),
  judul: z.string().min(3, {
    message: "Judul dokumen minimal 3 karakter",
  }),
  jenis: z.enum(["foto", "dokumen"], {
    required_error: "Silahkan pilih jenis dokumen",
  }),
  catatan: z.string().optional(),
});

// Mock data for demonstration
const mockDesa = [
  { id: "desa-1", nama: "Desa Cidahu" },
  { id: "desa-2", nama: "Desa Sukamaju" },
  { id: "desa-3", nama: "Desa Cibunar" },
  { id: "desa-4", nama: "Desa Buniseuri" },
];

export default function DocumentUploadPage() {
  const navigate = useNavigate();
  const [files, setFiles] = useState<FileUpload[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      judul: "",
      catatan: "",
    },
  });
  
  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles = acceptedFiles.map(file => {
      // Check file type
      const isImage = file.type.startsWith('image/');
      const isPdf = file.type === 'application/pdf';
      const isDocx = file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
      
      // Validate file type
      if (!isImage && !isPdf && !isDocx) {
        toast.error(`File ${file.name} tidak didukung. Gunakan format JPG, PNG, PDF, atau DOCX.`);
        return null;
      }
      
      // Validate file size
      const maxSize = isImage ? 5 * 1024 * 1024 : 10 * 1024 * 1024; // 5MB for images, 10MB for documents
      if (file.size > maxSize) {
        const maxSizeMB = maxSize / (1024 * 1024);
        toast.error(`File ${file.name} terlalu besar. Maksimal ${maxSizeMB}MB.`);
        return null;
      }
      
      return {
        file,
        progress: 0,
      };
    }).filter(Boolean) as FileUpload[];
    
    setFiles(prev => [...prev, ...newFiles]);
  }, []);
  
  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png'],
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
    },
  });
  
  const removeFile = (index: number) => {
    setFiles(files => files.filter((_, i) => i !== index));
  };
  
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (files.length === 0) {
      toast.error("Silahkan pilih file yang akan diunggah");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Simulate file upload with progress
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        // Simulate progress updates
        for (let progress = 0; progress <= 100; progress += 10) {
          await new Promise(resolve => setTimeout(resolve, 100));
          setFiles(prev => 
            prev.map((f, idx) => 
              idx === i ? { ...f, progress } : f
            )
          );
        }
      }
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success("Dokumen berhasil diunggah");
      navigate("/pendataan");
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Gagal mengunggah dokumen");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) {
      return <Image className="h-5 w-5" />;
    }
    
    if (file.type === 'application/pdf') {
      return <File className="h-5 w-5" />;
    }
    
    return <File className="h-5 w-5" />;
  };
  
  const getFilePreview = (file: File) => {
    if (file.type.startsWith('image/')) {
      return URL.createObjectURL(file);
    }
    return null;
  };

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">Unggah Dokumen</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Formulir Unggah Dokumen</CardTitle>
          <CardDescription>Unggah dokumen pendataan potensi desa</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="desa_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Desa</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih desa" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {mockDesa.map(desa => (
                          <SelectItem key={desa.id} value={desa.id}>
                            {desa.nama}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Pilih desa tempat dokumen ini berlaku
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="judul"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Judul Dokumen</FormLabel>
                    <FormControl>
                      <Input placeholder="Masukkan judul dokumen" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="jenis"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Jenis Dokumen</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih jenis dokumen" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="foto">Foto</SelectItem>
                        <SelectItem value="dokumen">Dokumen</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Foto: JPG, PNG (maks. 5MB) | Dokumen: PDF, DOCX (maks. 10MB)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="catatan"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Catatan</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Masukkan catatan tambahan (opsional)" 
                        className="min-h-[100px]"
                        {...field} 
                      />
                    </FormControl>
                    <FormDescription>
                      Catatan atau informasi tambahan tentang dokumen
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="space-y-2">
                <FormLabel>Unggah File</FormLabel>
                <div
                  {...getRootProps()}
                  className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                    isDragActive ? "border-orange-500 bg-orange-50" : "border-gray-300 hover:border-orange-400 hover:bg-orange-50"
                  }`}
                >
                  <input {...getInputProps()} />
                  <div className="flex flex-col items-center justify-center space-y-2">
                    <Upload className="h-10 w-10 text-orange-500" />
                    <p className="text-sm font-medium">
                      {isDragActive
                        ? "Letakkan file di sini"
                        : "Klik atau seret file ke area ini untuk mengunggah"}
                    </p>
                    <p className="text-xs text-gray-500">
                      Foto: JPG, PNG (maks. 5MB) | Dokumen: PDF, DOCX (maks. 10MB)
                    </p>
                  </div>
                </div>
                
                {files.length > 0 && (
                  <div className="mt-4 space-y-2">
                    <p className="text-sm font-medium">File yang akan diunggah</p>
                    <div className="space-y-2">
                      {files.map((fileUpload, index) => (
                        <div key={index} className="flex items-center justify-between p-3 border rounded-md bg-gray-50">
                          <div className="flex items-center space-x-3">
                            <div className="flex-shrink-0">
                              {getFileIcon(fileUpload.file)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">
                                {fileUpload.file.name}
                              </p>
                              <p className="text-xs text-gray-500">
                                {(fileUpload.file.size / 1024 / 1024).toFixed(2)} MB
                              </p>
                            </div>
                            {fileUpload.progress > 0 && fileUpload.progress < 100 && (
                              <div className="w-16">
                                <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
                                  <div 
                                    className="h-full bg-orange-500 rounded-full" 
                                    style={{ width: `${fileUpload.progress}%` }}
                                  />
                                </div>
                                <p className="text-xs text-gray-500 text-center mt-1">
                                  {fileUpload.progress}%
                                </p>
                              </div>
                            )}
                          </div>
                          
                          {!isSubmitting && (
                            <Button 
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeFile(index)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          )}
                          
                          {fileUpload.file.type.startsWith('image/') && getFilePreview(fileUpload.file) && (
                            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 hidden group-hover:flex">
                              <img 
                                src={getFilePreview(fileUpload.file)} 
                                alt="Preview" 
                                className="max-w-[90%] max-h-[90%]" 
                              />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => navigate("/pendataan")}
                  disabled={isSubmitting}
                >
                  Batal
                </Button>
                <Button 
                  type="submit" 
                  className="bg-orange-500 hover:bg-orange-600"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Mengunggah..." : "Unggah Dokumen"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
