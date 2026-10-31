import { Composition } from "remotion";
import { MemeIntro, memeIntroSchemaDefaults } from "./MemeIntro";

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="MemeIntro"
      component={MemeIntro}
      durationInFrames={150}
      fps={30}
      width={1920}
      height={1080}
      defaultProps={memeIntroSchemaDefaults}
    />
  );
};
