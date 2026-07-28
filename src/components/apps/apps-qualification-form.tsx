'use client';

import { useTranslations } from 'next-intl';
import { QualificationForm, type QualificationSchema } from '@/components/ui/qualification-form';

export function AppsQualificationForm() {
  const t = useTranslations('Apps');
  const schema: QualificationSchema = {
    serviceTag: 'apps',
    whatsappMessage: t('qualWhatsappMessage'),
    successTitle: t('qualSuccessTitle'),
    successBody: t('qualSuccessBody'),
    needs: {
      title: t('qualNeedsTitle'),
      subtitle: t('qualNeedsSubtitle'),
      options: [
        { id: 'mobile',   label: t('qualNeedMobile') },
        { id: 'desktop',  label: t('qualNeedDesktop') },
        { id: 'web',      label: t('qualNeedWeb') },
        { id: 'whatsapp', label: t('qualNeedWhatsapp') },
        { id: 'evoluir',  label: t('qualNeedEvoluir') },
        { id: 'nao_sei',  label: t('qualNeedNaoSei') },
      ],
    },
    identity: {
      title: t('qualIdentityTitle'),
      subtitle: t('qualIdentitySubtitle'),
      companySizes: [t('qualSize1'), t('qualSize2'), t('qualSize3'), t('qualSize4')],
    },
    context: {
      title: t('qualContextTitle'),
      subtitle: t('qualContextSubtitle'),
      timings: [
        { id: 'decidido', label: t('qualTimingDecidido') },
        { id: '30dias',   label: t('qualTiming30dias') },
        { id: 'futuro',   label: t('qualTimingFuturo') },
        { id: 'pesquisa', label: t('qualTimingPesquisa') },
      ],
    },
  };
  return <QualificationForm schema={schema} />;
}
