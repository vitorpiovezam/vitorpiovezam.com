import { environment } from './../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { Post } from '../components/post/list.component';

export interface Comment {
  slug: string;
  commentId: string;
  author: string;
  text: string;
  createdAt: string;
  active: boolean;
  parentId?: string;
  recommends: number;
}

@Injectable()
export class PostService {
  apiUrl: string;
  private postsCache: Post[] | null = null;

  constructor(private http: HttpClient) {
    if (!environment.apiUrl) throw new Error('apiUrl is not defined');
    this.apiUrl = environment.apiUrl;
  }

  getLastPosts(): Observable<Post[]> {
    if (this.postsCache) return of(this.postsCache);
    return this.http.get<any[]>(`${this.apiUrl}/posts`).pipe(
      map(posts => posts.map(p => this.normalize(p))),
      tap(posts => this.postsCache = posts)
    );
  }

  getPostBySlug(slug: string): Observable<Post> {
    return this.http.get<any>(`${this.apiUrl}/post/${slug}`).pipe(
      map(p => this.normalize(p))
    );
  }

  getComments(slug: string): Observable<Comment[]> {
    return this.http.get<Comment[]>(`${this.apiUrl}/post/${slug}/comments`);
  }

  postComment(slug: string, author: string, text: string, parentId?: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/post/${slug}/comments`, { author, text, parentId });
  }

  recommendComment(slug: string, commentId: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/post/${slug}/comments/${commentId}/recommend`, {});
  }

  // Handles both old API (type: string) and new API (tags: string[])
  private normalize(p: any): Post {
    const tags = Array.isArray(p.tags) && p.tags.length
      ? p.tags
      : p.type ? p.type.split(',').map((t: string) => t.trim()).filter(Boolean) : [];
    return { ...p, tags, firstImage: p.firstImage || '' };
  }
}
