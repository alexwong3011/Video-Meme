import { Config } from "@remotion/cli/config";

Config.setVideoImageFormat("jpeg");
Config.setOverwriteOutput(true);
Config.setCodec("h264");

// Use a pre-installed Chrome Headless Shell when REMOTION_BROWSER_EXECUTABLE is set
// (e.g. in sandboxes where Remotion cannot download its own browser).
if (process.env.REMOTION_BROWSER_EXECUTABLE) {
  Config.setBrowserExecutable(process.env.REMOTION_BROWSER_EXECUTABLE);
}
