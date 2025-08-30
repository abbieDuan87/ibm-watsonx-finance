"use client";
import React, { useMemo, useState } from "react";

function StepItem({
	n,
	label,
	active,
	onClick,
}: {
	n: number;
	label: string;
	active: boolean;
	onClick: () => void;
}) {
	return (
		<button
			onClick={onClick}
			className={`w-full text-left rounded-xl border px-4 py-3 mb-2 flex items-center gap-3 ${
				active
					? "bg-neutral text-neutral-content border-neutral"
					: "bg-base-100 border-base-300 hover:bg-base-200"
			}`}
		>
			<div
				className={`w-8 h-8 rounded-full grid place-items-center text-sm font-semibold ${
					active
						? "bg-neutral-content text-neutral"
						: "bg-base-300 text-base-content"
				}`}
			>
				{n}
			</div>
			<span className="font-medium">{label}</span>
		</button>
	);
}

function SectionCard({
	title,
	children,
}: {
	title: string;
	children: React.ReactNode;
}) {
	return (
		<section className="card bg-base-100 shadow-sm border border-base-300">
			<div className="card-body">
				<h2 className="card-title text-lg">{title}</h2>
				<div className="prose prose-sm max-w-none">{children}</div>
			</div>
		</section>
	);
}

function Callout({
	tone = "info",
	children,
}: {
	tone?: "info" | "success" | "warning" | "error";
	children: React.ReactNode;
}) {
	const map = {
		info: "alert-info",
		success: "alert-success",
		warning: "alert-warning",
		error: "alert-error",
	} as const;
	return (
		<div role="alert" className={`alert ${map[tone]} my-3`}>
			<span>{children}</span>
		</div>
	);
}

// ---------------------- Knowledge Check ----------------------
type Question = {
	id: string;
	q: string;
	options: string[];
	correct: number;
	explain: string;
};

function QuizBlock({
	title,
	questions,
}: {
	title: string;
	questions: Question[];
}) {
	const [answers, setAnswers] = useState<Record<string, number>>({});
	const [submitted, setSubmitted] = useState(false);

	const score = useMemo(
		() =>
			questions.reduce(
				(acc, cur) => acc + ((answers[cur.id] ?? -1) === cur.correct ? 1 : 0),
				0
			),
		[answers, questions]
	);

	return (
		<SectionCard title={title}>
			<div className="space-y-5">
				{questions.map((item, idx) => (
					<div key={item.id} className="p-4 border border-base-300 rounded-xl">
						<div className="font-medium mb-2">
							{idx + 1}. {item.q}
						</div>
						<div className="space-y-2">
							{item.options.map((opt, i) => (
								<label
									key={i}
									className="flex items-start gap-2 cursor-pointer"
								>
									<input
										type="radio"
										name={item.id}
										className="radio"
										checked={(answers[item.id] ?? -1) === i}
										onChange={() => setAnswers({ ...answers, [item.id]: i })}
									/>
									<span>{opt}</span>
								</label>
							))}
						</div>
						{submitted && (
							<div
								className={`mt-3 text-sm ${
									(answers[item.id] ?? -1) === item.correct
										? "text-success"
										: "text-error"
								}`}
							>
								{(answers[item.id] ?? -1) === item.correct
									? "Correct. "
									: "Not quite. "}
								<span className="text-base-content/80">{item.explain}</span>
							</div>
						)}
					</div>
				))}
				<div className="flex items-center gap-3">
					<button
						className="btn btn-neutral"
						onClick={() => setSubmitted(true)}
					>
						Check answers
					</button>
					{submitted && (
						<div className="text-sm">
							Score:{" "}
							<span className="font-semibold">
								{score}/{questions.length}
							</span>
						</div>
					)}
				</div>
			</div>
		</SectionCard>
	);
}

