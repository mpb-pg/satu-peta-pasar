import { createFileRoute } from '@tanstack/react-router';
import MarketingMap from './-components/marketing-map';

export const Route = createFileRoute('/map/')({
  component: MarketingMap,
});
