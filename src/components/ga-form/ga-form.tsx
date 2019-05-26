import { Component, Prop, State, Event, Watch, EventEmitter, h } from '@stencil/core';
import { GAModel } from '../../ga-utils/GAModel';
import { GATable } from '../../ga-utils/GAWebService';

import _ from 'lodash';
import moment from 'moment';
// import Quill from 'quill'

@Component({
  tag: 'ga-form',
  styleUrl: 'ga-form.css'
})
export class FormComponent {
  @Prop() side: String;
  @Prop() model: GAModel;
  @Watch('model') 
  watchModelHandler() {
    this.buildForm();
  }

  @Event() subTableSelected: EventEmitter;
  @Event() formSubmittedEvent: EventEmitter;
  @Event() modelUpdated: EventEmitter;

  @State() table: GATable;
  @State() data: any;
  @State() elements = [];
  @State() editing: boolean;
  // @State() quill: Quill;

  async componentWillLoad() {
    this.buildForm();
  }

  buildForm() {
    this.table = this.model.table;
    if(this.model.item) {
      this.data = this.model.item
    } else {
      // this.data = this.model.getEmptyData();
      // this.appState.store.dispatch({
      //   type: 'set_left_model',
      //   model: this.data,
      //   id: null,
      // });
    }

    this.elements = _(this.table.fields)
    .map(field => {field.order = !!field.order ? field.order : 1; return field})
    .orderBy('order')
    .map(field => {
      let fieldInput;
      let colSize = String(field.formColWidth || '');
      let element = null;

      if(field.formColWidth == -1) return null;

      switch(field.inputType) {
        case 'id':
          // colSize = '1';
          // fieldInput = <ion-input type="number" name={field.dataName} value={this.data[field.dataName]} readonly/>
          fieldInput = '';
          break;

        case 'number':
          fieldInput =
            <ion-input
              type="number"
              inputmode="numeric"
              autofocus={field.order == 0}
              name={field.dataName}
              value={this.data[field.dataName]}
              debounce={500}
              onIonInput={(event: any) => {
                this.data[field.dataName] = Number(event.srcElement.value);
                this.modelUpdated.emit({side: this.side, model: this.model} as any);
              }}
              step="0.01"
            />
          break;

        case 'table':
          let fieldId = this.model.item ? this.model.item[field.dataName] : null;

          element = 
            (fieldId
              ?
                [<ion-col size="6">
                  Current {field.singularName} ID: {fieldId}
                </ion-col>,
                <ion-col size="6">
                  <ion-button expand="block" onClick={() => this.subTableSelected.emit({table: field.tableName, id: fieldId, side: this.side} as any)}>
                    Select {field.singularName}
                  </ion-button>
                </ion-col>]
              :
                <ion-col size="12">
                  <ion-button expand="block" onClick={() =>  this.subTableSelected.emit({table: field.tableName, id: fieldId, side: this.side} as any)}>
                    Add {field.singularName}
                  </ion-button>
                </ion-col>
            );
          break;

        case 'textarea':
          colSize = '12';
          fieldInput =
            <ion-textarea
              autofocus={field.order == 0}
              name={field.dataName}
              value={this.data[field.dataName]}
              debounce={500}
              onIonInput={(event: any) => {
                this.data[field.dataName] = event.srcElement.value;
                this.modelUpdated.emit({side: this.side, model: this.model} as any);
              }}
              id="editor"
            ></ion-textarea>;
          break;

        case 'select':
          fieldInput =
            <ion-select
              name={field.dataName}
              value={this.data[field.dataName]}
              onIonChange={(event: any) => {
                this.data[field.dataName] = event.srcElement.value;
                this.modelUpdated.emit({side: this.side, model: this.model} as any);
              }}
            >
              {_.map(field.selectOptions, option => <ion-select-option value={option}>{option}</ion-select-option>)}
            </ion-select>
          break;

        //TODO case 'image'

        case 'datetime-local':
          let date = moment.utc(this.data[field.dataName]).format('YYYY-MM-DD').toString();
          let time = moment.utc(this.data[field.dataName]).format('HH:mm:ss').toString();
          element = 
            <ion-col size={colSize}>
              <ion-row>
                <ion-col size="6" no-padding>
                  <ion-item>
                    <ion-label position="floating">{field.singularName + ' - Date'}</ion-label>
                    <ion-input
                      type="date"
                      inputmode="date"
                      autofocus={field.order == 0}
                      name={field.dataName}
                      value={date}
                      debounce={500}
                      onIonInput={(event: any) => {
                        // let oldDate = moment.utc(this.data[field.dataName])
                        let newDate = moment.utc(event.srcElement.value)
                        this.data[field.dataName] = newDate
                          .set({year: newDate.year(), month: newDate.month(), date: newDate.date()})
                          .format();
                        this.modelUpdated.emit({side: this.side, model: this.model} as any);
                      }}
                      class="date-input"
                    />
                  </ion-item>
                </ion-col>
                <ion-col size="6" no-padding>
                  <ion-item>
                    <ion-label position="floating">{field.singularName + ' - Time'}</ion-label>
                    <ion-input
                      type="time"
                      inputmode="time"
                      autofocus={field.order == 0}
                      name={field.dataName}
                      value={time}
                      debounce={2000}
                      onIonInput={(event: any) => {
                        // let oldDate = moment.utc(this.data[field.dataName])
                        let newDate = moment.utc(event.srcElement.value, 'hh:mm:ss a')
                        this.data[field.dataName] = newDate
                          .set({hour: newDate.hour(), minute: newDate.minute(), second: newDate.second()})
                          .format();
                        this.modelUpdated.emit({side: this.side, model: this.model} as any);
                      }}
                      class="date-input"
                      step="1"
                    />
                  </ion-item>
                </ion-col>
              </ion-row>
            </ion-col>
        break;

        default:
          fieldInput =
            <ion-input 
              type="text" inputmode="text"
              autofocus={field.order == 0}
              name={field.dataName}
              value={this.data[field.dataName]}
              onIonInput={(event: any) => {
                this.data[field.dataName] = event.srcElement.value;
                // this.data[field.dataName] = event.detail.value;
                this.modelUpdated.emit({side: this.side, model: this.model} as any);
              }}
              debounce={500}/>
      }

      if(fieldInput) element = element ||
        <ion-col size={colSize}>
          <ion-item>
            <ion-label position="floating">{field.singularName}</ion-label>
            {fieldInput}
          </ion-item>
        </ion-col>

      return element;
    }).value();
  }

