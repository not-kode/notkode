'use client';

import { QualificationForm } from '@/components/ui/qualification-form';
import { agentesQualificationSchema } from './qualification-schema';

// Agentes & Automação não tem preço fixo — usa qualificação, igual "Sistemas com IA".
export function AgentesPricingForm() {
  return <QualificationForm schema={agentesQualificationSchema} />;
}
