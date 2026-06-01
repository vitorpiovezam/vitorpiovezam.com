import { Inject, Injectable } from '@angular/core';
import { LOCAL_STORAGE, StorageService } from 'ngx-webstorage-service';

@Injectable()
export class LocalStorageService {
  anotherTodolist = [];

  constructor(@Inject(LOCAL_STORAGE) private storage: StorageService) { }

  public set(key: string, value: any) {
    this.storage.set(key, value);
  }

  public get(key: string, value: any) {
    this.storage.get(key, value);
  }

  public has(key: string): boolean {
    return this.storage.has(key);
  }

  public remove(key: string) {
    this.storage.remove(key);
  }
}
