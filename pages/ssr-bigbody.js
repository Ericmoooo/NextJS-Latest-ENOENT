import TestResult from "../components/testresult";

// L2/MC fixture: configurable response body size via ?kb=N (default 100, cap 20000).
// Pads the SSR HTML with N KB of filler so the response drives the L2 egress cost term
// (2000 * GB) and pins the GB divisor (1e9 vs 2^30). Also a body-generation MC point.
export async function getServerSideProps(context) {
  const raw = parseInt(context.query.kb, 10);
  const kb = Number.isFinite(raw) ? Math.min(Math.max(raw, 0), 20000) : 100;
  // 'a' repeated kb*1024 times; deterministic, incompressible-enough for a size signal.
  const filler = "a".repeat(kb * 1024);
  return {
    props: {
      time: new Date().toISOString(),
      kb,
      filler,
    },
  };
}

export default function Page({ time, kb, filler }) {
  const title = "SSR with configurable body size";
  if (!time) {
    return (
      <TestResult passed={false} title={title}>
        The prop 'time' was not found.
      </TestResult>
    );
  }
  return (
    <TestResult passed={true} title={title}>
      Response padded with <b>{kb} KB</b> at <b>{time}</b>.
      <span style={{ display: "none" }}>{filler}</span>
    </TestResult>
  );
}

// build-trigger: redeploy to new gb env for MC isolation
