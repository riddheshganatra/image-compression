import { Component, OnInit } from '@angular/core';
import {ElectronService} from 'ngx-electron';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  constructor(private _electronService: ElectronService) {
   }
  path = '';
   list = [];
   loading = false;

   async findImages() {
    this.loading = true;
    setTimeout(() => {
      if (this._electronService.isElectronApp) {
          this.list = this._electronService.ipcRenderer.sendSync('find-images-to-compress', this.path);
          this.loading = false;
      }
    }, 10);

}

onFileChange(event) {
  this.path = event[0].path;
}
reset(){
  this.path = '';
  this.list = [];
}

ngOnInit() {
  // this._electronService.ipcRenderer.on('find-images-to-compress-response', (event, data) => {
  //   this.list = ['response', '2'];
  // });
}
}
