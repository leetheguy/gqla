//TODO URL should be passed in as a string through a prop.
//TODO This should not interfere with the actual URL.
import { GAWebService } from "./GAWebService";
import { GAModel } from './GAModel';
import { GAState } from './GAState';

import _ from 'lodash';

export class GADataNav {
  webService: GAWebService;

  constructor() {
    this.webService = GAState.currentState.webService;
  }

  async buildDataFromPath(path: any) {
    let model: GAModel;
    let models: Array<GAModel> = [];
    path = _(path).split('/').compact().value();

    // This for loop is needed to maintain async.
    for(const part of path) {
      if(this.webService.getTableByName(part)) {
        model = new GAModel(this.webService.getTableByName(part));
        await model.getListData();
        models.push(model);
      } else if(!!Number(part)) {
        await _.last(models).getItemData(Number(part));
      }
    }

    GAState.appState.store.dispatch({type: 'empty_models'});
    _.each(models, model => GAState.appState.store.dispatch({type: 'push_model', model: model}));
  }

  async resetPages(tableName: string, id = 0) {
    let model = new GAModel(this.webService.getTableByName(tableName));
    await model.getListData();
    if(id) await model.getItemData(id);
    GAState.appState.store.dispatch({type: 'reset_model', model: model});
    return model;
  }

  async pushPage(tableName: string, id = 0) {
    let model = new GAModel(this.webService.getTableByName(tableName));
    await model.getListData();
    if(id) await model.getItemData(id);
    GAState.appState.store.dispatch({type: 'push_model', model: model})
    return model;
  }

  popPage() {
    GAState.appState.store.dispatch({type: 'pop_model'})
  }

  // rebuildUrl() {
  //   let model = GAState.currentState.models[0]
  //   let stateString = _(GAState.currentState.models)
  //   .map(model => {
  //     return model.table.dataName + (model.item.id ? '/' + model.item.id : '');
  //   })
  //   .join('/');
  //   history.pushState(null, model.table.singularName, '/admin/' + stateString + '/');
  // }

  get currentState() { return GAState.appState.store.getState() }
}
