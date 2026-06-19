import { useState } from "react";

interface ResumeDropzoneProps {
  file: File | null;
  onChange: (file: File | null) => void;
  label?: string;
}

export default function ResumeDropzone({
  file,
  onChange,
  label = "Drag & drop your resume, or click to browse",
}: ResumeDropzoneProps) {
  const [dragOver, setDragOver] = useState(false);

  return (
    <label
      className={
        "dropzone" +
        (dragOver ? " dropzone--dragover" : "") +
        (file ? " dropzone--has-file" : "")
      }
      onDragOver={(e) => {
        e.preventDefault();
        setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragOver(false);
        const dropped = e.dataTransfer.files?.[0];
        if (dropped) onChange(dropped);
      }}
    >
      <span className="dropzone__icon">{file ? "✅" : "📄"}</span>
      <div className="dropzone__label">{file ? "File ready" : label}</div>
      <div className="dropzone__sublabel">PDF only, max 10MB</div>
      {file && <div className="dropzone__filename">{file.name}</div>}
      <input
        type="file"
        accept=".pdf"
        onChange={(e) => onChange(e.target.files?.[0] ?? null)}
      />
    </label>
  );
}
