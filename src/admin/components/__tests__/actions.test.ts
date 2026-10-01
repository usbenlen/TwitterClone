import { describe, expect, it, vi } from "vitest";
import { runActionTasks } from "@/admin/components/ActionConfirmation";
describe("administrative batches", () => {
  it("retains failed tasks for retry without repeating successful actions", async () => {
    const first = vi.fn().mockResolvedValue(undefined);
    const second = vi
      .fn()
      .mockRejectedValueOnce(new Error("failed"))
      .mockResolvedValue(undefined);
    const third = vi.fn().mockResolvedValue(undefined);
    const tasks = [
      { id: "first", run: first },
      { id: "second", run: second },
      { id: "third", run: third },
    ];
    const result = await runActionTasks(tasks);
    expect(result.failed.map((task) => task.id)).toEqual(["second"]);
    expect(result.errors).toEqual(["failed"]);
    expect((await runActionTasks(result.failed)).failed).toEqual([]);
    expect(first).toHaveBeenCalledTimes(1);
    expect(second).toHaveBeenCalledTimes(2);
    expect(third).toHaveBeenCalledTimes(1);
  });
  it("stops issuing actions after the session changes", async () => {
    let active = true;
    const second = vi.fn();
    await runActionTasks(
      [
        {
          id: "first",
          run: async () => {
            active = false;
          },
        },
        { id: "second", run: second },
      ],
      () => active,
    );
    expect(second).not.toHaveBeenCalled();
  });
});
