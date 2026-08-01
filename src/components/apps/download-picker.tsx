'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Download, Apple, Monitor } from 'lucide-react';
import { Reveal } from '@/components/ui/reveal';
import type { AppDownload, DownloadTarget } from '@/data/downloads';

/**
 * Detecta a plataforma no cliente para destacar o arquivo certo.
 *
 * Distinguir Apple Silicon de Intel só é possível de lado: o user agent mente
 * (todo Mac se anuncia como Intel), então a pista é a GPU exposta pelo WebGL —
 * num Mac Intel o renderer traz "Intel", num Apple Silicon traz "Apple".
 * Quando nada é conclusivo, ninguém é destacado e as três opções ficam iguais.
 */
function detectTarget(): DownloadTarget | null {
  try {
    const ua = navigator.userAgent;
    if (/Windows/i.test(ua)) return 'windows';
    if (!/Mac/i.test(navigator.platform || ua)) return null;

    const canvas = document.createElement('canvas');
    const gl = (canvas.getContext('webgl') ||
      canvas.getContext('experimental-webgl')) as WebGLRenderingContext | null;
    const dbg = gl?.getExtension('WEBGL_debug_renderer_info');
    const renderer = dbg ? String(gl!.getParameter(dbg.UNMASKED_RENDERER_WEBGL)) : '';

    return /intel/i.test(renderer) ? 'mac-intel' : 'mac-arm';
  } catch {
    return null;
  }
}

const ICON: Record<DownloadTarget, typeof Apple> = {
  'mac-arm': Apple,
  'mac-intel': Apple,
  windows: Monitor,
};

export type DownloadPickerProps = {
  downloads: AppDownload[];
  /** Namespace de onde saem os rótulos específicos do app (ex.: 'AppFala'). */
  namespace: string;
};

export function DownloadPicker({ downloads, namespace }: DownloadPickerProps) {
  const t = useTranslations(namespace);
  const tc = useTranslations('Downloads');
  const [detected, setDetected] = useState<DownloadTarget | null>(null);

  // Só depois da montagem: no servidor não existe navigator, e adivinhar no HTML
  // inicial faria o destaque piscar no lugar errado até a hidratação.
  useEffect(() => setDetected(detectTarget()), []);

  return (
    <>
      <Reveal>
        <p className="text-[16px] lg:text-[17px] text-text-secondary leading-[1.6] mb-8 lg:mb-10">
          {detected ? tc(`detected.${detected}`) : tc('chooseYours')}
        </p>
      </Reveal>

      <div className="grid md:grid-cols-3 gap-5 lg:gap-6">
        {downloads.map((d, i) => {
          const Icon = ICON[d.target];
          const isPick = detected === d.target;

          return (
            <Reveal key={d.target} delay={i * 90}>
              <div
                className="relative flex flex-col h-full rounded-2xl p-6 lg:p-7 transition-all duration-300"
                style={{
                  background: 'hsl(55 100% 97%)',
                  border: isPick
                    ? '1px solid rgba(59,130,246,0.45)'
                    : '1px solid rgba(25,25,24,0.08)',
                  boxShadow: isPick
                    ? '0 10px 34px -14px rgba(59,130,246,0.45)'
                    : '0 6px 20px -10px rgba(0,0,0,0.06)',
                }}
              >
                {isPick && (
                  <span className="absolute -top-2.5 left-6 font-mono text-[10px] uppercase tracking-widest px-2.5 py-1 rounded-md bg-primary text-white">
                    {tc('recommendedForYou')}
                  </span>
                )}
                {d.beta && (
                  <span
                    className="absolute -top-2.5 right-6 font-mono text-[10px] uppercase tracking-widest px-2.5 py-1 rounded-md text-text-primary"
                    style={{ background: '#F59E0B' }}
                  >
                    {tc('beta')}
                  </span>
                )}

                <Icon className="w-7 h-7 text-primary mb-4" strokeWidth={1.6} />

                <h3 className="text-[18px] lg:text-[19px] font-semibold tracking-tight text-text-primary mb-2">
                  {tc(`targets.${d.target}`)}
                </h3>

                <p className="text-[14px] lg:text-[15px] text-text-secondary leading-[1.6] mb-6 flex-1">
                  {t(`downloadNotes.${d.target}`)}
                </p>

                <a
                  href={d.url}
                  data-cta={`download/${namespace}/${d.target}`}
                  className="inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 font-bricolage text-[13px] font-bold uppercase tracking-wide transition-all duration-200 hover:-translate-y-0.5"
                  style={
                    isPick
                      ? { background: '#3B82F6', color: '#fff' }
                      : { background: 'rgba(25,25,24,0.05)', color: 'hsl(60 2% 10%)' }
                  }
                >
                  <Download className="w-4 h-4" strokeWidth={2} />
                  {d.beta ? tc('ctaBeta') : tc('cta')}
                </a>

                <span className="font-mono text-[11px] text-text-secondary mt-3">
                  {d.format} · {d.size} · {d.requirement}
                </span>
              </div>
            </Reveal>
          );
        })}
      </div>
    </>
  );
}
