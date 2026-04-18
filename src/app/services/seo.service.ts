
import { Inject, Injectable, Renderer2, DOCUMENT } from "@angular/core";
import { Meta } from "@angular/platform-browser";
import { Router } from "@angular/router";
import { normalizeCity } from "../shared/utils/city-normalizer";

@Injectable({
  providedIn: "root",
})
export class SeoService {
  constructor(
    private meta: Meta,
    @Inject(DOCUMENT) private _document: Document,
    private router: Router
  ) {}

  updateTags(data: any) {
    // Auto-inject og:site_name if not already present
    const hasSiteName = data.some((el: any) => el.property === 'og:site_name');
    if (!hasSiteName) {
      data.push({ property: 'og:site_name', content: 'NectarPlus Health' });
    }
    data.forEach((element: any) => {
      this.meta.updateTag(element);
    });
  }

  setCanonicalUrl(explicitUrl?: string) {
    let url: string;
    if (explicitUrl) {
      url = explicitUrl;
    } else {
      let currentUrl = this.router.url.split("?")[0];

      // Normalize city segment to canonical slug if present
      const segments = currentUrl.split('/').filter(Boolean);
      if (segments.length > 0) {
        const potentialCity = segments[0];
        const canonical = normalizeCity(potentialCity);
        if (canonical && canonical !== potentialCity) {
          segments[0] = canonical;
          currentUrl = '/' + segments.join('/');
        }
      }

      url = "https://nectarplus.health" + currentUrl;
    }

    const head = this._document.head || this._document.getElementsByTagName("head")[0];

    let element: HTMLLinkElement =
      this._document.querySelector(`link[rel='canonical']`) || null;

    if (element == null) {
      element = this._document.createElement("link") as HTMLLinkElement;
      head.appendChild(element);
    }

    element.setAttribute("rel", "canonical");
    element.setAttribute("href", url);
  }

  noIndexRobot() {
    this.meta.updateTag({ name: "robots", content: "noindex, nofollow" });
  }

  indexAndFollowRobot() {
    this.meta.updateTag({ name: "robots", content: "index, follow" });
  }

  /**
   * Sets JSON-LD structured data in <head>.
   * Works on both initial render and browser platforms.
   * Appends a new script tag (does NOT remove existing schemas).
   * Use a unique schemaId to update a specific schema without removing others.
   */
  setJsonLd(renderer: Renderer2, data: any, schemaId?: string): void {
    const id = schemaId || 'schema-' + (data['@type'] || 'default').toLowerCase();

    // Remove only the script with this specific id (not all JSON-LD scripts)
    const existing = this._document.querySelector(`script[id="${id}"]`);
    if (existing) {
      existing.remove();
    }

    const script = renderer.createElement('script');
    renderer.setAttribute(script, 'id', id);
    renderer.setAttribute(script, 'type', 'application/ld+json');

    const jsonText = renderer.createText(JSON.stringify(data));
    renderer.appendChild(script, jsonText);

    const head = this._document.head || this._document.getElementsByTagName('head')[0];
    renderer.appendChild(head, script);
  }

  /**
   * Removes all JSON-LD scripts (use only when navigating away from a page).
   */
  removeAllJsonLd() {
    const scriptElements = this._document.querySelectorAll(
      'script[type="application/ld+json"]'
    );
    scriptElements.forEach((script) => {
      script.remove();
    });
  }

  appendScript(content: string, renderer: Renderer2) {
    const script = renderer.createElement("script");
    script.type = "text/javascript";

    const scriptCode = this._document.createTextNode(content);
    renderer.appendChild(script, scriptCode);

    renderer.appendChild(this._document.head, script);
  }
}
