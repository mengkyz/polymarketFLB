import { TerminalDashboard } from './components/TerminalDashboard';
import { fetchActiveMatches } from '../lib/api';

// Revalidate the server cache every 60 seconds to prevent rate-limiting
export const revalidate = 60;

export default async function Home() {
  // Fetch the initial market data.
  // We are passing "2" here as the tagId to specifically filter for Soccer matches.
  const initialMatches = await fetchActiveMatches('2');

  return (
    <main className="min-h-screen bg-black">
      <TerminalDashboard initialMatches={initialMatches} />
    </main>
  );
}
