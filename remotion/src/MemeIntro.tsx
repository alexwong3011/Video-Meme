import {
  AbsoluteFill,
  Easing,
  interpolate,
  Sequence,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

export type MemeIntroProps = {
  title: string;
  accent: string;
  subtitle: string;
};

export const memeIntroSchemaDefaults: MemeIntroProps = {
  title: "Video",
  accent: "Meme",
  subtitle: "Made with Remotion",
};

const Title: React.FC<MemeIntroProps> = ({ title, accent }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pop = spring({ frame, fps, config: { damping: 12 } });
  const bar = interpolate(frame, [15, 50], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.cubic),
  });
  const fadeOut = interpolate(frame, [75, 90], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", opacity: fadeOut }}>
      <h1
        style={{
          fontSize: 140,
          fontWeight: 800,
          letterSpacing: "-0.04em",
          color: "#f5f3ff",
          margin: 0,
          transform: `scale(${0.8 + pop * 0.2})`,
        }}
      >
        {title} <span style={{ color: "#ff4d8d" }}>{accent}</span>
      </h1>
      <div
        style={{
          width: 720,
          height: 12,
          marginTop: 32,
          borderRadius: 6,
          background: "linear-gradient(90deg, #ff4d8d, #4dd2ff)",
          transform: `scaleX(${bar})`,
        }}
      />
    </AbsoluteFill>
  );
};

const Subtitle: React.FC<{ text: string }> = ({ text }) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, 15], [0, 1], { extrapolateRight: "clamp" });
  const y = interpolate(frame, [0, 15], [30, 0], { extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
      <p style={{ fontSize: 56, color: "#f5f3ff", opacity, transform: `translateY(${y}px)` }}>
        {text}
      </p>
    </AbsoluteFill>
  );
};

export const MemeIntro: React.FC<MemeIntroProps> = (props) => {
  return (
    <AbsoluteFill
      style={{ backgroundColor: "#0d0b1a", fontFamily: "'Helvetica Neue', Arial, sans-serif" }}
    >
      <Sequence durationInFrames={90}>
        <Title {...props} />
      </Sequence>
      <Sequence from={85}>
        <Subtitle text={props.subtitle} />
      </Sequence>
    </AbsoluteFill>
  );
};
