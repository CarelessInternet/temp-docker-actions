export const dynamic = 'force-dynamic';

export default function Web() {
	console.log(`Private testing env: "${process.env.TESTING_ENV}"`);

	return (
		<div>
			<h1>Hello world!!!</h1>
			<h2>Testing env: "{process.env.NEXT_PUBLIC_TESTING_ENV}"</h2>
		</div>
	);
}
