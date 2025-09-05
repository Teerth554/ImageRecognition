"use client";

import React, { useState } from "react";
import * as mobilenet from "@tensorflow-models/mobilenet";
import "@tensorflow/tfjs";

export default function Recognize() {
  const [imageUrl, setImageUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [predictions, setPredictions] = useState([]);

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const image = URL.createObjectURL(file);
      setImageUrl(image);
      setPredictions([]); // reset old predictions
    }
  };

  const handleClassify = async () => {
    try {
      setLoading(true);
      const imgElement = document.getElementById(
        "uploaded-img"
      )  // 👈 safer cast
      if (!imgElement) return;

      // Load model
      const model = await mobilenet.load();
      // Classify image
      const results = await model.classify(imgElement);

      console.log("Predictions:", results);
      setPredictions(results);
    } catch (error) {
      console.error("Classification error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen w-full bg-indigo-400 flex flex-col gap-4 justify-center items-center p-4">
      {/* Upload */}
      <label className="cursor-pointer border-2 border-dashed rounded p-2 bg-gray-500">
        Upload Here
        <input
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          hidden
        />
      </label>

      {/* Preview + classify */}
      {imageUrl && (
        <>
          <img
            id="uploaded-img"
            className="w-[300px] rounded-xl shadow-lg"
            src={imageUrl}
            alt="Uploaded"
          />
          <button
            onClick={handleClassify}
            className="px-4 py-2 rounded bg-gray-800 text-white"
            disabled={loading}
          >
            {loading ? "Classifying..." : "Classify"}
          </button>
        </>
      )}

      {/* Results */}
      {predictions.length > 0 && (
        <div className="bg-gray-500 p-4 rounded-lg shadow-md w-[300px]">
          <h2 className="font-bold mb-2">Predictions:</h2>
          <ul className="space-y-1">
            {predictions.map((p, idx) => (
              <li key={idx} className="text-sm">
                {p.className} – {(p.probability * 100).toFixed(2)}%
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
