'use client';

import { useTranslations } from 'next-intl';
import { QualificationForm, type QualificationSchema } from '@/components/ui/qualification-form';

export function ParceriasQualificationForm() {
  const t = useTranslations('Parcerias');
  const schema: QualificationSchema = {
    serviceTag: 'parcerias',
    whatsappMessage: t('qualWhatsappMessage'),
    successTitle: t('qualSuccessTitle'),
    successBody: t('qualSuccessBody'),
    needs: {
      title: t('qualNeedsTitle'),
      subtitle: t('qualNeedsSubtitle'),
      options: [
        { id: 'sites',      label: t('qualNeedSites') },
        { id: 'ecommerce',  label: t('qualNeedEcommerce') },
        { id: 'sistemas',   label: t('qualNeedSistemas') },
        { id: 'agentes',    label: t('qualNeedAgentes') },
        { id: 'identidade', label: t('qualNeedIdentidade') },
        { id: 'nao_sei',    label: t('qualNeedNaoSei') },
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
        { id: 'tenho_demanda', label: t('qualTimingDemanda') },
        { id: '30dias',        label: t('qualTiming30dias') },
        { id: 'futuro',        label: t('qualTimingFuturo') },
        { id: 'pesquisa',      label: t('qualTimingPesquisa') },
      ],
    },
  };
  return <QualificationForm schema={schema} />;
}
