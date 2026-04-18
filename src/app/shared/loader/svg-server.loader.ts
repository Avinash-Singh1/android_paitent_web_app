import { SvgLoader } from 'angular-svg-icon';
import { Observable, of } from 'rxjs';
import { readFileSync } from 'fs';
import { join } from 'path';

/**
 * Server-side SVG loader that reads SVG files from the filesystem
 * instead of making HTTP requests (which hang during SSR).
 */
export class SvgServerLoader implements SvgLoader {
  getSvg(url: string): Observable<string> {
    // Resolve relative paths against the build output directory
    const paths = [
      join(process.cwd(), 'dist', 'nectar', 'browser', url),
      join(process.cwd(), 'src', url),
    ];
    for (const filePath of paths) {
      try {
        const content = readFileSync(filePath, 'utf-8');
        return of(content);
      } catch {
        continue;
      }
    }
    // Return empty SVG if file not found
    return of('<svg></svg>');
  }
}
