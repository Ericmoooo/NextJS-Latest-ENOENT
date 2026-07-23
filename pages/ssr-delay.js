import TestResult from "../components/testresult";

// L3/MC/L2 fixture: configurable server-side delay via ?ms=N (default 500, cap 5000).
// getServerSideProps runs on every request (SSR), so the delay becomes real origin TTFB
// the GlobalRouter measures. Drives the L2 TTFB cost term + 2s clamp, holds an L3 fetch
// slot for the whole delay (slow miss -> occupancy), and is the MC await-bound archetype.
export async function getServerSideProps(context) {
  const raw = parseInt(context.query.ms, 10);
  const ms = Number.isFinite(raw) ? Math.min(Math.max(raw, 0), 5000) : 500;
  await new Promise((resolve) => setTimeout(resolve, ms));
  return {
    props: {
      time: new Date().toISOString(),
      delayMs: ms,
    },
  };
}

export default function Page({ time, delayMs }) {
  const title = "SSR with configurable delay";
  if (!time) {
    return (
      <TestResult passed={false} title={title}>
        The prop 'time' was not found.
      </TestResult>
    );
  }
  return (
    <TestResult passed={true} title={title}>
      Rendered after a <b>{delayMs}ms</b> server-side delay at <b>{time}</b>.
    </TestResult>
  );
}
