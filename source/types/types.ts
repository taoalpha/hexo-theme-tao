export { };

declare global {
  interface Window {
    animateCSS(el: string | Element, name: string[], prefix?: string): Promise<unknown>;
    getLocation(): Promise<void>;
    randomImage(force?: boolean, retry?: number): Promise<void>;
    updateWeather(position: any, flag?: string): Promise<{}>;
    randomTags(): void;
    getPageViewCount(): Promise<void>;
    getGALogFile(): Promise<void>;
    showAlert(status: string, msg: string): void;
  }

  interface Settings {
    enableLocation?: boolean;
    weatherData?: WeatherData;
    imgUrls?: {
      [key: string]: string;
    };
    cLocation?: string;
    lastUpdate?: {
      [key: string]: string;
    };
    pixabayHits?: PixabayHitImage[];
  }

  interface WeatherData {
    name: string;
    dt: number;
    weather: WeatherInfo[];
  }

  interface WeatherInfo {
    description: string;
    main: string;
  }

  interface PixabayHitImage {
    largeImageURL: string;
  }

  interface GaPageViewData {
    rows: GaPageViewRow[];
  }

  type GaPageViewRow = [string, string];

  interface GaLogFile {
    totalsForAllResults: {
      "ga:pageviews": string;
      "ga:uniquePageviews": string;
    };
    totalResults: number;

    rows: {
      // referer, browser, os, country, domain, path, unknown, pv, uv
      [key: string]: [string, string, string, string, string, string, string, string, string];
    }
  }
}