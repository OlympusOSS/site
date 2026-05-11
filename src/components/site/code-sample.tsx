"use client";

import { CodeBlock } from "@olympusoss/canvas";
import { motion } from "framer-motion";

const CODE = `import { OlympusClient } from '@olympusoss/sdk';

const olympus = new OlympusClient({
  issuer: 'https://auth.olympus.dev',
  clientId: 'site-ciam-client',
  pkce: true,
});

await olympus.signIn();
const session = await olympus.getSession();
console.log(session.identity.traits.email);`;

export function CodeSample() {
	return (
		<section className="scroll-mt-20 px-4 py-20 sm:px-6 sm:py-24">
			<div className="mx-auto max-w-[1100px]">
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true, margin: "-100px" }}
					transition={{ duration: 0.5 }}
					className="mb-6 max-w-[640px]"
				>
					<div className="mb-2 font-mono text-xs text-muted-foreground">
						SDK
					</div>
					<h2 className="m-0 text-3xl font-semibold tracking-tight text-foreground sm:text-[32px]">
						Three lines to your first session.
					</h2>
				</motion.div>

				<motion.div
					initial={{ opacity: 0, y: 30 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true, margin: "-50px" }}
					transition={{ duration: 0.5, delay: 0.1 }}
				>
					<CodeBlock theme="dark" language="app/auth.ts" code={CODE} />
				</motion.div>
			</div>
		</section>
	);
}
