import { TerminalDashboard } from './components/TerminalDashboard';
import { fetchActiveMatches } from '../lib/api';

export default async function Home() {
  const initialMatches = await fetchActiveMatches();

  return (
    <main className="min-h-screen bg-black">
      <TerminalDashboard initialMatches={initialMatches} />
    </main>
  );
}
