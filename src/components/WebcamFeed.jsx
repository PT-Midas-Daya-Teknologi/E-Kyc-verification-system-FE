import React, { forwardRef } from 'react';
import Webcam from 'react-webcam';

const WebcamFeed = forwardRef(function WebcamFeed(
  {
    mirrored = true,
    onReady,
    onError,
    className = '',
    width = 360,
    height = 270,
    frameRate = 20,
  },
  ref
) {
  const videoConstraints = {
    facingMode: 'user',
    width: { ideal: 640, max: 640 },
    height: { ideal: 480, max: 480 },
    frameRate: { ideal: frameRate, max: frameRate + 4 },
  };

  return (
    <div className={`relative mx-auto overflow-hidden rounded-2xl border border-sky-200 bg-sky-50/40 ${className}`}>
      <Webcam
        ref={ref}
        audio={false}
        mirrored={mirrored}
        screenshotFormat="image/jpeg"
        videoConstraints={videoConstraints}
        onUserMedia={onReady}
        onUserMediaError={onError}
        className="h-full w-full rounded-2xl object-cover"
        width={width}
        height={height}
      />
      <div className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-sky-300/70" />
    </div>
  );
});

export default WebcamFeed;
