import { describe, it, expect, beforeEach, vi } from "vitest";
import { uploadConfigFile, fetchConfigFiles, fetchFileRequirements } from "../file-service";
import { api } from "../api";

class FormDataMock {
  entries: Record<string, any> = {};
  append(key: string, value: any) {
    this.entries[key] = value;
  }
}

beforeEach(() => {
  vi.restoreAllMocks();
  // @ts-ignore replace global FormData with mock
  global.FormData = FormDataMock;
});

describe("file-service", () => {
  it("uploadConfigFile sends uploaded_file and returns id/name", async () => {
    const file = new File(["content"], "config.txt");
    const postMock = vi.spyOn(api, "post").mockResolvedValue({ data: { id: 1, name: "config.txt" } });

    const result = await uploadConfigFile(file);

    expect(postMock).toHaveBeenCalledWith(
      "/files/upload",
      expect.any(FormDataMock),
      expect.any(Object)
    );

    const formDataArg = postMock.mock.calls[0][1] as FormDataMock;
    expect(formDataArg.entries["uploaded_file"]).toBe(file);
    expect(result).toEqual({ id: 1, name: "config.txt" });
  });

  it("fetchConfigFiles processes response", async () => {
    const getMock = vi
      .spyOn(api, "get")
      .mockResolvedValue({ data: [{ id: 1, name: "a" }, { id: 2, filename: "b.txt" }] });

    const result = await fetchConfigFiles();

    expect(getMock).toHaveBeenCalledWith("/files/");
    expect(result).toEqual([
      { id: 1, name: "a" },
      { id: 2, name: "b.txt" },
    ]);
  });

  it("fetchFileRequirements processes response", async () => {
    const getMock = vi.spyOn(api, "get").mockResolvedValue({ data: "requirements" });

    const result = await fetchFileRequirements(7);

    expect(getMock).toHaveBeenCalledWith("/files/7/requirements");
    expect(result).toBe("requirements");
  });
});

