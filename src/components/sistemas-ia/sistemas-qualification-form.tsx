'use client';

import { QualificationForm } from '@/components/ui/qualification-form';
import { sistemasQualificationSchema } from './qualification-schema';

export function SistemasQualificationForm() {
  return <QualificationForm schema={sistemasQualificationSchema} />;
}
