import React from "react";

function FaceDetection() {

  return (

    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">

      <div className="bg-white p-8 rounded-3xl shadow-2xl w-full max-w-3xl">

        

        <div className="rounded-2xl overflow-hidden border border-gray-300">

          <img
            src="http://127.0.0.1:5000/video_feed"
            alt="Live Camera"
            className="w-full"
          />

        </div>

        <p className="text-center text-gray-500 mt-4">
          Live camera stream
        </p>

      </div>

    </div>
  );
}

export default FaceDetection;