// ---------------------- Page ----------------------
export default function TutorialPage() {
	const steps = [
		"Introduction",
		"What is watsonx & Studio",
		"Core workflow in Studio",
		"RAG vs Fine‑tune",
		"Deployments & APIs",
		"Governance & Cost Controls",
		"Enterprise Fit & Use Cases",
		"Knowledge Checks & Completion",
		"Resources & Links",
	];
	const [step, setStep] = useState(1);
	const progress = useMemo(() => (step / steps.length) * 100, [step]);

	return (
		<div className="mx-auto max-w-7xl px-4 py-8">
			{/* Header */}
			<div className="mb-6">
				<h1 className="text-3xl font-bold">
					Watsonx Studio — Interactive Enterprise Tutorial
				</h1>
				<p className="text-base-content/70 mt-1">
					A hands‑on walkthrough of IBM watsonx Studio: what it is, how to use
					it, and how it fits into enterprise workflows.
				</p>
				<div className="mt-4">
					<progress
						className="progress progress-neutral w-full"
						value={progress}
						max={100}
					></progress>
				</div>
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
				{/* Sidebar steps */}
				<aside className="lg:col-span-2">
					{steps.map((label, i) => (
						<StepItem
							key={label}
							n={i + 1}
							label={label}
							active={step === i + 1}
							onClick={() => setStep(i + 1)}
						/>
					))}
					<Callout tone="info">
						Tip: You can revisit any step; your progress bar updates
						accordingly.
					</Callout>
				</aside>

				{/* Main content */}
				<main className="lg:col-span-3 space-y-5">
					{step === 1 && (
						<SectionCard title="Welcome & Learning Outcomes">
							<ul>
								<li>
									Understand what <strong>watsonx</strong> is and where{" "}
									<strong>Studio</strong> fits.
								</li>
								<li>
									Follow an end‑to‑end workflow: prompt → (optional) RAG →
									evaluate → deploy.
								</li>
								<li>
									Learn when to use <em>foundation models</em> vs{" "}
									<em>your own deployments</em>.
								</li>
								<li>
									See enterprise considerations: governance, cost control,
									integration patterns.
								</li>
							</ul>
							<Callout tone="warning">
								No access to watsonx.data? No problem. This tutorial explains
								both the <strong>demo path</strong> (prompts/AutoAI) and the{" "}
								<strong>enterprise path</strong> (Milvus vector index +
								deployments).
							</Callout>
						</SectionCard>
					)}

					{step === 2 && (
						<SectionCard title="What is watsonx & Studio?">
							<p>
								<strong>watsonx</strong> is IBM’s AI and data platform.{" "}
								<strong>watsonx.ai Studio</strong> is the workspace where you
								experiment with models (e.g., Granite), prompts, grounding data,
								AutoAI experiments, and evaluations. A <em>Project</em> in
								Studio is a collaborative workspace that holds datasets,
								experiments, and assets.
							</p>
							<div className="join join-vertical w-full mt-4">
								<div className="collapse collapse-arrow join-item border border-base-300">
									<input type="checkbox" />
									<div className="collapse-title font-medium">
										Key components at a glance
									</div>
									<div className="collapse-content">
										<ul>
											<li>
												<strong>Foundation models</strong> (e.g., Granite
												instruct) — ready‑hosted, called with{" "}
												<code>project_id + model_id</code>.
											</li>
											<li>
												<strong>Prompt Lab</strong> — design prompts, add
												grounding data, test parameters, evaluate.
											</li>
											<li>
												<strong>AutoAI</strong> — tabular ML for
												forecasting/classification without heavy coding.
											</li>
											<li>
												<strong>Deployments</strong> — promote tuned/custom
												models to stable endpoints.
											</li>
										</ul>
									</div>
								</div>
								<div className="collapse collapse-arrow join-item border border-base-300">
									<input type="checkbox" />
									<div className="collapse-title font-medium">
										When does a <em>Project</em> suffice vs a{" "}
										<em>Deployment</em>?
									</div>
									<div className="collapse-content">
										<p>
											Calling foundation models for prototyping only needs a{" "}
											<strong>Project</strong>. When you train/tune a custom
											model you want to call from apps, create a{" "}
											<strong>Deployment</strong> to expose a stable API.
										</p>
									</div>
								</div>
							</div>
						</SectionCard>
					)}

					{step === 3 && (
						<SectionCard title="Core workflow in Studio">
							<ol>
								<li>
									<strong>Create/Use a Project</strong> — holds data, prompts,
									experiments.
								</li>
								<li>
									<strong>Design a Prompt</strong> — define task, constraints,
									and desired format.
								</li>
								<li>
									<strong>(Optional) Add Grounding</strong> — bring in company
									docs via Vector Index (Milvus) or use AutoAI RAG uploads for
									small demos.
								</li>
								<li>
									<strong>Evaluate</strong> — test prompts on sample cases;
									refine parameters.
								</li>
								<li>
									<strong>Decide</strong> — prompts+RAG might be enough;
									otherwise fine‑tune.
								</li>
								<li>
									<strong>Deploy</strong> (for custom assets) — publish as
									endpoint.
								</li>
							</ol>
							<Callout tone="success">
								For many SME scenarios (Q&A, summaries, invoice hints), prompts
								+ RAG (when available) are sufficient. Fine‑tune to lock in
								tone/format only when needed.
							</Callout>
						</SectionCard>
					)}

					{step === 4 && (
						<SectionCard title="RAG vs Fine‑tune (choose wisely)">
							<div className="grid md:grid-cols-2 gap-4">
								<div className="p-4 border border-base-300 rounded-xl">
									<h3 className="font-semibold">
										RAG (Retrieval‑Augmented Generation)
									</h3>
									<ul>
										<li>
											Attach company knowledge (PDF/DOCX/TXT) via a Vector Index
											(Milvus).
										</li>
										<li>
											Low maintenance — update knowledge by adding/replacing
											docs.
										</li>
										<li>Best for factual grounding and up‑to‑date policies.</li>
									</ul>
								</div>
								<div className="p-4 border border-base-300 rounded-xl">
									<h3 className="font-semibold">Fine‑tune (e.g., LoRA)</h3>
									<ul>
										<li>
											Teach the model a consistent <em>style</em> or{" "}
											<em>schema</em> (e.g., strict JSON, audit tone).
										</li>
										<li>
											Use 10–100 curated examples; deploy the tuned model for
											apps.
										</li>
										<li>
											Good when prompts drift or strict outputs are required.
										</li>
									</ul>
								</div>
							</div>
							<Callout tone="info">
								No watsonx.data? Use AutoAI RAG uploads for small demos; for
								production, request a Milvus connection to create a Vector
								Index.
							</Callout>
						</SectionCard>
					)}

					{step === 5 && (
						<SectionCard title="Deployments & APIs (turn experiments into services)">
							<p>
								Studio experiments are for exploration. When you need external
								systems to call your model, <strong>deploy</strong> it:
							</p>
							<ul>
								<li>
									<strong>Foundation models</strong> — already hosted; call with{" "}
									<code>model_id + project_id</code> (no deployment needed).
								</li>
								<li>
									<strong>Custom/AutoAI/tuned models</strong> — create a{" "}
									<strong>Deployment</strong> to get a stable endpoint and
									versioning.
								</li>
							</ul>
							<div className="grid md:grid-cols-2 gap-4 mt-2">
								<div className="p-4 border border-base-300 rounded-xl">
									<h3 className="font-semibold">Why deploy?</h3>
									<ul>
										<li>Scalability & reliability</li>
										<li>Access control & auditability</li>
										<li>Versioning and rollback</li>
									</ul>
								</div>
								<div className="p-4 border border-base-300 rounded-xl">
									<h3 className="font-semibold">Integrate with apps</h3>
									<ul>
										<li>
											Backend calls deployment endpoint (never expose keys in
											browser).
										</li>
										<li>
											Route tasks: LLM (Granite) vs tabular (AutoAI pipeline).
										</li>
									</ul>
								</div>
							</div>
						</SectionCard>
					)}

					{step === 6 && (
						<SectionCard title="Governance & Cost Controls">
							<ul>
								<li>
									<strong>Access & roles</strong> — restrict who can view data,
									run experiments, or deploy.
								</li>
								<li>
									<strong>Data handling</strong> — avoid sending sensitive data
									unless you have the right policies in place; redact or sample.
								</li>
								<li>
									<strong>Observability</strong> — log prompts/outputs (with
									consent), track latency and model performance.
								</li>
								<li>
									<strong>Cost discipline</strong> — use sensible token limits;
									cache reusable answers; prefer RAG updates over frequent
									fine‑tunes.
								</li>
							</ul>
							<Callout tone="warning">
								Keep credentials strictly server‑side and add rate
								limiting/timeouts to your API routes.
							</Callout>
						</SectionCard>
					)}

					{step === 7 && (
						<SectionCard title="Enterprise Fit & Use Cases (SME‑focused)">
							<div className="grid md:grid-cols-2 gap-4">
								<div className="p-4 border border-base-300 rounded-xl">
									<h3 className="font-semibold">Finance Assist</h3>
									<ul>
										<li>Summarise cash‑flow and P&L variances.</li>
										<li>Explain anomalies and suggest actions.</li>
										<li>Invoice Q&A and policy lookup (RAG).</li>
									</ul>
								</div>
								<div className="p-4 border border-base-300 rounded-xl">
									<h3 className="font-semibold">Operations & Risk</h3>
									<ul>
										<li>Summarise SOPs; highlight policy changes.</li>
										<li>Generate stakeholder updates and emails.</li>
										<li>
											Tabular risk models via AutoAI (late payment, churn).
										</li>
									</ul>
								</div>
							</div>
							<div className="mt-3">
								Implementation tip: keep a single Granite model for language
								tasks, add RAG when you have watsonx.data, and deploy AutoAI
								pipelines for structured predictions.
							</div>
						</SectionCard>
					)}

					{step === 8 && (
						<div className="space-y-5">
							{/* Knowledge Checks */}
							<QuizBlock
								title="Knowledge Check 1 — Concepts"
								questions={[
									{
										id: "k1q1",
										q: "Do foundation models require you to create a Deployment to call them?",
										options: ["Yes", "No"],
										correct: 1,
										explain:
											"Foundation models are already hosted; you call them with project_id + model_id.",
									},
									{
										id: "k1q2",
										q: "Which approach best grounds answers in your company PDFs?",
										options: ["Fine‑tune only", "RAG with a Vector Index"],
										correct: 1,
										explain:
											"RAG retrieves relevant chunks at query time; fine‑tune is for style/format.",
									},
								]}
							/>

							<QuizBlock
								title="Knowledge Check 2 — Workflow"
								questions={[
									{
										id: "k2q1",
										q: "Place these in order: Evaluate, Prompt, Project, Deploy.",
										options: [
											"Project → Prompt → Evaluate → Deploy",
											"Deploy → Prompt → Project → Evaluate",
										],
										correct: 0,
										explain:
											"Create/Use a Project, design prompts, evaluate, then deploy custom assets if needed.",
									},
									{
										id: "k2q2",
										q: "What do you deploy?",
										options: [
											"Experiments for foundation models",
											"Custom/tuned/AutoAI models you want to expose as an API",
										],
										correct: 1,
										explain:
											"Deployments wrap your custom assets as stable endpoints.",
									},
								]}
							/>

							<QuizBlock
								title="Knowledge Check 3 — Enterprise"
								questions={[
									{
										id: "k3q1",
										q: "What’s a safe place to keep runtime credentials?",
										options: ["In the browser", "On the server (backend)"],
										correct: 1,
										explain:
											"Never expose keys to the browser; call models via your backend.",
									},
									{
										id: "k3q2",
										q: "Best way to keep knowledge fresh without retraining?",
										options: [
											"Re‑fine‑tune weekly",
											"Update documents in the Vector Index (RAG)",
										],
										correct: 1,
										explain:
											"RAG lets you update knowledge by changing the docs.",
									},
								]}
							/>

							<SectionCard title="You’re done! What's next?">
								<ul>
									<li>
										Create a Project in Studio and try a prompt in Prompt Lab.
									</li>
									<li>
										If you have watsonx.data, set up Milvus and build a Vector
										Index.
									</li>
									<li>
										For structured predictions, try an AutoAI experiment and
										compare pipelines.
									</li>
									<li>Only deploy when you need a stable endpoint for apps.</li>
								</ul>
							</SectionCard>
						</div>
					)}

					{step === 9 && (
						<SectionCard title="Useful Resources & Links">
							<ul className="list-disc pl-5 space-y-2">
								<li>
									<a
										href="https://www.ibm.com/products/watsonx-ai"
										target="_blank"
										className="link link-primary"
									>
										IBM watsonx.ai Overview
									</a>
								</li>
								<li>
									<a
										href="https://www.ibm.com/docs/en/watsonx"
										target="_blank"
										className="link link-primary"
									>
										IBM watsonx Documentation
									</a>
								</li>
								<li>
									<a
										href="https://www.ibm.com/watsonx/resources"
										target="_blank"
										className="link link-primary"
									>
										Resource hub: whitepapers, blogs, case studies
									</a>
								</li>
								<li>
									<a
										href="https://www.youtube.com/watch?v=WZMJHh4yz6g"
										target="_blank"
										className="link link-primary"
									>
										Watsonx.ai Studio Tutorials (YouTube)
									</a>
								</li>
								<li>
									<a
										href="https://community.ibm.com/community/user/watsonx/home"
										target="_blank"
										className="link link-primary"
									>
										IBM Community — watsonx discussion forums
									</a>
								</li>
							</ul>
							<Callout tone="info">
								Bookmark these links and share with your team. They contain
								detailed step‑by‑step documentation, official videos, and
								real‑world case studies to deepen your learning.
							</Callout>
						</SectionCard>
					)}
				</main>
			</div>
		</div>
	);
}
