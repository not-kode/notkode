// Detecção de robôs pelo user agent, usada na ingestão de analytics (/api/track)
// e de gravações (/api/rec). Crawlers e previews de link executam o site por ~1s
// e poluíam as Sessões e as métricas de visita com "sessões de 0s".
const BOT_RE =
  /bot|crawl|spider|slurp|headlesschrome|phantomjs|lighthouse|pingdom|uptimerobot|gtmetrix|facebookexternalhit|meta-externalagent|whatsapp|telegrambot|skypeuripreview|linkedinbot|twitterbot|discordbot|slackbot|embedly|vercel-screenshot|vercelbot|bytespider|petalbot|semrush|ahrefs|mj12bot|dotbot|applebot|amazonbot|yandex|baiduspider|duckduckbot|bingpreview/i;

/** true quando o user agent é de robô conhecido (ou está vazio, o que browser real não faz). */
export function isBotUA(ua: string | null): boolean {
  if (!ua || !ua.trim()) return true;
  return BOT_RE.test(ua);
}
