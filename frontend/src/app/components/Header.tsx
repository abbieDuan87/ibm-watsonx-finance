import Link from "next/link";

export default function Header() {
	return (
		<header className="mb-6">
			<div className="navbar bg-base-200 rounded-box shadow">
				<div className="flex-1">
					<span className="text-2xl font-bold font-title tracking-wider">
						FinSight AI
					</span>
				</div>
				<div className="flex-none">
					<ul className="menu menu-horizontal px-1">
						<li>
							<Link href="/" className="font-medium btn hover:btn-link">
								Home
							</Link>
						</li>
						<li>
							<Link href="/upload" className="font-medium btn hover:btn-link">
								Upload
							</Link>
						</li>
						<li>
							<Link href="/insights" className="font-medium btn hover:btn-link">
								Insights
							</Link>
						</li>
						<li>
							<Link href="/tutorial" className="font-medium btn hover:btn-link">
								Tutorial
							</Link>
						</li>
					</ul>
				</div>
			</div>
		</header>
	);
}
