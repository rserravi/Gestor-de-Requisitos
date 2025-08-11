import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { RequirementsTable } from "../RequirementsTable";
import type { RequirementModel } from "../../models/requirements-model";
import { StateMachineProvider } from "../../context/StateMachineContext";

vi.mock("../../services/requirements-service", () => ({
  fetchProjectRequirements: vi.fn(),
  updateRequirement: vi.fn(),
  createRequirement: vi.fn(),
  deleteRequirement: vi.fn()
}));

import {
  fetchProjectRequirements,
  updateRequirement,
} from "../../services/requirements-service";

const mockFetch = vi.mocked(fetchProjectRequirements);
const mockUpdate = vi.mocked(updateRequirement);

const requirements: RequirementModel[] = [
  {
    id: "1",
    description: "Alpha requirement",
    status: "draft",
    category: "functional",
    priority: "must",
    visualReference: "",
    number: 2,
    projectId: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
    ownerId: 1,
  },
  {
    id: "2",
    description: "Bravo requirement",
    status: "approved",
    category: "performance",
    priority: "should",
    visualReference: "",
    number: 1,
    projectId: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
    ownerId: 1,
  }
];

function renderTable() {
  return render(
    <StateMachineProvider>
      <RequirementsTable
        collapsed={false}
        onToggleCollapse={() => {}}
        language="en"
        projectId={1}
        ownerId={1}
      />
    </StateMachineProvider>
  );
}

describe("RequirementsTable", () => {
  beforeEach(() => {
    mockFetch.mockResolvedValue([...requirements]);
    mockUpdate.mockResolvedValue(requirements[0]);
  });

  it("renders requirements from fetchProjectRequirements", async () => {
    renderTable();

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(1);
    });

    await waitFor(() => {
      expect(screen.queryByText("Alpha requirement")).not.toBeNull();
      expect(screen.queryByText("Bravo requirement")).not.toBeNull();
    });
  });

  it("applies filters to reduce list", async () => {
    renderTable();
    await waitFor(() => screen.getByText("Alpha requirement"));
    const user = userEvent.setup();

    // Text filter
    await user.type(screen.getByPlaceholderText(/Search by description/i), "Alpha");
    await waitFor(() => {
      expect(screen.queryByText("Bravo requirement")).toBeNull();
    });

    // Clear filters
    await user.click(screen.getByRole("button", { name: /Clear/i }));

    const selects = screen.getAllByRole("combobox");

    // Status filter
    await user.click(selects[0]);
    await user.click(screen.getByRole("option", { name: /Approved/i }));
    await waitFor(() => {
      expect(screen.queryByText("Alpha requirement")).toBeNull();
    });
    await user.click(screen.getByRole("button", { name: /Clear/i }));

    // Category filter
    await user.click(selects[1]);
    await user.click(screen.getByRole("option", { name: /Performance/i }));
    await waitFor(() => {
      expect(screen.queryByText("Alpha requirement")).toBeNull();
    });
    await user.click(screen.getByRole("button", { name: /Clear/i }));

    // Priority filter
    await user.click(selects[2]);
    await user.click(screen.getByRole("option", { name: /Should/i }));
    await waitFor(() => {
      expect(screen.queryByText("Alpha requirement")).toBeNull();
    });
  });

  it("sorts rows when headers are clicked", async () => {
    const { container } = renderTable();
    await waitFor(() => screen.getByText("Alpha requirement"));
    const user = userEvent.setup();

    let rows = container.querySelectorAll("tbody tr");
    expect(rows[0].textContent).toContain("Bravo requirement");

    const descriptionHeader = screen.getByRole("columnheader", { name: /Description/i });
    await user.click(descriptionHeader);
    rows = container.querySelectorAll("tbody tr");
    expect(rows[0].textContent).toContain("Alpha requirement");

    await user.click(descriptionHeader);
    rows = container.querySelectorAll("tbody tr");
    expect(rows[0].textContent).toContain("Bravo requirement");
  });

  it("calls updateRequirement on save edit", async () => {
    mockUpdate.mockResolvedValue({ ...requirements[0], description: "Updated requirement" });
    renderTable();
    await waitFor(() => screen.getByText("Alpha requirement"));
    const user = userEvent.setup();

    const alphaRow = screen.getByText("Alpha requirement").closest("tr")!;
    const editBtn = within(alphaRow).getByLabelText(/Edit Requirement/i);
    await user.click(editBtn);

    const input = screen.getByDisplayValue("Alpha requirement");
    await user.clear(input);
    await user.type(input, "Updated requirement");

    const saveBtn = within(alphaRow).getByLabelText(/Save Changes/i);
    await user.click(saveBtn);

    await waitFor(() => {
      expect(mockUpdate).toHaveBeenCalledWith("1", expect.objectContaining({ description: "Updated requirement" }));
      expect(screen.queryByText("Updated requirement")).not.toBeNull();
    });
  });
});

