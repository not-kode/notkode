import { getTranslations } from 'next-intl/server';

export async function HeroMobilePhone() {
  const t = await getTranslations('Mockup');
  return (
    <div className="relative mx-auto w-[200px]">
      <div
        className="absolute -inset-6 rounded-[40px] pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(75,210,229,0.20) 0%, transparent 70%)',
          filter: 'blur(28px)',
        }}
      />
      <div
        className="relative rounded-[32px] overflow-hidden border-[8px]"
        style={{
          background: '#0a0a0f',
          borderColor: '#0a0a0f',
          boxShadow: '0 22px 60px -20px rgba(0,0,0,0.4), 0 8px 24px -8px rgba(75,210,229,0.20)',
        }}
      >
        <div className="aspect-[9/19.5] px-2.5 pt-7 pb-3" style={{ background: 'hsl(55 100% 97%)' }}>
          <div className="flex items-center justify-between px-1 mb-3">
            <span className="font-mono text-[8px] text-text-primary font-semibold">9:41</span>
            <div className="flex items-center gap-0.5">
              <div className="w-1 h-1 rounded-full bg-text-primary" />
              <div className="w-1 h-1 rounded-full bg-text-primary" />
              <div className="w-1 h-1 rounded-full bg-text-primary" />
            </div>
          </div>

          <div className="flex items-center gap-2 mb-3 px-1">
            <div className="w-5 h-5 rounded-md bg-primary flex items-center justify-center">
              <span className="text-white text-[7px] font-bold">N</span>
            </div>
            <div className="flex-1 text-left">
              <p className="text-[9px] font-semibold text-text-primary leading-none">{t('appNotifTitle')}</p>
              <p className="text-[6px] text-text-dim leading-none mt-0.5">{t('appNotifSub')}</p>
            </div>
            <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
          </div>

          <div className="space-y-1.5 text-left">
            <div
              className="rounded-md px-2 py-1.5"
              style={{
                background: 'rgba(75,210,229,0.10)',
                border: '1px solid rgba(75,210,229,0.18)',
              }}
            >
              <div className="flex items-center gap-1 mb-0.5">
                <span className="text-[7px] font-mono text-primary font-bold tracking-wider">IA</span>
                <span className="text-[6px] text-text-dim">{t('ago2min')}</span>
              </div>
              <p className="text-[7.5px] text-text-primary leading-snug">
                {t('notif1Text')}
              </p>
            </div>

            <div className="rounded-md px-2 py-1.5" style={{ background: 'rgba(25,25,24,0.03)' }}>
              <div className="flex items-center gap-1 mb-0.5">
                <span className="text-[7px] font-mono text-text-secondary font-bold tracking-wider">IA</span>
                <span className="text-[6px] text-text-dim">{t('ago12min')}</span>
              </div>
              <p className="text-[7.5px] text-text-primary leading-snug">
                {t('notif2Text')}
              </p>
            </div>

            <div className="rounded-md px-2 py-1.5" style={{ background: 'rgba(25,25,24,0.03)' }}>
              <div className="flex items-center gap-1 mb-0.5">
                <span className="text-[7px] font-mono text-text-secondary font-bold tracking-wider">IA</span>
                <span className="text-[6px] text-text-dim">{t('ago1h')}</span>
              </div>
              <p className="text-[7.5px] text-text-primary leading-snug">
                {t('notif3Text')}
              </p>
            </div>
          </div>
        </div>

        <div
          className="absolute top-1.5 left-1/2 -translate-x-1/2 w-14 h-4 rounded-full"
          style={{ background: '#0a0a0f' }}
        />
      </div>
    </div>
  );
}
