'use client';

import { PricingForm } from '@/components/ui/pricing-form';
import { ecommercePricingSchema } from './pricing-schema';

export function EcommercePricingForm() {
  return <PricingForm schema={ecommercePricingSchema} />;
}
