import { Component, OnInit, OnDestroy } from '@angular/core';
import { SimService } from '../shared/index';
import { ActivatedRoute } from '@angular/router';
import { TableOptions, TableColumn, ColumnMode, SortDirection } from 'angular2-data-table';
import 'Chart.js';

// TODO: EDITMODE: if edit mode disable update in simservice
// before save transform to array min/max
// remove comnpanies additional properties

// TODO: Edit mode company names, market values as one form, buy/sell one form? max length

/**
 * This class represents the lazy loaded AboutComponent.
 */
@Component({
  selector: 'app-game',
  templateUrl: 'game.component.html',
  styleUrls: ['game.component.css']
})
export class GameComponent implements OnInit, OnDestroy {

  tableVars: any[] = [
    { v: 'dailyStockStartOfDay' },
    {
      v: 'dailySalesQty',
      edit: true,
      check: 'stockCheck'
    },
    { v: 'dailySales$' },
    {
      v: 'dailyPurchaseQty',
      edit: true,
      check: 'maxSupplierQtyCheck'
    },
    { v: 'dailyCosts$' },
    {
      v: 'dailyCashEndOfDay',
      check: 'cashCheck'
    },
    { v: 'dailyProfit$' },
    { v: 'dailyCummulatedProfit' }
  ];

  dataTableOptions: TableOptions = new TableOptions({
    columnMode: ColumnMode.force,
    sorts: [{
      prop: 'rank',
      dir: SortDirection.asc
    }],
    columns: [
      new TableColumn({
        name: 'Rank',
        prop: 'rank'
      }),
      new TableColumn({
        name: 'Company',
        prop: 'name'
      }),
      new TableColumn({
        name: 'Total Profit',
        prop: 'totalProfit'
      }),
      new TableColumn({
        name: 'Total Sales',
        prop: 'totalSales'
      }),
      new TableColumn({
        name: 'Total Costs',
        prop: 'totalCosts'
      }),
      new TableColumn({
        name: 'Margin',
        prop: 'margin'
      })
    ]
  });


  public lineChartOptions: any = {
    animation: false,
    responsive: true
  };

  newName: string;
  private sub: any;

  constructor(private route: ActivatedRoute, private simService: SimService) { }

  ngOnInit() {
    this.sub = this.route.params.subscribe(params => {
      let id = params['id'];
      this.simService.joinGame(id);
    });
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
    this.simService.leaveGame();
  }

  addCompany(): boolean {
    this.simService.addCompany(this.newName);
    this.newName = '';
    return false;
  }

  sendOrder(company: any, field: string) {
    let amount = parseInt(company[field][this.simService.game.currentDay], 10);
    company.order = undefined;
    this.simService.input([company.name, amount], (res: Boolean) => {
      company.order = res;
    });
  }

}
