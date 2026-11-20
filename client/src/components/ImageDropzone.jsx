import { useEffect, useRef, useState } from "react";

const MAX_BYTES = 5 * 1024 * 1024;

/**
 * Drag-and-drop image picker with live previews.
 * Controlled: `files` is an array of File, `onChange(files)` gets the new array.
 */
function ImageDropzone({ files, onChange, onError, max = 5, label }) {
    const inputRef = useRef(null);
    const [dragging, setDragging] = useState(false);
    const [previews, setPreviews] = useState([]);

    useEffect(() => {
        const urls = files.map((file) => URL.createObjectURL(file));
        setPreviews(urls);
        return () => urls.forEach((url) => URL.revokeObjectURL(url));
    }, [files]);

    function addFiles(list) {
        const incoming = Array.from(list || []);
        if (!incoming.length) return;
        onError?.("");

        if (incoming.some((file) => !file.type.startsWith("image/"))) {
            onError?.("Please choose image files only.");
            return;
        }
        if (incoming.some((file) => file.size > MAX_BYTES)) {
            onError?.("Each image must be 5 MB or smaller.");
            return;
        }
        if (files.length + incoming.length > max) {
            onError?.(`You can add up to ${max} images.`);
            return;
        }
        onChange([...files, ...incoming]);
    }

    function remove(index) {
        onError?.("");
        onChange(files.filter((_, i) => i !== index));
    }

    function makeMain(index) {
        if (index === 0) return;
        const next = [...files];
        const [picked] = next.splice(index, 1);
        next.unshift(picked);
        onChange(next);
    }

    return (
        <div className="dz">
            {label && <span className="dz-label">{label}</span>}

            <div
                className={`dz-area ${dragging ? "dragging" : ""}`}
                onClick={() => inputRef.current?.click()}
                onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        inputRef.current?.click();
                    }
                }}
                onDragOver={(e) => {
                    e.preventDefault();
                    setDragging(true);
                }}
                onDragLeave={() => setDragging(false)}
                onDrop={(e) => {
                    e.preventDefault();
                    setDragging(false);
                    addFiles(e.dataTransfer.files);
                }}
                role="button"
                tabIndex={0}
            >
                <svg viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="currentColor" strokeWidth="1.2" aria-hidden="true">
                    <path d="M12 16V5M7.5 9.5 12 5l4.5 4.5M4 15v4.5h16V15" />
                </svg>
                <strong>Drag photos here, or click to browse</strong>
                <span>
                    Up to {max} images · JPG, PNG or WebP · 5 MB each
                </span>
                <input
                    ref={inputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    hidden
                    onChange={(e) => {
                        addFiles(e.target.files);
                        e.target.value = "";
                    }}
                />
            </div>

            {previews.length > 0 && (
                <ul className="dz-grid">
                    {previews.map((src, index) => (
                        <li key={src}>
                            <img src={src} alt={`Upload ${index + 1}`} />
                            {index === 0 ? (
                                <span className="dz-main">Main</span>
                            ) : (
                                <button
                                    type="button"
                                    className="dz-make-main"
                                    onClick={() => makeMain(index)}
                                >
                                    Make main
                                </button>
                            )}
                            <button
                                type="button"
                                className="dz-remove"
                                onClick={() => remove(index)}
                                aria-label={`Remove image ${index + 1}`}
                            >
                                ×
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

export default ImageDropzone;
