export default function TutorialPage() {
	return (
		<main>
			<h2 className="text-xl font-semibold">How to Build This</h2>
			<p className="mt-2">
				This page will walk users through using IBM SkillsBuild to create a
				similar app with AI features.
			</p>

			<section className="mt-8">
				<h3 className="text-lg font-title mb-4">Q&amp;A</h3>
				<div className="join join-vertical bg-base-100">
					<div className="collapse collapse-arrow join-item border-base-300 border">
						<input type="radio" name="my-accordion-4" defaultChecked />
						<div className="collapse-title font-semibold">
							How do I create an account?
						</div>
						<div className="collapse-content text-sm">
							Click the &quot;Sign Up&quot; button in the top right corner and
							follow the registration process.
						</div>
					</div>
					<div className="collapse collapse-arrow join-item border-base-300 border">
						<input type="radio" name="my-accordion-4" />
						<div className="collapse-title font-semibold">
							I forgot my password. What should I do?
						</div>
						<div className="collapse-content text-sm">
							Click on &quot;Forgot Password&quot; on the login page and follow
							the instructions sent to your email.
						</div>
					</div>
					<div className="collapse collapse-arrow join-item border-base-300 border">
						<input type="radio" name="my-accordion-4" />
						<div className="collapse-title font-semibold">
							How do I update my profile information?
						</div>
						<div className="collapse-content text-sm">
							Go to &quot;My Account&quot; settings and select &quot;Edit
							Profile&quot; to make changes.
						</div>
					</div>
				</div>
			</section>
		</main>
	);
}
