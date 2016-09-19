import { Component, OnInit, OnDestroy } from '@angular/core';
import { SimService } from '../shared/index';
import { ActivatedRoute } from '@angular/router';
import { TableSortableColumn, TableSortableSorting} from 'fuel-ui';
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



  columns: TableSortableColumn[] = [
    {
      display: 'Rank', // The text to display
      variable: 'rank', // The name of the key that's apart of the data array
      filter: 'number', // The type data type of the column (number, text, date, etc.)
      sortable: true // Whether the user can sort on the column
    },
    {
      display: 'Company',
      variable: 'name',
      filter: 'text',
      sortable: true
    },
    {
      display: 'Total Profit',
      variable: 'totalProfit',
      filter: 'number',
      sortable: true
    },
    {
      display: 'Total Sales',
      variable: 'totalSales',
      filter: 'number',
      sortable: true
    },
    {
      display: 'Total Costs',
      variable: 'totalCosts',
      filter: 'number',
      sortable: true
    },
    {
      display: 'Margin',
      variable: 'margin',
      filter: 'percentage: 1.2-2',
      sortable: true
    }
  ];
  sorting: TableSortableSorting = {
    column: 'rank', // to match the variable of one of the columns
    descending: false
  };


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