  chooseFormComponent(field) {
    let fieldInput;

    switch(field.inputType) {
      case 'textarea':
        fieldInput = <ion-textarea autofocus={field.order == 0} name={field.dataName}></ion-textarea>;
        break;
      default:
        fieldInput = <ion-input type="text" inputmode="text" autofocus={field.order == 0} name={field.dataName} value={this.data[field.dataName]}/>;
    }
    return (
      <ion-col size-md={field.formColWidth}>
        <ion-item>
          <ion-label position="floating">{field.singularName}</ion-label>
          {fieldInput}
        </ion-item>
      </ion-col>
    )
  }

  componentDidLoad() {
    // let options = {
    //   theme: 'snow'
    // }

    // this.quill = new Quill('#editor', options);
  }

  async formSubmitted(event) {
    event.preventDefault();
    if(this.data.id) {
      await this.model.updateItem(this.data);
      this.formSubmittedEvent.emit('');
    } else {
      await this.model.createItem(this.data);
      this.formSubmittedEvent.emit('');
    }
  }

  delete() {
    this.model.deleteItem(this.data);
  }

  render() {
    let buttonRow = this.model.item && this.model.item.id
      ?
      <ion-row>
        <ion-col size="auto">
          <ion-button expand="block" color="danger" onClick={() => this.delete()} class="bg-red"><ion-icon name="trash" slot="start"></ion-icon> Delete</ion-button>
        </ion-col>
        <ion-col>
          <ion-button expand="block" type="submit"><ion-icon name="save" slot="start"></ion-icon> Update</ion-button>
        </ion-col>
      </ion-row>
      :
      <ion-row>
        <ion-col>
          <ion-button expand="block" type="submit"><ion-icon name="save" slot="start"></ion-icon>Create</ion-button>
        </ion-col>
      </ion-row>
      ;

    return [
      <div>
        <h2>
          { this.model.item && this.model.item.id ? 'Edit ' : 'New ' }
          { this.model.table.singularName }
          { this.model.item && this.model.item.id ? ' #' + this.model.item.id : '' }
        </h2>
        <form onSubmit={(event) => this.formSubmitted(event)}>
          <ion-grid class="ba br2 b--silver">
            <ion-row>
              {this.elements}
            </ion-row>
            {buttonRow}
          </ion-grid>
        </form>
      </div>
    ]
  }
}