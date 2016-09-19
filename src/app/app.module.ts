import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';

import { ChartsModule } from 'ng2-charts/ng2-charts';
// import { FuelUiModule } from 'fuel-ui';

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
  //  FuelUiModule,
    routing
  ],
  providers: [appRoutingProviders, SimService],
  bootstrap: [AppComponent]
})
export class AppModule { }
