import {
  invoke,
  type InvokeArgs,
  type InvokeOptions,
} from "@tauri-apps/api/core";

export const ipc = async <T>(
  cmd: string,
  args?: InvokeArgs,
  options?: InvokeOptions
): Promise<T> => {
  try {
    return await invoke(cmd, args, options);
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }

    throw new Error(
      typeof error === "string"
        ? error
        : JSON.stringify(error) || "Unknown error"
    );
  }
};
