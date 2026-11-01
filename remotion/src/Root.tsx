import { Composition } from "remotion";
import { MemeIntro, memeIntroSchemaDefaults } from "./MemeIntro";
import { LaThuTroi } from "./LaThuTroi/LaThuTroi";
import { MV } from "./LaThuTroiMV/MV";

export const RemotionRoot: React.FC = () => {
  return (
    <>
    <Composition
      id="MemeIntro"
      component={MemeIntro}
      durationInFrames={150}
      fps={30}
      width={1920}
      height={1080}
      defaultProps={memeIntroSchemaDefaults}
    />
    <Composition
      id="LaThuTroi"
      component={LaThuTroi}
      durationInFrames={3600}
      fps={30}
      width={1080}
      height={1608}
    />
    <Composition
      id="LaThuTroiMV"
      component={MV}
      durationInFrames={Math.ceil(306.5 * 30)}
      fps={30}
      width={1080}
      height={1920}
    />
    </>
  );
};
