'use client';

import { ChangeEvent, useState } from 'react';

export function MediaPicker() {
  const [preview, setPreview] = useState<string | null>(null);
  const [isVideo, setIsVideo] = useState(false);

  function onFileSelected(event: ChangeEvent<HTMLInputElement>) {
    const { files } = event.target;

    if (!files) return;

    files[0].type === 'video/mp4' ? setIsVideo(true) : setIsVideo(false);

    const previewURL = URL.createObjectURL(files[0]);

    setPreview(previewURL);
  }

  return (
    <>
      <input
        onChange={onFileSelected}
        name="coverUrl"
        type="file"
        id="media"
        className="invisible h-0 w-0"
        accept="image/*, video/*"
      />

      {preview &&
        (isVideo ? (
          <video
            src={preview}
            controls
            className="aspect-video w-full rounded-lg object-cover"
          />
        ) : (
          // eslint-disable-next-line
          <img
            src={preview}
            alt=""
            className="aspect-video w-full rounded-lg object-cover"
          />
        ))}
    </>
  );
}
