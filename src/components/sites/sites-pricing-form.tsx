'use client';

import { PricingForm } from '@/components/ui/pricing-form';
import { sitesPricingSchema } from './pricing-schema';

export function SitesPricingForm() {
  return <PricingForm schema={sitesPricingSchema} />;
}
