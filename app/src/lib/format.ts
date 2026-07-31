import { formatUnits } from 'viem';

export function shortAddress(address: string, start = 6, end = 4) {
  if (address.length <= start + end + 1) return address;
  return `${address.slice(0, start)}…${address.slice(-end)}`;
}

export function formatTokenAmount(value: bigint, decimals: number, maximumFractionDigits = 4) {
  const raw = formatUnits(value, decimals);
  const [whole, fraction = ''] = raw.split('.');
  const trimmedFraction = fraction.slice(0, maximumFractionDigits).replace(/0+$/, '');
  return trimmedFraction ? `${whole}.${trimmedFraction}` : whole;
}

export function formatDeadline(timestamp: bigint) {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(Number(timestamp) * 1_000));
}

export function errorMessage(error: unknown) {
  if (!(error instanceof Error)) return 'Something went wrong. Try again.';
  const message = error.message.split('\n')[0]?.trim();
  if (!message) return 'Something went wrong. Try again.';
  if (/user rejected|user denied/i.test(message)) return 'The wallet request was rejected.';
  if (/insufficient funds/i.test(message)) return 'This wallet does not have enough ETH for gas.';
  return message.length > 180 ? `${message.slice(0, 177)}…` : message;
}
