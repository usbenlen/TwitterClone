import { afterEach, describe, expect, it, vi } from "vitest";
import { createObjectUrlOwner } from "@/utils/objectUrl";

afterEach(() => vi.restoreAllMocks());

describe("image preview URL ownership", () => {
  it("releases each temporary URL on replacement and cleanup exactly once", () => {
    const create = vi
      .spyOn(URL, "createObjectURL")
      .mockReturnValueOnce("blob:first")
      .mockReturnValueOnce("blob:second");
    const revoke = vi
      .spyOn(URL, "revokeObjectURL")
      .mockImplementation(() => {});
    const owner = createObjectUrlOwner();
    owner.release();
    expect(revoke).not.toHaveBeenCalled();
    expect(owner.replace(new Blob())).toBe("blob:first");
    expect(owner.replace(new Blob())).toBe("blob:second");
    expect(revoke.mock.calls).toEqual([["blob:first"]]);
    owner.release();
    owner.release();
    expect(revoke.mock.calls).toEqual([["blob:first"], ["blob:second"]]);
    expect(create).toHaveBeenCalledTimes(2);
  });

  it("keeps avatar and banner previews independent", () => {
    vi.spyOn(URL, "createObjectURL")
      .mockReturnValueOnce("blob:avatar")
      .mockReturnValueOnce("blob:banner");
    const revoke = vi
      .spyOn(URL, "revokeObjectURL")
      .mockImplementation(() => {});
    const avatar = createObjectUrlOwner();
    const banner = createObjectUrlOwner();
    avatar.replace(new Blob());
    banner.replace(new Blob());
    avatar.release();
    expect(revoke.mock.calls).toEqual([["blob:avatar"]]);
    banner.release();
    expect(revoke.mock.calls).toEqual([["blob:avatar"], ["blob:banner"]]);
  });
});
