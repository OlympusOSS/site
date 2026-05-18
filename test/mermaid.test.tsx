import { render, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

// Hoist a mutable mermaid mock so individual tests can swap render() for the
// happy path vs. the error path.
const { mermaidMock } = vi.hoisted(() => {
	return {
		mermaidMock: {
			initialize: vi.fn(),
			render: vi.fn(async (_id: string, _chart: string) => ({ svg: '<svg data-testid="rendered"></svg>' })),
		},
	};
});

vi.mock("mermaid", () => ({ default: mermaidMock }));

import { Mermaid } from "@/components/site/mermaid";

afterEach(() => {
	mermaidMock.initialize.mockClear();
	mermaidMock.render.mockReset();
	mermaidMock.render.mockImplementation(async () => ({ svg: '<svg data-testid="rendered"></svg>' }));
});

describe("Mermaid", () => {
	it("renders the mermaid SVG into the container when render() succeeds", async () => {
		const { container } = render(<Mermaid chart="graph TD; A-->B;" />);
		await waitFor(() => {
			expect(container.querySelector('svg[data-testid="rendered"]')).not.toBeNull();
		});
		expect(mermaidMock.initialize).toHaveBeenCalled();
	});

	it("shows the error banner when render() throws an Error", async () => {
		mermaidMock.render.mockRejectedValueOnce(new Error("bad diagram"));
		const { findByText } = render(<Mermaid chart="invalid" />);
		expect(await findByText(/mermaid render error/i)).toBeInTheDocument();
		expect(await findByText("bad diagram")).toBeInTheDocument();
	});

	it("stringifies non-Error rejections in the error banner", async () => {
		mermaidMock.render.mockRejectedValueOnce("plain string failure");
		const { findByText } = render(<Mermaid chart="invalid" />);
		expect(await findByText("plain string failure")).toBeInTheDocument();
	});

	it("aborts the async work when the component unmounts before render resolves", async () => {
		let resolveRender: (v: { svg: string }) => void = () => {};
		mermaidMock.render.mockImplementationOnce(
			() =>
				new Promise((res) => {
					resolveRender = res;
				}),
		);
		const { container, unmount } = render(<Mermaid chart="graph TD; A-->B;" />);
		unmount();
		// Resolve after unmount — the component should NOT touch the DOM.
		resolveRender({ svg: '<svg data-testid="late"></svg>' });
		// Yield so the promise's `.then` runs.
		await Promise.resolve();
		expect(container.querySelector('svg[data-testid="late"]')).toBeNull();
	});

	it("aborts the error path when the component unmounts before render rejects", async () => {
		let rejectRender: (err: unknown) => void = () => {};
		mermaidMock.render.mockImplementationOnce(
			() =>
				new Promise((_res, rej) => {
					rejectRender = rej;
				}),
		);
		const { unmount, queryByText } = render(<Mermaid chart="graph TD; A-->B;" />);
		unmount();
		rejectRender(new Error("late-error"));
		await Promise.resolve();
		expect(queryByText("late-error")).toBeNull();
	});
});
