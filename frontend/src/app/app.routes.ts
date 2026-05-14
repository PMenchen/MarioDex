import { Routes } from '@angular/router';
import { MarioPageComponent } from './features/mario/mario-page/mario-page.component';

export const routes: Routes = [
  { path: '', component: MarioPageComponent },
  { path: '**', redirectTo: '' }
];
