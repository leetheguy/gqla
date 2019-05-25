import { GAWebService, GATable as GATable } from "./GAWebService";

import _ from 'lodash';
import { GAState } from './GAState';

export class GAModel {
  appState: GAState;
  webService: GAWebService;
  table: GATable;

  list: any = null;
  item: any = {};

  constructor(table: GATable) {
    this.webService = GAState.currentState.webService;
    this.table = table;
    this.item = this.getEmptyData();
  }

  async getListData() {
    await this.webService.runListQuery(this.table)
    .then(result => this.list = result.data.data[this.table.dataName])
    .catch(error => console.error(error));
    return this.list;
  }

  getEmptyData() {
    let empty = {};
    _.each(this.table.fields, field => empty[field.dataName] = null);
    _.unset(empty, 'id');
    return empty
  }

  async getItemData(id: any) {
    await this.webService.runItemQuery(this.table, id)
    .then(result =>
      this.item = result.data.data[this.table.dataName].length > 0
      ? result.data.data[this.table.dataName][0]
      : this.item
    )
    .catch(error => console.error(error));
    return this.item;
  }

  async createItem(data: any) {
    await this.webService.runInsertMutation(this.table, data)
    .then(result => this.item = result.data.data[this.table.dataName][0])
    .catch(error => console.error(error));
    return this.item;
  }

  async updateItem(data: any) {
    await this.webService.runUpdateMutation(this.table, data)
    .catch(error => console.error(error));
    return this.item;
  }

  async deleteItem(data: any) {
    await this.webService.runDeleteMutation(this.table, data)
    .catch(error => console.error(error));
    return this.item;
  }
}