'use client';

import { PricingForm } from '@/components/ui/pricing-form';
import { agentesPricingSchema } from './pricing-schema';

export function AgentesPricingForm() {
  return <PricingForm schema={agentesPricingSchema} />;
}
