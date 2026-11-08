// ============================================================
// Zero-Cost Photo Storage & Optimization Engine
// Compresses camera/upload photos to lightweight Base64 thumbnails (~30-60KB)
// Stores directly inside Cloud Firestore (100% Free - $0, No Blaze required)
// ============================================================

export const compressAndFormatImage = (dataUrlOrFile, maxWidth = 800, quality = 0.72) => {
  return new Promise((resolve, reject) => {
    // If already clean string
    if (typeof dataUrlOrFile === 'string' && dataUrlOrFile.startsWith('data:image')) {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        // Compressed JPEG dataUrl
        const compressed = canvas.toDataURL('image/jpeg', quality);
        resolve(compressed);
      };
      img.onerror = () => resolve(dataUrlOrFile);
      img.src = dataUrlOrFile;
      return;
    }

    // If File/Blob
    if (dataUrlOrFile instanceof Blob || dataUrlOrFile instanceof File) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          const compressed = canvas.toDataURL('image/jpeg', quality);
          resolve(compressed);
        };
        img.onerror = () => resolve(e.target.result);
        img.src = e.target.result;
      };
      reader.onerror = (err) => reject(err);
      reader.readAsDataURL(dataUrlOrFile);
      return;
    }

    resolve(dataUrlOrFile);
  });
};

