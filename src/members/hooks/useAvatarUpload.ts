import { useState } from "react";

interface UseAvatarUploadOptions {
  initialUrl?: string | null;
}

export function useAvatarUpload({ initialUrl = null }: UseAvatarUploadOptions = {}) {
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(initialUrl);

  const selectFile = (file: File) => {
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const clear = () => {
    setAvatarFile(null);
    setAvatarPreview(null);
  };

  const toBase64 = async (): Promise<string> => {
    if (!avatarFile) throw new Error("No avatar file selected");
    const reader = new FileReader();
    return new Promise<string>((resolve) => {
      reader.onload = () => resolve(reader.result as string);
      reader.readAsDataURL(avatarFile);
    });
  };

  return { avatarFile, avatarPreview, selectFile, clear, toBase64 };
}
