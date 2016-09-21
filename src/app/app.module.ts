import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';

import { ChartsModule } from 'ng2-charts/ng2-charts';
import { Angular2DataTableModule } from 'angular2-data-table';

import { routing, appRoutingProviders } from './app.routes';
import { AppComponent } from './app.component';
import { HomeComponent } from './+home/index';
import { GameComponent } from './+game/index';
import { FocusedInputDirective, ToolbarComponent, ClickEditComponent, SimService } from './shared/index';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    GameComponent,
    FocusedInputDirective,
    ToolbarComponent,
    ClickEditComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
    ChartsModule,
    Angular2DataTableModule,
    routing
  ],
  providers: [appRoutingProviders, SimService],
  bootstrap: [AppComponent]
})
export class AppModule { }
