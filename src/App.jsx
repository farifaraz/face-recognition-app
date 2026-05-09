import React, { useEffect, useRef, useState } from "react";

export default function MobileFaceRecognitionApp() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  const [cameraOn, setCameraOn] = useState(false);
  const [cameraMode, setCameraMode] = useState("user");
  const [status, setStatus] = useState("Tap Start Camera to begin.");
  const [name, setName] = useState("");
  const [enrolledFaces, setEnrolledFaces] = useState([]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("faces");
      if (saved) setEnrolledFaces(JSON.parse(saved));
    } catch {}
  }, []);

  useEffect(() => {
    localStorage.setItem("faces", JSON.stringify(enrolledFaces));
  }, [enrolledFaces]);

  async function startCamera(mode = cameraMode) {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: mode,
        },
        audio: false,
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      setCameraOn(true);
      setStatus("Camera started.");
    } catch {
      setStatus("Camera permission denied.");
    }
  }

  function stopCamera() {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
    }

    setCameraOn(false);
    setStatus("Camera stopped.");
  }

  async function switchCamera() {
    const next = cameraMode === "user" ? "environment" : "user";
    setCameraMode(next);
    stopCamera();
    await startCamera(next);
  }

  function captureFrame() {
    const video = videoRef.current;
    const canvas = canvasRef.current;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0);

    return canvas.toDataURL("image/jpeg");
  }

  function enrollFace() {
    if (!name) {
      setStatus("Enter employee name.");
      return;
    }

    const image = captureFrame();

    const newFace = {
      id: Date.now(),
      name,
      image,
    };

    setEnrolledFaces([newFace, ...enrolledFaces]);
    setName("");
    setStatus("Face enrolled.");
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#020617",
        color: "white",
        padding: 16,
        fontFamily: "Arial",
      }}
    >
      <h1>Face Recognition App</h1>

      <div
        style={{
          position: "relative",
          borderRadius: 20,
          overflow: "hidden",
          background: "black",
        }}
      >
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          style={{
            width: "100%",
            maxHeight: 500,
            objectFit: "cover",
          }}
        />

        <canvas ref={canvasRef} style={{ display: "none" }} />
      </div>

      <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
        {!cameraOn ? (
          <button
            onClick={() => startCamera()}
            style={{
              padding: 15,
              borderRadius: 12,
              border: "none",
              background: "#2563eb",
              color: "white",
              fontWeight: "bold",
            }}
          >
            Start Camera
          </button>
        ) : (
          <button
            onClick={stopCamera}
            style={{
              padding: 15,
              borderRadius: 12,
              border: "none",
              background: "#475569",
              color: "white",
              fontWeight: "bold",
            }}
          >
            Stop Camera
          </button>
        )}

        <button
          onClick={switchCamera}
          style={{
            padding: 15,
            borderRadius: 12,
            border: "none",
            background: "#0f766e",
            color: "white",
            fontWeight: "bold",
          }}
        >
          Switch Camera
        </button>
      </div>

      <div
        style={{
          marginTop: 20,
          background: "#0f172a",
          padding: 20,
          borderRadius: 20,
        }}
      >
        <h3>Enroll Employee</h3>

        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Employee name"
          style={{
            width: "100%",
            padding: 14,
            borderRadius: 12,
            border: "1px solid #334155",
            background: "#1e293b",
            color: "white",
            marginTop: 10,
            marginBottom: 10,
          }}
        />

        <button
          onClick={enrollFace}
          style={{
            width: "100%",
            padding: 15,
            borderRadius: 12,
            border: "none",
            background: "#2563eb",
            color: "white",
            fontWeight: "bold",
          }}
        >
          Enroll Face
        </button>
      </div>

      <div style={{ marginTop: 20 }}>
        <h3>Saved Faces</h3>

        {enrolledFaces.map((face) => (
          <div
            key={face.id}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              background: "#1e293b",
              padding: 10,
              borderRadius: 12,
              marginTop: 10,
            }}
          >
            <img
              src={face.image}
              alt={face.name}
              style={{
                width: 60,
                height: 60,
                objectFit: "cover",
                borderRadius: 10,
              }}
            />

            <div>{face.name}</div>
          </div>
        ))}
      </div>

      <div
        style={{
          marginTop: 20,
          background: "#451a03",
          padding: 15,
          borderRadius: 15,
          fontSize: 12,
        }}
      >
        Demo app only. Use HTTPS on iPhone for camera access.
      </div>

      <div style={{ marginTop: 20 }}>
        Status: {status}
      </div>
    </div>
  );
}
