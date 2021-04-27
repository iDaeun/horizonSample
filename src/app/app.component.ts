import {AfterViewInit, Component, OnInit} from '@angular/core';

declare var horizon: any;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, AfterViewInit{

  ngOnInit(): void {
  }

  ngAfterViewInit(): void {
    console.log('horizon', horizon);
    if (typeof horizon.network_topology !== 'undefined') {
      horizon.network_topology.init();
    } else {
      horizon.networktopologycommon.init();
      horizon.flat_network_topology.init();
      horizon.network_topology.init();
    }
  }
}
