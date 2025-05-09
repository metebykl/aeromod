import { ipc } from "./ipc";

export const quitApp = (): Promise<void> => {
  return ipc("quit_app");
};

export const showAbout = (): Promise<void> => {
  return ipc("show_about");
};

export const humanFileSize = (
  bytes: number,
  si: boolean = true,
  dp: number = 1
): string => {
  const thresh = si ? 1000 : 1024;

  if (Math.abs(bytes) < thresh) {
    return bytes + " B";
  }

  const units = si
    ? ["kB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"]
    : ["KiB", "MiB", "GiB", "TiB", "PiB", "EiB", "ZiB", "YiB"];
  let u = -1;
  const r = 10 ** dp;

  do {
    bytes /= thresh;
    ++u;
  } while (
    Math.round(Math.abs(bytes) * r) / r >= thresh &&
    u < units.length - 1
  );

  return bytes.toFixed(dp) + " " + units[u];
};
