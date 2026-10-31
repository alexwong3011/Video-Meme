# Source this file (". scripts/env.sh") to point HyperFrames and Remotion at a
# pre-installed Chrome Headless Shell, if one exists.
if [ -n "${BASH_VERSION:-}" ]; then eval '_SRC=${BASH_SOURCE[0]}'; else _SRC=scripts/env.sh; fi
_ROOT="$(cd "$(dirname "$_SRC")/.." && pwd)"
[ -f "$_ROOT/.env.browser" ] && . "$_ROOT/.env.browser"
if [ -z "${HYPERFRAMES_BROWSER_PATH:-}" ]; then
  _PW="$(ls -d /opt/pw-browsers/chromium_headless_shell-*/chrome-headless-shell-linux64/chrome-headless-shell 2>/dev/null | tail -1)"
  if [ -n "$_PW" ]; then export HYPERFRAMES_BROWSER_PATH="$_PW"; fi
fi
if [ -n "${HYPERFRAMES_BROWSER_PATH:-}" ] && [ -z "${REMOTION_BROWSER_EXECUTABLE:-}" ]; then
  export REMOTION_BROWSER_EXECUTABLE="$HYPERFRAMES_BROWSER_PATH"
fi
export HYPERFRAMES_BROWSER_PATH REMOTION_BROWSER_EXECUTABLE
unset _ROOT _PW _SRC
