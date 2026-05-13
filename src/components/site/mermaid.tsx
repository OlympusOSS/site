"use client";

import { useEffect, useId, useRef, useState } from "react";

export function Mermaid({ chart }: { chart: string }) {
	const ref = useRef<HTMLDivElement>(null);
	const id = useId().replace(/:/g, "");
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		let cancelled = false;
		(async () => {
			const m = (await import("mermaid")).default;
			m.initialize({
				startOnLoad: false,
				theme: "default",
				securityLevel: "loose",
				fontFamily: "ui-sans-serif, system-ui, sans-serif",
			});
			try {
				const { svg } = await m.render(`mermaid-${id}`, chart);
				if (!cancelled && ref.current) {
					ref.current.innerHTML = svg;
				}
			} catch (e) {
				if (!cancelled) {
					setError(e instanceof Error ? e.message : String(e));
				}
			}
		})();
		return () => {
			cancelled = true;
		};
	}, [chart, id]);

	if (error) {
		return (
			<div className="my-4 rounded border border-red-300 bg-red-50 p-3 text-sm text-red-800">
				<div className="font-semibold">Mermaid render error</div>
				<pre className="mt-1 text-xs">{error}</pre>
			</div>
		);
	}

	return (
		<div
			ref={ref}
			className="my-6 flex justify-center overflow-x-auto rounded border border-fd-border bg-fd-card p-4"
		/>
	);
}
