'use client';

import { useTranslations } from 'next-intl';
import { QualificationForm } from '@/components/ui/qualification-form';
import { getSistemasQualificationSchema } from './qualification-schema';

export function SistemasQualificationForm() {
  const t = useTranslations('SistemasIA');
  const schema = getSistemasQualificationSchema((k) => t(k as 'qualNeedsTitle'));
  return <QualificationForm schema={schema} />;
}
