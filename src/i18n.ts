// Internationalization: English + Traditional Chinese (繁體中文).

export type Lang = 'en' | 'zh'

export interface Translation {
  appTitle: string

  // tabs
  tabSearch: string
  tabFilters: string
  tabStats: string
  tabTools: string
  tabPhotos: string

  // search tab
  searchPlaceholder: string
  noTreesFound: string
  treesUnit: string
  speciesUnit: string
  searchHint: string
  showOnMap: string
  chineseName: string
  treeId: string
  coordinates: string
  remarks: string
  locate: string
  share: string
  idAbbr: string

  // filters tab
  displayOptions: string
  treeMarkers: string
  photoViewpoints: string
  clusterTrees: string
  showTreeLabels: string
  labelType: string
  labelShort: string
  labelChinese: string
  speciesFilter: string
  searchSpecies: string
  selectAll: string

  // stats tab
  totalTrees: string
  speciesCount: string
  photoPoints: string
  colSpecies: string
  colTreeCount: string

  // tools tab
  measurementTools: string
  measureHint: string
  distance: string
  area: string
  undo: string
  clear: string
  coordinateSystem: string
  wgs84: string
  hk1980: string
  exportData: string
  print: string

  // legend
  legend: string
  tree: string
  photoViewpoint: string
  nameType: string
  nameShort: string
  nameFull: string
  nameChinese: string
  groupBy: string
  groupNone: string
  groupFamily: string
  groupGenus: string
  selectAllShort: string
  unselectAll: string

  // weather
  weather: string
  partlyCloudy: string
  humidity: string

  // controls
  backToHome: string
  zoomIn: string
  zoomOut: string
  mapLayers: string
  baseMap: string
  streetMap: string
  satellite: string
  topographic: string
  fitAllTrees: string
  myLocation: string
  switchLanguage: string

  // popups / map
  chinese: string
  id: string
  rotation: string
  photo: string
  imageNotAvailable: string
  measurement: string
  radius: string
  yourLocation: string
  color: string

  // alerts
  mapLinkCopied: string
  treeLinkCopied: string
  geolocationNotSupported: string
  unableToGetLocation: string

  // status
  loadingMapData: string
  failedToLoad: string
}

const en: Translation = {
  appTitle: 'WKCD Tree Map',

  tabSearch: 'Search',
  tabFilters: 'Filters',
  tabStats: 'Stats',
  tabTools: 'Tools',
  tabPhotos: 'Photos',

  searchPlaceholder: 'Search by botanical or Chinese name...',
  noTreesFound: 'No trees found',
  treesUnit: 'trees',
  speciesUnit: 'species',
  searchHint: 'Matching trees are highlighted on the map; others are dimmed.',
  showOnMap: 'Show on map',
  chineseName: 'Chinese Name',
  treeId: 'Tree ID',
  coordinates: 'Coordinates',
  remarks: 'Remarks',
  locate: 'Locate',
  share: 'Share',
  idAbbr: 'ID',

  displayOptions: 'Display Options',
  treeMarkers: 'Tree Markers',
  photoViewpoints: 'Photo Viewpoints',
  clusterTrees: 'Cluster Trees',
  showTreeLabels: 'Show Tree Labels',
  labelType: 'Label Type:',
  labelShort: 'Short Scientific',
  labelChinese: 'Chinese Name',
  speciesFilter: 'Species Filter',
  searchSpecies: 'Search species...',
  selectAll: 'Select All',

  totalTrees: 'Total Trees',
  speciesCount: 'Species',
  photoPoints: 'Photo Points',
  colSpecies: 'Species',
  colTreeCount: 'Tree Count',

  measurementTools: 'Measurement Tools',
  measureHint:
    'Pick a tool, click points on the map, then double-click (or click the last point) to finish. Click a shape to see its measurement; Clear removes them.',
  distance: 'Distance',
  area: 'Area',
  undo: 'Undo',
  clear: 'Clear',
  coordinateSystem: 'Coordinate System',
  wgs84: 'WGS84',
  hk1980: 'HK1980 Grid',
  exportData: 'Export Data',
  print: 'Print',

  legend: 'Legend',
  tree: 'Tree',
  photoViewpoint: 'Photo Viewpoint',
  nameType: 'Name Type:',
  nameShort: 'Short Scientific',
  nameFull: 'Full Scientific',
  nameChinese: 'Chinese Name',
  groupBy: 'Group by:',
  groupNone: 'None',
  groupFamily: 'Family',
  groupGenus: 'Genus',
  selectAllShort: 'Select all',
  unselectAll: 'Unselect all',

  weather: 'Weather',
  partlyCloudy: 'Partly Cloudy',
  humidity: 'Humidity',

  backToHome: 'Back to home',
  zoomIn: 'Zoom in',
  zoomOut: 'Zoom out',
  mapLayers: 'Map layers',
  baseMap: 'Base Map',
  streetMap: 'Street Map',
  satellite: 'Satellite',
  topographic: 'Topographic',
  fitAllTrees: 'Fit all trees',
  myLocation: 'My location',
  switchLanguage: 'Switch language / 切換語言',

  chinese: 'Chinese',
  id: 'ID',
  rotation: 'Rotation',
  photo: 'Photo',
  imageNotAvailable: 'Image not available',
  measurement: 'Measurement',
  radius: 'Radius',
  yourLocation: 'Your location',
  color: 'Colour',

  mapLinkCopied: 'Map link copied to clipboard!',
  treeLinkCopied: 'Tree link copied to clipboard!',
  geolocationNotSupported: 'Geolocation not supported',
  unableToGetLocation: 'Unable to get your location',

  loadingMapData: 'Loading map data…',
  failedToLoad: 'Failed to load map data.',
}

