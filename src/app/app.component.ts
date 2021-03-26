import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';
import { DialogBoxComponent } from './dialog-box/dialog-box.component';
import { Shareholder } from './models/Shareholder';
import { SHAREHOLDER_DATA } from './mock-data/shareholder_data';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent implements OnInit {
  title = 'Shareholder Stock Distribution Table';

  displayedColumns: string[] = [];
  shareholders: Shareholder[] = [];
  TOTAL_NUM_SHARES: number = 0;
  dataSource = new MatTableDataSource(this.shareholders);

  input_shareholder: Shareholder = {
    id: this.shareholders.length, name: '', num_shares: 0, price_shares: 480, pc_shares: '', share_type: ''
  };

  constructor(public dialog: MatDialog) {}

  ngOnInit() {
    this.displayedColumns = ['id', 'name', 'num_shares', 'price_shares', 'pc_shares', 'share_type', 'actions'];
    this.shareholders = SHAREHOLDER_DATA;
    this.createTable();
  }

  // Calls the DialogBoxComponent for 'Add' and 'Update' methods
  openDialog(action: string, obj: any) {
    obj.action = action;

    const dialogRef = this.dialog.open(DialogBoxComponent, {
      width: '280px',
      data: obj
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result.event == 'Add') {
        this.addShareholder(result.data);
      } else {
        this.updateShareholder(result.data);
      }
    });
  }

  // Initializes the shareholder table
  createTable() {
    this.shareholders.map((v, i) => v.id = i);
    this.TOTAL_NUM_SHARES = this.calculateTotal();
    this.shareholders.map((v, i) => v.pc_shares = ((v.num_shares / this.TOTAL_NUM_SHARES) * 100).toFixed(2) + "%");
    
    this.dataSource = new MatTableDataSource(this.shareholders);
  }

  // Calculates the no. of outstanding shares
  calculateTotal() {
    return this.shareholders.map(t => t.num_shares).reduce((sum, a) => Number(sum) + Number(a));
  }

  // Adding a new shareholder to table
  addShareholder(entry: Shareholder) {
    if (entry.name !== '' && entry.num_shares > 0 && entry.share_type !== '') {
      this.shareholders.push(entry);
      this.createTable();
    }
  }

  // Removing a shareholder from table
  removeShareholder(index: number) {
    this.shareholders = this.shareholders.filter((v, i) => i !== index);
    this.createTable();
  }
  
  // Updating the details of a shareholder
  updateShareholder(entry: Shareholder) {
    this.shareholders = this.shareholders.filter((v, i) => {
      if (v.id == entry.id) {
        if (entry.name !== '' && entry.num_shares > 0 && entry.share_type !== '') {
          v.name = entry.name;
          v.num_shares = entry.num_shares;
          v.price_shares = entry.price_shares;
          v.pc_shares = entry.pc_shares;
          v.share_type = entry.share_type;
        }
      }

      return true;
    });

    this.createTable();
  }

  // Creating a 2-for-1 or 3-for-1 stock split
  stockSplit(factor: number) {
    this.shareholders.map((v, i) => v.num_shares *= factor)
    this.shareholders.map((v, i) => v.price_shares = Number((v.price_shares / factor).toFixed(2)));
    this.createTable();
  }

  // Filter function
  applyFilter(event: Event) {
    const filter_val = (event.target as HTMLInputElement).value.trim().toLowerCase();
    this.dataSource.filter = filter_val;
  }
}
