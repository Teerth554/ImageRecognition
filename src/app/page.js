"use client";

import { useEffect, useRef } from "react";
import * as cocoSsd from "@tensorflow-models/coco-ssd";
import "@tensorflow/tfjs";

export default function Home() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const runDetection = () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      alert("Camera Not Found");
      return;
    }

    const webCamPromise = navigator.mediaDevices
      .getUserMedia({
        audio: false,
        video: { facingMode: "user" },
      })
      .then((stream) => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        return new Promise((resolve) => {
          videoRef.current.onloadedmetadata = () => {
            videoRef.current.play();
            resolve(videoRef.current);
          };
        });
      });

    const modelPromise = cocoSsd.load();

    Promise.all([webCamPromise, modelPromise]).then(([video, model]) => {
      console.log("Webcam ready:", video);
      console.log("Model loaded:", model);

      // Start continuous detection
      detectFrame(video, model);
    });

    const detectFrame = (video, model) => {
      model.detect(video).then((predictions) => {
        renderPredictions(predictions);
        requestAnimationFrame(() => {
          detectFrame(video, model);
        });
      });
    };

    const renderPredictions = (predictions) => {
      const ctx = canvasRef.current.getContext("2d");
      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

      const font = "16px sans-serif";
      ctx.font = font;
      ctx.textBaseline = "top";

      predictions.forEach((prediction) => {
        const [x, y, width, height] = prediction.bbox;

        // Draw bounding box
        ctx.strokeStyle = "#00FFFF";
        ctx.lineWidth = 2;
        ctx.strokeRect(x, y, width, height);

        // Draw label background
        const text = `${prediction.class} (${(prediction.score * 100).toFixed(1)}%)`;
        const textWidth = ctx.measureText(text).width;
        const textHeight = parseInt(font, 10);

        ctx.fillStyle = "#00FFFF";
        ctx.fillRect(x, y, textWidth + 6, textHeight + 4);

        // Draw text (black font)
        ctx.fillStyle = "#000000";
        ctx.fillText(text, x , y );
      });
    };
  };

  useEffect(() => {
    runDetection();
  }, []);

  return (
    <div className="relative h-screen flex justify-center items-center bg-indigo-400 ">
      {/* Video */}
      <video
        autoPlay muted playsInline ref={videoRef} width="500" height="350" className="absolute  left-1/2 top-1/2 -translate-x-1/2 -trasnlate-y-1/2 border-8 rounded-xl border-dashed"
      />
      {/* Canvas overlay */}
      <canvas
        ref={canvasRef} 
        width="500"
        height="350"
        className="absolute  left-1/2 top-1/2 -translate-x-1/2 -trasnlate-y-1/2"
      />

    </div>
  );
}
   