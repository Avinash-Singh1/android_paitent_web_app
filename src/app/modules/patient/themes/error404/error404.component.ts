import { Component, Inject, OnInit } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { Meta } from '@angular/platform-browser';
import { SeoService } from 'src/app/services/seo.service';

@Component({
  standalone: false,
  selector: 'nectar-error404',
  templateUrl: './error404.component.html',
  styleUrls: ['./error404.component.scss']
})
export class Error404Component implements OnInit {

  constructor(
    private seoService: SeoService,
    private meta: Meta,
    @Inject(DOCUMENT) private _document: Document
  ) {}

  ngOnInit(): void {
    this.seoService.noIndexRobot();

    // Signal to SSR server that this page should return HTTP 404
    this.meta.updateTag({ name: 'prerender-status-code', content: '404' });
  }
}
