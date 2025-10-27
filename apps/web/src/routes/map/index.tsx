import { createFileRoute } from '@tanstack/react-router';
// import MarketingMap from './marketing-map';

export const Route = createFileRoute('/map/')({
  component: MarketingMap,
});

function MarketingMap() {
  return <div>Marketing Map Page</div>;
}
