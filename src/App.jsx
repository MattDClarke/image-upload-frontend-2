import { useCallback, useEffect, useRef, useState } from 'react';
import './App.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    return () => {
      // Cleanup file reference on unmount
      setFile(null);
    };
  }, []);

  const notify = (message) => toast(message);

  const resetFileInput = () => {
    setFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSelectFile = (e) => {
    const selectedFile = e.target.files && e.target.files[0];
    if (!selectedFile) return;

    // Client-side validation for UX only. Server MUST validate file type and size.
    const maxSize = 20 * 1024 * 1024; // maximum image upload file size = 20 MB
    const isImage = selectedFile.type && selectedFile.type.startsWith("image/");
    const validExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];
    const fileExtension = selectedFile.name.toLowerCase().match(/\.[^.]*$/);
    const hasValidExtension = fileExtension && validExtensions.includes(fileExtension[0]);
    if (!isImage || !hasValidExtension) {
      notify("Please select an image file");
      resetFileInput();
      return;
    }
    if (selectedFile.size > maxSize) {
      notify("Image too large! Maximum size is 20MB");
      resetFileInput();
      return;
    }

    setFile(selectedFile);
  };

  const handleUpload = useCallback(async () => {
    if (!file || loading) return;
    try {
      setLoading(true);
      const data = new FormData();
      data.append("my_file", file);
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
      const response = await fetch(`${API_URL}/upload`, {
        method: "POST",
        body: data,
      });
      if (!response.ok) {
        notify("Upload failed: please try again.");
        throw new Error("Upload failed: please try again.");
      }
      // Reset file input after successful upload
      resetFileInput();
      notify('Upload successful!');
    } catch (error) {
      const userMessage = error instanceof TypeError
      ? 'Network error. Please check your connection and try again.'
      : 'An error occurred during upload. Please try again.';
      notify(userMessage);
    } finally {
      setLoading(false);
    }
  }, [file, loading]);

  return (
    <div className="App">
      <label htmlFor="file" className="btn-grey">
        {" "}
        select file
      </label>
      <input
        id="file"
        type="file"
        onChange={handleSelectFile}
        multiple={false}
        accept="image/*"
        aria-label="Select an image file to upload"
        ref={fileInputRef}
      />
      {file && (
          <button onClick={handleUpload} className="btn-green" disabled={loading}>
            {loading ? "uploading..." : "upload to cloudinary"}
          </button>
      )}
      <ToastContainer />
    </div>
  );
}
export default App;