import { Component, State, Prop, Event, Watch, h, EventEmitter } from '@stencil/core';
import { GAModel } from '../../ga-utils/GAModel';
import { GATable } from '../../ga-utils/GAWebService';

import _ from 'lodash';
import moment from 'moment';

@Component({
  tag: 'ga-list',
  styleUrl: 'ga-list.css'
})
export class ListComponent {
  @Prop() side: String;
  @Prop() model: GAModel;
  @Watch('model') 
  watchModelHandler() { 
    this.buildList();
  }

  @Event() leftRowSelected: EventEmitter;
  @Event() rightRowSelected: EventEmitter;

  @State() table: GATable;
  @State() data: any;
  @State() editing: boolean;
  @State() list: Array<object> = [];
  @State() item: object = null;
  @State() header: any;
  @State() rows: any;
    

  async componentWillLoad() {
    this.buildList()
  }

  getColSize(field): string {
    let colSize: any = field.listColWidth;
    colSize = ['textarea', 'table'].includes(field.inputType) ? -1 : colSize;
    colSize = ['id'].includes(field.inputType) ? 1 : colSize;
    colSize = !!colSize ? String(colSize) : '';
    return String(colSize);
  }

  buildList() {
    this.table = this.model.table;
    this.data = this.model.list;
    this.buildHeader();
    this.buildRows();
  }

  buildHeader() {
    this.header =  <ion-row class="bg-moon-gray">
      {_.map(this.table.fields, field  =>
        this.getColSize(field) != '-1' ?
          <ion-col size={this.getColSize(field)}>
            {field.singularName}
          </ion-col>
        : null
      )}
    </ion-row>
  }

  buildRows() {
    this.rows = _.map(this.data, (row, index: number) => {
      let columns = _.map(this.table.fields, field => {
        let output = row[field.dataName];
        switch(field.inputType) {
          case 'datetime-local':
            output = moment.utc(output).fromNow();
            break;
          default:
          break
        }

        let colSize = this.getColSize(field)
        return colSize != '-1'
        ?
          <ion-col size={colSize}>
            {output}
          </ion-col>
        :
          null
        ;
      })
      let bgColor = index % 2 ? 'bg-lightest-blue' : '';

      let element =
        <ion-row class={bgColor + ' ga-table-row'} onClick={() => {
          let data = ({table: this.table.dataName, id: row.id, side: this.side} as any);
          this.side == 'left'
          ? this.leftRowSelected.emit(data)
          : this.rightRowSelected.emit(data);
        }}>
          {columns}
        </ion-row>
      return element;
    })
  }

  render() {
    return [
      <h2>
        {this.side == 'left'
          ? this.model.table.pluralName + ' List'
          : 'Select ' + this.model.table.singularName}
      </h2>,
      <ion-grid class="ba br2 b--silver">
        {this.header}
        {this.rows}
      </ion-grid>
    ];
  }
}