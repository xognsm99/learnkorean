import { ImageResponse } from "next/og";

export const runtime = "edge";

export const alt = "Korean Work - Learn Korean for the Workplace";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "system-ui, sans-serif",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Background decorations */}
        <div
          style={{
            position: "absolute",
            top: -100,
            right: -100,
            width: 400,
            height: 400,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.1)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: -150,
            left: -150,
            width: 500,
            height: 500,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.08)",
          }}
        />

        {/* Glass card */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "60px 80px",
            borderRadius: 40,
            background: "rgba(255,255,255,0.2)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(255,255,255,0.3)",
            boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)",
          }}
        >
          {/* Icons row */}
          <div
            style={{
              display: "flex",
              gap: 24,
              marginBottom: 32,
            }}
          >
            <div
              style={{
                width: 80,
                height: 80,
                borderRadius: 20,
                background: "linear-gradient(135deg, #8b5cf6, #7c3aed)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 40,
                color: "white",
                fontWeight: 700,
                boxShadow: "0 10px 30px -5px rgba(139,92,246,0.5)",
              }}
            >
              ㅎ
            </div>
            <div
              style={{
                width: 80,
                height: 80,
                borderRadius: 20,
                background: "linear-gradient(135deg, #f59e0b, #ea580c)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 40,
                boxShadow: "0 10px 30px -5px rgba(245,158,11,0.5)",
              }}
            >
              🎯
            </div>
            <div
              style={{
                width: 80,
                height: 80,
                borderRadius: 20,
                background: "linear-gradient(135deg, #0ea5e9, #2563eb)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 40,
                boxShadow: "0 10px 30px -5px rgba(14,165,233,0.5)",
              }}
            >
              💼
            </div>
          </div>

          {/* Title */}
          <h1
            style={{
              fontSize: 72,
              fontWeight: 800,
              color: "white",
              margin: 0,
              marginBottom: 16,
              textShadow: "0 4px 20px rgba(0,0,0,0.2)",
              letterSpacing: "-0.02em",
            }}
          >
            Korean Work
          </h1>

          {/* Subtitle */}
          <p
            style={{
              fontSize: 28,
              color: "rgba(255,255,255,0.9)",
              margin: 0,
              fontWeight: 500,
              textShadow: "0 2px 10px rgba(0,0,0,0.1)",
            }}
          >
            Learn Korean for the Workplace
          </p>
        </div>

        {/* Bottom tagline */}
        <p
          style={{
            position: "absolute",
            bottom: 40,
            fontSize: 18,
            color: "rgba(255,255,255,0.7)",
            fontWeight: 500,
          }}
        >
          Jamo Quiz • Emoji Vocab • Interview Prep
        </p>
      </div>
    ),
    {
      ...size,
    }
  );
}
