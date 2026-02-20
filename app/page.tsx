import { TerminalDashboard } from './components/TerminalDashboard';
import { fetchActiveMatches } from '../lib/api';

export default async function Home() {
  // By default, fetch matches that resolve today or in the future
  const today = new Date();
  const initialMatches = await fetchActiveMatches({
    endDateMin: today.toISOString(),
  });

  return (
    <main className="min-h-screen bg-black">
      <TerminalDashboard initialMatches={initialMatches} />
    </main>
  );
}