const zh: Translation = {
  appTitle: '西九文化區樹木地圖',

  tabSearch: '搜尋',
  tabFilters: '篩選',
  tabStats: '統計',
  tabTools: '工具',
  tabPhotos: '相片',

  searchPlaceholder: '以學名或中文名搜尋…',
  noTreesFound: '找不到樹木',
  treesUnit: '棵樹',
  speciesUnit: '物種',
  searchHint: '相符的樹木會在地圖上突顯，其餘會變淡。',
  showOnMap: '在地圖顯示',
  chineseName: '中文名稱',
  treeId: '樹木編號',
  coordinates: '座標',
  remarks: '備註',
  locate: '定位',
  share: '分享',
  idAbbr: '編號',

  displayOptions: '顯示選項',
  treeMarkers: '樹木標記',
  photoViewpoints: '相片視點',
  clusterTrees: '群組樹木',
  showTreeLabels: '顯示樹木標籤',
  labelType: '標籤類型：',
  labelShort: '學名縮寫',
  labelChinese: '中文名稱',
  speciesFilter: '物種篩選',
  searchSpecies: '搜尋物種…',
  selectAll: '全選',

  totalTrees: '樹木總數',
  speciesCount: '物種數目',
  photoPoints: '相片點',
  colSpecies: '物種',
  colTreeCount: '樹木數量',

  measurementTools: '測量工具',
  measureHint:
    '選擇工具後，在地圖上按點，然後雙擊（或按最後一點）完成。點按圖形可顯示測量結果；「清除」可移除。',
  distance: '距離',
  area: '面積',
  undo: '復原',
  clear: '清除',
  coordinateSystem: '座標系統',
  wgs84: 'WGS84',
  hk1980: '香港1980格網',
  exportData: '匯出資料',
  print: '列印',

  legend: '圖例',
  tree: '樹木',
  photoViewpoint: '相片視點',
  nameType: '名稱類型：',
  nameShort: '學名縮寫',
  nameFull: '完整學名',
  nameChinese: '中文名稱',
  groupBy: '分組方式：',
  groupNone: '不分組',
  groupFamily: '科',
  groupGenus: '屬',
  selectAllShort: '全選',
  unselectAll: '全部取消',

  weather: '天氣',
  partlyCloudy: '部分多雲',
  humidity: '濕度',

  backToHome: '返回主頁',
  zoomIn: '放大',
  zoomOut: '縮小',
  mapLayers: '地圖圖層',
  baseMap: '底圖',
  streetMap: '街道圖',
  satellite: '衛星圖',
  topographic: '地形圖',
  fitAllTrees: '顯示所有樹木',
  myLocation: '我的位置',
  switchLanguage: 'Switch language / 切換語言',

  chinese: '中文',
  id: '編號',
  rotation: '旋轉角度',
  photo: '相片',
  imageNotAvailable: '圖片無法顯示',
  measurement: '測量',
  radius: '半徑',
  yourLocation: '您的位置',
  color: '顏色',

  mapLinkCopied: '地圖連結已複製到剪貼簿！',
  treeLinkCopied: '樹木連結已複製到剪貼簿！',
  geolocationNotSupported: '不支援地理定位',
  unableToGetLocation: '無法取得您的位置',

  loadingMapData: '正在載入地圖資料…',
  failedToLoad: '載入地圖資料失敗。',
}

export const translations: Record<Lang, Translation> = { en, zh }

const STORAGE_KEY = 'wkcd-lang'

/** Detect initial language: stored choice → browser preference → English. */
export function detectLang(): Lang {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored === 'en' || stored === 'zh') return stored
  } catch {
    // localStorage unavailable — fall through to browser detection.
  }
  const langs = navigator.languages ?? [navigator.language]
  for (const l of langs) {
    if (l && l.toLowerCase().startsWith('zh')) return 'zh'
  }
  return 'en'
}

export function persistLang(lang: Lang): void {
  try {
    localStorage.setItem(STORAGE_KEY, lang)
  } catch {
    // ignore persistence failures
  }
}
