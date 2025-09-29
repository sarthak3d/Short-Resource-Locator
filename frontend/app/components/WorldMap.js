'use client';

import { useState, useMemo } from 'react';
import { ComposableMap, Geographies, Geography } from 'react-simple-maps';
import styles from './WorldMap.module.css';

const GEO_URL = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json';

// ISO 3166-1 numeric -> alpha-2
const NUM_TO_A2 = {
  "4":"AF","8":"AL","12":"DZ","20":"AD","24":"AO","31":"AZ","32":"AR","36":"AU",
  "40":"AT","48":"BH","50":"BD","56":"BE","64":"BT","68":"BO","70":"BA","72":"BW",
  "76":"BR","84":"BZ","90":"SB","96":"BN","100":"BG","104":"MM","108":"BI",
  "112":"BY","116":"KH","120":"CM","124":"CA","132":"CV","136":"KY","140":"CF",
  "144":"LK","148":"TD","152":"CL","156":"CN","170":"CO","174":"KM","180":"CD",
  "188":"CR","191":"HR","192":"CU","196":"CY","203":"CZ","204":"BJ","208":"DK",
  "218":"EC","222":"SV","226":"GQ","231":"ET","232":"ER","233":"EE","242":"FJ",
  "246":"FI","250":"FR","254":"GF","262":"DJ","266":"GA","268":"GE","270":"GM",
  "275":"PS","276":"DE","288":"GH","300":"GR","320":"GT","324":"GN","328":"GY",
  "332":"HT","336":"VA","340":"HN","348":"HU","352":"IS","356":"IN","360":"ID",
  "364":"IR","368":"IQ","372":"IE","376":"IL","380":"IT","388":"JM","392":"JP",
  "398":"KZ","400":"JO","404":"KE","408":"KP","410":"KR","414":"KW","417":"KG",
  "418":"LA","422":"LB","426":"LS","428":"LV","430":"LR","434":"LY","440":"LT",
  "442":"LU","450":"MG","454":"MW","458":"MY","462":"MV","466":"ML","470":"MT",
  "478":"MR","480":"MU","484":"MX","496":"MN","498":"MD","499":"ME","504":"MA",
  "508":"MZ","512":"OM","516":"NA","524":"NP","528":"NL","540":"NC","548":"VU",
  "554":"NZ","558":"NI","562":"NE","566":"NG","578":"NO","586":"PK","591":"PA",
  "598":"PG","600":"PY","604":"PE","608":"PH","616":"PL","620":"PT","624":"GW",
  "630":"PR","634":"QA","642":"RO","643":"RU","646":"RW","678":"ST","682":"SA",
  "686":"SN","688":"RS","690":"SC","694":"SL","702":"SG","703":"SK","704":"VN",
  "705":"SI","706":"SO","710":"ZA","716":"ZW","720":"YE","724":"ES","728":"SS",
  "729":"SD","740":"SR","748":"SZ","752":"SE","756":"CH","760":"SY","762":"TJ",
  "764":"TH","768":"TG","776":"TO","780":"TT","784":"AE","788":"TN","792":"TR",
  "795":"TM","800":"UG","804":"UA","807":"MK","818":"EG","826":"GB","834":"TZ",
  "840":"US","854":"BF","858":"UY","860":"UZ","862":"VE","882":"WS","887":"YE",
  "894":"ZM","158":"TW",
};

const COUNTRY_NAMES = {
  US:"United States",GB:"United Kingdom",DE:"Germany",FR:"France",IN:"India",
  CN:"China",JP:"Japan",BR:"Brazil",AU:"Australia",CA:"Canada",RU:"Russia",
  KR:"South Korea",MX:"Mexico",ID:"Indonesia",NG:"Nigeria",ZA:"South Africa",
  AR:"Argentina",EG:"Egypt",TR:"Turkey",SA:"Saudi Arabia",IT:"Italy",ES:"Spain",
  PL:"Poland",NL:"Netherlands",SE:"Sweden",PH:"Philippines",TH:"Thailand",
  VN:"Vietnam",PK:"Pakistan",BD:"Bangladesh",UA:"Ukraine",CL:"Chile",
  CO:"Colombia",KE:"Kenya",GH:"Ghana",SG:"Singapore",AE:"UAE",IL:"Israel",
  MY:"Malaysia",NZ:"New Zealand",
};

export function getCountryName(code) {
  if (!code) return '--';
  const upper = code.toUpperCase().trim();
  return COUNTRY_NAMES[upper] || upper;
}

export default function WorldMap({ data = [] }) {
  const [hoveredCountry, setHoveredCountry] = useState(null);

  const countryMap = useMemo(() => {
    const map = {};
    data.forEach(item => {
      const key = item.name?.toUpperCase()?.trim();
      if (key && key !== '(DIRECT)') map[key] = item.count;
    });
    return map;
  }, [data]);

  const hasData = Object.keys(countryMap).length > 0;
  const maxCount = useMemo(() => Math.max(...Object.values(countryMap), 1), [countryMap]);
  const minCount = useMemo(() => Math.min(...Object.values(countryMap).filter(v => v > 0), 0), [countryMap]);

  const getColor = (numericId) => {
    const alpha2 = NUM_TO_A2[String(numericId)];
    if (!alpha2) return 'var(--surface-container-high)';
    const count = countryMap[alpha2];
    if (!count) return 'var(--surface-container-high)';
    const intensity = Math.max(0.15, Math.min(1, count / maxCount));
    return `rgba(59, 130, 246, ${intensity})`;
  };

  const hoveredInfo = useMemo(() => {
    if (!hoveredCountry) return null;
    return {
      name: getCountryName(hoveredCountry),
      count: countryMap[hoveredCountry] || 0,
    };
  }, [hoveredCountry, countryMap]);

  return (
    <div className={styles.mapContainer}>
      <ComposableMap
        projectionConfig={{ scale: 147, center: [10, 0] }}
        style={{ width: '100%', height: 'auto' }}
      >
        <Geographies geography={GEO_URL}>
          {({ geographies }) =>
            geographies.map((geo) => {
              const alpha2 = NUM_TO_A2[String(geo.id)];
              const isHovered = hasData && hoveredCountry === alpha2;
              return (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  fill={isHovered ? 'rgba(59,130,246,0.9)' : getColor(geo.id)}
                  stroke="var(--bg)"
                  strokeWidth={0.4}
                  style={{
                    default: { outline: 'none' },
                    hover:   { outline: 'none' },
                    pressed: { outline: 'none' },
                  }}
                  onMouseEnter={() => hasData && alpha2 && setHoveredCountry(alpha2)}
                  onMouseLeave={() => setHoveredCountry(null)}
                />
              );
            })
          }
        </Geographies>
      </ComposableMap>

      {!hasData && (
        <div className={styles.emptyLabel}>
          No geographic data available
        </div>
      )}

      {hoveredInfo && hoveredInfo.count > 0 && (
        <div className={styles.tooltip}>
          <span className={styles.tooltipCountry}>{hoveredInfo.name}</span>
          <span className={styles.tooltipCount}>{hoveredInfo.count.toLocaleString()} clicks</span>
        </div>
      )}

      {hasData && (
        <div className={styles.legend}>
          <span className={styles.legendLabel}>{minCount}</span>
          <div className={styles.legendGradient} />
          <span className={styles.legendLabel}>{maxCount}</span>
        </div>
      )}
    </div>
  );
}
