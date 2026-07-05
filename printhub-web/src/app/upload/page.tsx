'use client';

import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/Button';
import { Card, CardBody } from '@/components/ui/Card';
import { generateId, cn } from '@/lib/utils';
import { useCartStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { Upload, FileText, X, ArrowRight, Loader2, Eye } from 'lucide-react';

interface UploadedFile {
  id: string;
  file: File;
  name: string;
  size: number;
  pageCount: number;
  preview?: string;
}

export default function UploadPage() {
  const router = useRouter();
  const { addItem, clearCart } = useCartStore();
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const countPdfPages = (file: File): Promise<number> => {
    return new Promise((resolve) => {
      if (file.type !== 'application/pdf') {
        resolve(1);
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const buffer = reader.result as ArrayBuffer;
          const uint8 = new Uint8Array(buffer);
          const text = new TextDecoder('latin1').decode(uint8);

          const rootPagesMatch = text.match(/\/Type\s*\/Pages[\s\S]*?\/Count\s*(\d+)/);
          if (rootPagesMatch) {
            resolve(parseInt(rootPagesMatch[1], 10));
            return;
          }

          const countMatch = text.match(/\/Count\s*(\d+)\s*[^/]*\/Type\s*\/Pages/);
          if (countMatch) {
            resolve(parseInt(countMatch[1], 10));
            return;
          }

          const pageCount = (text.match(/\/Type\s*\/Page[^s]/g) || []).length;
          if (pageCount > 0) {
            resolve(pageCount);
            return;
          }

          const singleCount = (text.match(/\/Count\s+(\d+)/g) || [])
            .map(m => parseInt(m.match(/\d+/)?.[0] || '1', 10))
            .reduce((a, b) => a + b, 0);
          if (singleCount > 0) {
            resolve(singleCount);
            return;
          }

          resolve(1);
        } catch (e) {
          resolve(1);
        }
      };
      reader.onerror = () => resolve(1);
      reader.readAsArrayBuffer(file);
    });
  };

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    setIsProcessing(true);

    for (const file of acceptedFiles) {
      const pageCount = await countPdfPages(file);
      const uploadedFile: UploadedFile = {
        id: generateId(),
        file,
        name: file.name,
        size: file.size,
        pageCount: pageCount,
      };

      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = () => {
          uploadedFile.preview = reader.result as string;
          setFiles((prev) => [...prev, uploadedFile]);
        };
        reader.readAsDataURL(file);
      } else {
        setFiles((prev) => [...prev, uploadedFile]);
      }
    }

    setIsProcessing(false);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/vnd.ms-powerpoint': ['.ppt'],
      'application/vnd.openxmlformats-officedocument.presentationml.presentation': ['.pptx'],
      'image/*': ['.jpg', '.jpeg', '.png', '.gif'],
      'application/zip': ['.zip'],
    },
    maxSize: 50 * 1024 * 1024, // 50MB
  });

  const removeFile = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const handleContinue = () => {
    if (files.length === 0) {
      toast.error('Please upload at least one file');
      return;
    }

    clearCart();
    files.forEach((f) => {
      addItem({
        id: f.id,
        fileName: f.name,
        fileUrl: f.preview || (typeof window !== 'undefined' ? URL.createObjectURL(f.file) : ''),
        fileType: f.file.type,
        pageCount: f.pageCount,
        copies: 1,
        colorMode: 'BW',
        sides: 'SINGLE',
        paperSize: 'A4',
        gsm: 70,
        binding: 'NONE',
        lamination: false,
      });
    });

    router.push('/configure');
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />

      <div className="container-app py-8">
        <div className="max-w-3xl mx-auto">
          <div className="mb-8">
            <h1 className="font-heading text-3xl font-bold text-secondary mb-2">
              Upload Documents
            </h1>
            <p className="text-slate-600">Drag and drop your files or click to browse</p>
          </div>

          <Card className="mb-6">
            <CardBody className="p-8">
              <div
                {...getRootProps()}
                className={cn(
                  'border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all',
                  isDragActive
                    ? 'border-primary bg-primary-50'
                    : 'border-slate-200 hover:border-primary hover:bg-slate-50'
                )}
              >
                <input {...getInputProps()} />
                <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  {isProcessing ? (
                    <Loader2 className="w-8 h-8 text-primary animate-spin" />
                  ) : (
                    <Upload className="w-8 h-8 text-primary" />
                  )}
                </div>
                {isDragActive ? (
                  <p className="text-primary font-medium">Drop your files here...</p>
                ) : (
                  <>
                    <p className="text-secondary font-medium mb-2">
                      Drag & drop files here
                    </p>
                    <p className="text-sm text-slate-500">
                      PDF, DOC, DOCX, PPT, PPTX, Images, ZIP (Max 50MB)
                    </p>
                  </>
                )}
              </div>
            </CardBody>
          </Card>

          {files.length > 0 && (
            <Card className="mb-6">
              <CardBody>
                <h3 className="font-semibold text-secondary mb-4">
                  Uploaded Files ({files.length})
                </h3>
                <div className="space-y-3">
                  {files.map((file) => (
                    <div
                      key={file.id}
                      className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl"
                    >
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <FileText className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-secondary truncate">{file.name}</p>
                        <p className="text-xs text-slate-500">
                          {formatFileSize(file.size)} | {file.pageCount} pages
                        </p>
                      </div>
                      <button
                        onClick={() => removeFile(file.id)}
                        className="p-2 hover:bg-slate-200 rounded-lg transition"
                      >
                        <X className="w-4 h-4 text-slate-500" />
                      </button>
                    </div>
                  ))}
                </div>
              </CardBody>
            </Card>
          )}

          <div className="flex justify-end gap-3">
            <Button variant="ghost" onClick={() => router.back()}>
              Cancel
            </Button>
            <Button onClick={handleContinue} disabled={files.length === 0}>
              Configure Print Options
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
