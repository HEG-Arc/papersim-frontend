import { Injectable } from '@angular/core';
import * as io from 'socket.io-client';

interface Company {
    name: string;
    currentStock: number;
    currentCash: number;
    dailySalesQty: number[];
    dailyPurchaseQty: number[];
    odoo?: {
        database: string;
        username: string;
        password: string;
    };
}

interface GameState {
    id: string;
    description: string;
    startDate: string;

    // rules
    initialStock: number;
    initialCash: number;
    customerDayToPay: number;
    supplierDayToPay: number;
    supplierMaxOrderSize: number;
    marketPriceRange: number[];
    supplierPriceRange: number[];
    numberOfDays: number;
    productionRawToFinished: number;

    // states
    currentDay: number;
    dailyMarketPrices: number[];
    dailySupplierPrices: number[];
    companies: Company[];
    nextState: string;
    currentState: string;
}

@Injectable()
export class SimService {

    public games: any[] = [];
    public game: any;
    public gameChartData: any[] = [];
    public gameChartLabels: any[] = [];
    public scores: any[];
    private socket: SocketIOClient.Socket;

    constructor() {
        this.socket = io.connect('http://localhost');
        this.socket.on('connect', () => {
            this.socket.emit('authentication', { username: 'test', password: 'root' });
            this.socket.on('authenticated', () => {
                // use the socket as usual
                console.log('connected');
                this.socket.on('gameList', (data: any) => {
                    this.games = data.sort((a: any, b: any) => {
                        return new Date(b.startDate).getTime() - new Date(a.startDate).getTime();
                    });
                });
                this.socket.on('state', (game: any, states: any) => {
                    if (this.game.id === game.id) {
                        this.game = game;
                        this.computeScores();
                    }
                    console.info(`${game.id} state: ${states.from} -> ${states.to}`);
                });
                this.socket.on('companyAdded', (game: any, company: any) => {
                    if (this.game.id === game.id) {
                        this.game.companies.push(company);
                    }
                });
            });
        });
    }

    joinGame(id: string) {
        this.socket.emit('joinGame', id, (game: any) => {
            this.game = game;
            this.computeScores();
        });
    }

    leaveGame() {
        if (this.game) {
            this.socket.emit('leaveGame', this.game.id);
        }
    }

    createGame(name: string) {
        return new Promise<string>((resolve, reject) => {
            this.socket.emit('createGame', name, (id: string) => {
                resolve(id);
            });
        });

    }

    next() {
        if (this.game) {
            this.socket.emit('nextState', this.game.id);
        }
    }

    input(args: any[], callback: Function) {
        if (this.game) {
            this.socket.emit('input', this.game.id, args, callback);
        }
    }

    addCompany(name: string, odoo: any) {
        if (this.game) {
            this.socket.emit('addCompany', this.game.id, name, odoo);
        }
    }

    save() {
        if (this.game) {
            // only send valid GameState object (filter out added properties)
            let gameState: GameState = {
                id: this.game.id,
                description: this.game.description,
                startDate: this.game.startDate,

                // rules
                initialStock: this.game.initialStock,
                initialCash: this.game.initialCash,
                customerDayToPay: this.game.customerDayToPay,
                supplierDayToPay: this.game.supplierDayToPay,
                supplierMaxOrderSize: this.game.supplierMaxOrderSize,
                marketPriceRange: this.game.marketPriceRange,
                supplierPriceRange: this.game.supplierPriceRange,
                numberOfDays: this.game.numberOfDays,
                productionRawToFinished: this.game.productionRawToFinished,

                // states
                currentDay: this.game.currentDay,
                dailyMarketPrices: this.game.dailyMarketPrices,
                dailySupplierPrices: this.game.dailySupplierPrices,
                companies: this.game.companies.map((c: any): Company => {
                    return {
                        name: c.name,
                        currentStock: c.currentStock,
                        currentCash: c.currentCash,
                        dailySalesQty: c.dailySalesQty,
                        dailyPurchaseQty: c.dailyPurchaseQty,
                        odoo: {
                            database: c.odoo.database,
                            username: c.odoo.username,
                            password: c.odoo.password
                        }
                    };
                }),
                nextState: this.game.nextState,
                currentState: this.game.currentState
            };
            this.socket.emit('editedGame', gameState);
        }
    }

    simulateGame() {
        this.socket.emit('simulateGame');
    }

    getCompany(name: string) {
        for (let i = 0; i < this.game.companies.length; i++) {
            if (name === this.game.companies[i].name) {
                return this.game.companies[i];
            }
        }
        return undefined;
    }

