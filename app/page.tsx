import { TerminalDashboard } from './components/TerminalDashboard';
import { fetchActiveMatches } from '../lib/api';

export default async function Home() {
  // Start the terminal on the "Live" URL path
  const initialMatches = await fetchActiveMatches({ sportSlug: 'live' });

  return (
    <main className="min-h-screen bg-[#15191d]">
      <TerminalDashboard initialMatches={initialMatches} />
    </main>
  );
}
