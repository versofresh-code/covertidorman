export default async function handler(req, res) {
  // Configurar CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Content-Type', 'application/vnd.apple.mpegurl');
  res.setHeader('Content-Disposition', 'attachment; filename="playlist.m3u8"');
  
  // Manejar preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  // URLs por defecto
  const defaultUrls = [
    'http://gultv.com:8080/live/Moneda422/Rapido23/61678.m3u8',
    'http://gultv.com:8080/live/Moneda422/Rapido23/61679.m3u8',
    'http://gultv.com:8080/live/Moneda422/Rapido23/61683.m3u8',
    'http://gultv.com:8080/live/Moneda422/Rapido23/61684.m3u8'
  ];
  
  let urlList = defaultUrls;
  let playlistName = 'Mi Lista M3U8';
  
  // Si vienen parámetros por GET
  if (req.method === 'GET') {
    if (req.query.urls) {
      try {
        urlList = JSON.parse(req.query.urls);
      } catch {
        urlList = req.query.urls.split(',');
      }
    }
    if (req.query.name) {
      playlistName = decodeURIComponent(req.query.name);
    }
  }
  
  // Si vienen por POST
  if (req.method === 'POST') {
    const { urls, name } = req.body;
    if (urls) {
      urlList = urls;
    }
    if (name) {
      playlistName = name;
    }
  }
  
  // Generar contenido M3U8 compatible con Google APIs
  let m3u8Content = '#EXTM3U\n';
  m3u8Content += `#PLAYLIST:${playlistName}\n`;
  m3u8Content += `#GENERATED:${new Date().toISOString()}\n`;
  m3u8Content += `#VERSION:3\n`;
  m3u8Content += `#ALLOW-CACHE:YES\n\n`;
  
  urlList.forEach((url, index) => {
    const channelNumber = (index + 1).toString().padStart(2, '0');
    const channelName = `Canal ${channelNumber}`;
    const tvgId = `channel_${channelNumber}`;
    const tvgName = encodeURIComponent(channelName);
    const groupTitle = encodeURIComponent('General');
    
    // Formato M3U8 compatible con la mayoría de players
    m3u8Content += `#EXTINF:-1 tvg-id="${tvgId}" tvg-name="${channelName}" tvg-logo="" group-title="General",${channelName}\n`;
    m3u8Content += `${url}\n`;
  });
  
  // Enviar respuesta
  return res.status(200).send(m3u8Content);
}