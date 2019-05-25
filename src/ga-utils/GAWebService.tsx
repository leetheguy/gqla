import axios from 'axios';
import _ from 'lodash';

export const COLUMN_WIDTH_HIDDEN = -1;
export const COLUMN_WIDTH_DEFAULT = 0;

export class GAWebService {
  static url;

  tables: Array<GATable> = [];
  loading = true;

  createError = '';
  otherError = '';

  structureFields = `
    {
      dataName
      singularName
      pluralName
      fields
    }
  `;

  async init() {
    await this.runTablelessListQuery('gqa_tables', this.structureFields)
    .then(this.buildTables).catch(error => console.error(error));
  }

  buildTables = (result) => {
    this.tables = _.map(result.data.data.gqa_tables, table => new GATable(table));
  }

  private async runTablelessListQuery(tableName: string, fields: string) {
    let query = `{ ${tableName} ${fields} }`;
    return await axios.post(GAWebService.url, {query: query});
  }

  async runListQuery(table: GATable) {
    let query = `{ ${table.dataName} ${table.getFieldsAsGQLString()} }`;
    return await axios.post(GAWebService.url, {query: query});
  }

  async runItemQuery(table: GATable, id: any) {
    let query = `{ ${table.dataName}(where: {id: {_eq: ${id}}}) ${table.getFieldsAsGQLString()} }`;
    return await axios.post(GAWebService.url, {query: query})
  }

  async runInsertMutation(table: GATable, data: any) {
    data = _.omit(data, 'id');

    let query = `
      mutation insert_${table.dataName}($objects: [${table.dataName}_insert_input!]! ) {
        insert_${table.dataName}(objects: $objects) {
          returning ${table.getFieldsAsGQLString()}
        }
      }
    `;

    return await axios.post(GAWebService.url, {query: query, variables: {objects: data}})
  }

  async runUpdateMutation(table: GATable, data: any) {
    let query = `
      mutation update_${table.dataName}($id: Int, $changes: ${table.dataName}_set_input) {
        update_${table.dataName}(where: {id: {_eq: $id}}, _set: $changes) {
          affected_rows
          returning { id }
        }
      }
    `;

    return await axios.post(GAWebService.url, {query: query, variables: {id: data.id, changes: data}})
  }

  async runDeleteMutation(table: GATable, data: any) {
    let query = `
      mutation {
        delete_${table.dataName}(where: {id: {_eq: ${data.id}}})
        {
          affected_rows
        }
      }
    `;

    return await axios.post(GAWebService.url, {query: query})
  }

  getTableByName(name: string) {
    return _.find(this.tables, {dataName: name});
  }
}

export class GAField {
  readonly allowedInputTypes = ['button', 'checkbox', 'color', 'date', 'datetime-local', 'email', 'file', 'table', 'hidden', 'image', 'month', 'number', 'password', 'radio', 'range', 'reset', 'search', 'submit', 'tel', 'text', 'time', 'url', 'week'];

  dataName: string;
  formColWidth: number;
  inputType: string;
  listColWidth: number;
  order: number;
  pluralName: string;
  selectOptions: Array<string>;
  singularName: string;
  tableName: string;

  constructor(field: any) {
    this.dataName = field.dataName;
    this.formColWidth = field.formColWidth;
    this.inputType = field.inputType;
    this.listColWidth = field.listColWidth;
    this.order = field.order;
    this.pluralName = field.pluralName;
    this.selectOptions = field.selectOptions;
    this.singularName = field.singularName;
    this.tableName = field.tableName;
  }
}

export class GATable {
  dataName: string;
  fields: Array<GAField> = [];
  pluralName: string;
  singularName: string;

  constructor(table: any) {
    this.dataName = table.dataName;
    this.pluralName = table.pluralName;
    this.singularName = table.singularName;
    _.each(table.fields, field => this.fields.push(new GAField(field)));
  }

  getFieldsAsGQLString() {
    return `{ ${
      _.map(this.fields, field => field.dataName)
      .join(' ')
    } }`;
  }
}
