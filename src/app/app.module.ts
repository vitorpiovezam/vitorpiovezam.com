import { PostService } from './services/post.service';
import { BrowserModule } from '@angular/platform-browser';
import { NgModule, SecurityContext } from '@angular/core';

import { AppComponent } from './app.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { RouterModule } from '@angular/router';
import { LocalStorageService } from './services/local-storage.service';
import { AboutComponent } from './components/about/about.component';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { ServiceWorkerModule } from '@angular/service-worker';
import { environment } from '../environments/environment';
import { MarkdownModule, MarkdownService } from 'ngx-markdown';
import { PostListComponent } from './components/post/list.component';
import { PostViewComponent } from './components/post/view.component';
import { LoadingComponent } from './components/shared/loading.component';
@NgModule({ 
    declarations: [
        AppComponent,
        AboutComponent,
        PostListComponent,
        PostViewComponent,
        LoadingComponent
    ],
    exports: [
        RouterModule
    ],
    bootstrap: [AppComponent],
    imports: [
        FontAwesomeModule,
        BrowserModule,
        ServiceWorkerModule.register('ngsw-worker.js', { enabled: environment.production }),
        RouterModule.forRoot([
            { path: 'post/:slug', component: PostViewComponent },
        ], { scrollPositionRestoration: 'enabled' }),
        MarkdownModule.forRoot({
            sanitize: SecurityContext.NONE
        })
    ],
    providers: [
        LocalStorageService,
        MarkdownService,
        PostService,
        provideHttpClient(withInterceptorsFromDi()),
    ]
})
export class AppModule { }
