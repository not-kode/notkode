import type { QualificationSchema } from '@/components/ui/qualification-form';

type TFn = (key: string) => string;

export function getSistemasQualificationSchema(t: TFn): QualificationSchema {
  return {
    serviceTag: 'sistemas-ia',
    whatsappMessage: t('qualWhatsappMessage'),
    successTitle: t('qualSuccessTitle'),
    needs: {
      title: t('qualNeedsTitle'),
      subtitle: t('qualNeedsSubtitle'),
      options: [
        { id: 'centralizar',  label: t('qualNeedCentralizar') },
        { id: 'crm',          label: t('qualNeedCrm') },
        { id: 'atendimento',  label: t('qualNeedAtendimento') },
        { id: 'operacao',     label: t('qualNeedOperacao') },
        { id: 'relatorios',   label: t('qualNeedRelatorios') },
        { id: 'nao_sei',      label: t('qualNeedNaoSei') },
      ],
    },
    identity: {},
    context: {
      title: t('qualContextTitle'),
      subtitle: t('qualContextSubtitle'),
      timings: [
        { id: 'imediato', label: t('qualTimingImediato') },
        { id: '30dias',   label: t('qualTiming30dias') },
        { id: '60dias',   label: t('qualTiming60dias') },
        { id: 'pesquisa', label: t('qualTimingPesquisa') },
      ],
    },
  };
}
