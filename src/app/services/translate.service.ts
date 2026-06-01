import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, of, Observable, forkJoin } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class TranslateService {
  private currentLang = new BehaviorSubject<string>('en');
  lang$ = this.currentLang.asObservable();
  private cache = new Map<string, string>();

  constructor(private http: HttpClient) {}

  get lang(): string { return this.currentLang.value; }

  setLang(lang: string) {
    this.currentLang.next(lang);
  }

  translate(text: string, from: string, to: string): Observable<string> {
    if (from === to) return of(text);
    const key = `${from}|${to}|${text}`;
    if (this.cache.has(key)) return of(this.cache.get(key)!);

    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${from}&tl=${to}&dt=t&q=${encodeURIComponent(text)}`;
    return this.http.get<any>(url).pipe(
      map(res => {
        // Response: [[[translatedText, originalText, ...], ...], ...]
        const parts: string[] = (res[0] as any[]).map((chunk: any[]) => chunk[0] || '');
        return parts.join('') || text;
      }),
      tap(translated => this.cache.set(key, translated)),
      catchError(() => of(text))
    );
  }

  translateMarkdown(markdown: string, from: string, to: string): Observable<string> {
    if (from === to) return of(markdown);
    const key = `md|${from}|${to}|${markdown.substring(0, 50)}`;
    if (this.cache.has(key)) return of(this.cache.get(key)!);

    const blocks: { type: 'code' | 'html' | 'text'; content: string }[] = [];
    const codeRegex = /```[\s\S]*?```|`[^`]+`/g;
    const htmlRegex = /<[^>]+>/g;
    let lastIndex = 0;
    const allMatches: { start: number; end: number; content: string; type: 'code' | 'html' }[] = [];

    let m: RegExpExecArray | null;
    while ((m = codeRegex.exec(markdown)) !== null) {
      allMatches.push({ start: m.index, end: m.index + m[0].length, content: m[0], type: 'code' });
    }
    while ((m = htmlRegex.exec(markdown)) !== null) {
      allMatches.push({ start: m.index, end: m.index + m[0].length, content: m[0], type: 'html' });
    }
    allMatches.sort((a, b) => a.start - b.start);

    const filtered: typeof allMatches = [];
    for (const match of allMatches) {
      if (filtered.length === 0 || match.start >= filtered[filtered.length - 1].end) {
        filtered.push(match);
      }
    }

    for (const match of filtered) {
      if (match.start > lastIndex) {
        blocks.push({ type: 'text', content: markdown.substring(lastIndex, match.start) });
      }
      blocks.push({ type: match.type, content: match.content });
      lastIndex = match.end;
    }
    if (lastIndex < markdown.length) {
      blocks.push({ type: 'text', content: markdown.substring(lastIndex) });
    }

    const translations = blocks.map(block => {
      if (block.type !== 'text' || block.content.trim().length === 0) {
        return of(block.content);
      }
      const chunks = this.chunkText(block.content, 450);
      if (chunks.length === 1) {
        return this.translate(chunks[0], from, to);
      }
      return forkJoin(chunks.map(c => this.translate(c, from, to))).pipe(
        map(results => results.join(''))
      );
    });

    return forkJoin(translations).pipe(
      map(results => {
        const full = results.join('');
        this.cache.set(key, full);
        return full;
      }),
      catchError(() => of(markdown))
    );
  }

  private chunkText(text: string, maxLen: number): string[] {
    if (text.length <= maxLen) return [text];
    const chunks: string[] = [];
    let remaining = text;
    while (remaining.length > maxLen) {
      let splitAt = remaining.lastIndexOf('. ', maxLen);
      if (splitAt === -1 || splitAt < maxLen / 2) splitAt = remaining.lastIndexOf('\n', maxLen);
      if (splitAt === -1 || splitAt < maxLen / 2) splitAt = maxLen;
      chunks.push(remaining.substring(0, splitAt + 1));
      remaining = remaining.substring(splitAt + 1);
    }
    if (remaining) chunks.push(remaining);
    return chunks;
  }
}