    computeScores() {
        this.gameChartData = [];
        this.game.companies.forEach((company: any) => {
            for (let i = 0; i <= this.game.currentDay; i++) {
                computeCompanyDay(this.game, company, i);
            }
            this.gameChartData.push({
                label: company.name,
                data: company.dailyCummulatedProfit || [],
                fill: false
            });
        });
        // compute rank and checks
        this.game.companies.slice(0).sort((a: any, b: any) => {
            // TODO: fix get from array....
            return (b.totalProfit + b.currentStock + b.currentCash) - (a.totalProfit + a.currentStock + a.currentCash);
        }).forEach((company: any, index: number) => {
            // rank
            company.rank = index + 1;
            company.margin = Math.round(company.totalProfit / company.totalSales * 10000) / 100;
            // checks
            if (company.stockCheck && company.maxSupplierQtyCheck && company.cashCheck) {
                company.check = company.stockCheck.every((c: any) => { return c; }) &&
                    company.maxSupplierQtyCheck.every((c: any) => { return c; }) &&
                    company.cashCheck.every((c: any) => { return c; });
            } else {
                company.check = true;
            }

        });
        // compute chartData

        this.gameChartLabels = [];
        for (let i = 1; i <= this.game.numberOfDays; i++) {
            this.gameChartLabels.push(i);
        }
    }

}

function computeCompanyDay(game: any, c: any, day: number) {
    if (day === 0) {
        c.dailySales$ = [];
        c.dailyCosts$ = [];
        c.dailyProfit$ = [];
        c.dailyCummulatedProfit = [];
        c.dailyStockStartOfDay = [];
        c.dailyCashEndOfDay = [];
        c.totalSales = 0;
        c.totalCosts = 0;
        c.totalProfit = 0;
        c.stockCheck = [];
        c.maxSupplierQtyCheck = [];
        c.cashCheck = [];
    }

    c.dailySales$[day] = c.dailySalesQty[day] * game.dailyMarketPrices[day];
    c.dailyCosts$[day] = c.dailyPurchaseQty[day] * game.dailySupplierPrices[day];
    c.dailyProfit$[day] = c.dailySales$[day] - c.dailyCosts$[day];
    // TODO: not safe if compute not called in order.
    c.totalSales += c.dailySales$[day];
    c.totalCosts += c.dailyCosts$[day];
    c.totalProfit += c.dailyProfit$[day];

    if (day === 0) {
        c.dailyCummulatedProfit[day] = c.dailyProfit$[day];
        c.dailyStockStartOfDay[day] = game.initialStock;
        c.dailyCashEndOfDay[day] = game.initialCash;
    } else {
        c.dailyCummulatedProfit[day] = c.dailyCummulatedProfit[day - 1] + c.dailyProfit$[day];
        let yesterdayStock = c.dailyStockStartOfDay[day - 1];
        let yesterdaySales = c.dailySalesQty[day - 1];
        let yesterdayProduction = 0;
        let dayOfOrderOfYesterdayDelivery = day - 1 - game.supplierDayToPay;
        if (dayOfOrderOfYesterdayDelivery >= 0) {
            yesterdayProduction = c.dailyPurchaseQty[dayOfOrderOfYesterdayDelivery] * game.productionRawToFinished;
        }
        c.dailyStockStartOfDay[day] = yesterdayStock - yesterdaySales + yesterdayProduction;
        let yesterdayCash = c.dailyCashEndOfDay[day - 1];
        let todayDeliveryCost = 0;
        let dayOfOrderOfTodayDelivery = day - game.supplierDayToPay;
        if (dayOfOrderOfTodayDelivery >= 0) {
            todayDeliveryCost = c.dailyCosts$[dayOfOrderOfTodayDelivery];
        }
        let todayCustomerPaid = 0;
        let dayOfSalesOfTodayCustomerPaid = day - game.customerDayToPay;
        if (dayOfSalesOfTodayCustomerPaid >= 0) {
            todayCustomerPaid = c.dailySales$[dayOfSalesOfTodayCustomerPaid];
        }
        c.dailyCashEndOfDay[day] = yesterdayCash - todayDeliveryCost + todayCustomerPaid;
    }

    // checks
    c.stockCheck[day] = c.dailySalesQty[day] <= c.dailyStockStartOfDay[day];
    c.maxSupplierQtyCheck[day] = c.dailyPurchaseQty[day] <= game.supplierMaxOrderSize;
    c.cashCheck[day] = c.dailyCashEndOfDay[day] >= 0;


}
