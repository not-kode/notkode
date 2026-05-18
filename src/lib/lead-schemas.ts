import type { PricingSchema } from '@/components/ui/pricing-form';
import { ecommercePricingSchema } from '@/components/ecommerce/pricing-schema';
import { agentesPricingSchema } from '@/components/agentes-automacao/pricing-schema';
import { sitesPricingSchema } from '@/components/sites/pricing-schema';
import { brandbookPricingSchema } from '@/components/brandbook/pricing-schema';

const REGISTRY: Record<string, PricingSchema> = {
  ecommerce:           ecommercePricingSchema,
  'agentes-automacao': agentesPricingSchema,
  sites:               sitesPricingSchema,
  brandbook:           brandbookPricingSchema,
};

export function getPricingSchema(serviceTag: string): PricingSchema | null {
  return REGISTRY[serviceTag] ?? null;
}
