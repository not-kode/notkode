'use client';

import { PricingForm } from '@/components/ui/pricing-form';
import { brandbookPricingSchema } from './pricing-schema';

export function BrandbookPricingForm() {
  return <PricingForm schema={brandbookPricingSchema} />;
}
