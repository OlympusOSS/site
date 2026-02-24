"use client";

export function AnimatedBackground() {
	return (
		<div className="pointer-events-none fixed inset-0 overflow-hidden">
			{/* Primary indigo orb — top right */}
			<div
				className="absolute -right-48 -top-48 h-[600px] w-[600px] rounded-full opacity-15 blur-[140px]"
				style={{
					background: "radial-gradient(circle, #6366f1 0%, transparent 70%)",
					animation: "orb-float-1 8s ease-in-out infinite",
				}}
			/>
			{/* Secondary amber orb — bottom left */}
			<div
				className="absolute -bottom-48 -left-48 h-[500px] w-[500px] rounded-full opacity-10 blur-[120px]"
				style={{
					background: "radial-gradient(circle, #f59e0b 0%, transparent 70%)",
					animation: "orb-float-2 10s ease-in-out infinite",
				}}
			/>
			{/* Purple accent — center right */}
			<div
				className="absolute right-1/4 top-1/2 h-[350px] w-[350px] rounded-full opacity-10 blur-[100px]"
				style={{
					background: "radial-gradient(circle, #8b5cf6 0%, transparent 70%)",
					animation: "orb-float-1 12s ease-in-out 3s infinite",
				}}
			/>
		</div>
	);
}
