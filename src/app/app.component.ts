import {AfterViewInit, Component, OnInit} from '@angular/core';
import {NetworkTopologyService} from './network-topology.service';
import {TopologyModel} from './topology.model';
import html2canvas from 'html2canvas';
import { jsPDF } from "jspdf";

declare var horizon: any;
declare var $: any;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, AfterViewInit {

  public topologyData: TopologyModel;

  constructor(private service: NetworkTopologyService) {
    this.topologyData = this.service.getTopologyData();
  }

  ngOnInit(): void {
    horizon.networktopologycommon.topologyData = this.topologyData;
  }

  ngAfterViewInit(): void {
    // load data
    horizon.networktopologycommon.init();
    // load svg (flatTopologyCanvasContainer) : TOPOLOGY
    horizon.flat_network_topology.init();
  }

  public createPdf(): void {
    // const pdf = new jsPDF('p', 'mm', 'a4');
    // $('#content > div').each((idx,element) => {
    //   html2canvas(element).then(function (canvas) {
    //     const imgData = canvas.toDataURL("image/jpeg");
    //
    //     const imgWidth = 210; // 이미지 가로 길이(mm) A4 기준
    //     const imgHeight = canvas.height * imgWidth / canvas.width;
    //
    //     if (idx === 0) {
    //       pdf.addImage(imgData, 'JPG',0,0, imgWidth, imgHeight);
    //     } else {
    //       const newPage = pdf.addPage();
    //       newPage.addImage(imgData, 'JPG',0,0, imgWidth, imgHeight);
    //     }
    //     if (idx === $('#content > div').length - 1) {
    //       pdf.save("NEW_PDF.pdf");
    //     }
    //   });
    // });

    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfData = ['.testPdf4', '.testPdf5'];

    pdfData.forEach((element, idx) => {
      html2canvas($(element)[0]).then(canvas => {
        const imgData = canvas.toDataURL('image/jpeg');
        const imgWidth = 210; // 이미지 가로 길이(mm) A4 기준
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        if (idx > 0) {
          pdf.addPage();
        }
        pdf.addImage(imgData, 'JPG', 0, 0, imgWidth, imgHeight);

        if (idx === pdfData.length - 1) {
          pdf.save('NEW_PDF2.pdf');
        }
      });
    });
  }

  public openChrome() {
    const oShell = new ActiveXObject("Shell.Application");
    const chromeCommand = 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe';
    const commandOption = ' --app="http://www.naver.com"';
    const launchCommand = chromeCommand + " " + commandOption;
    const fso = new ActiveXObject("Scripting.FileSystemObject");
    if (!fso.FileExists(chromeCommand)) {
      alert("---- Chrome 브라우저가 설치되어 있지 않습니다.");
      return;
    }
    oShell.ShellExecute(chromeCommand, commandOption, "", "open", "1");
    window.opener = self;
    const w = window.open('', "_self", "");
    w.close();
  }
}
