import { createStore, Reducer, Store, combineReducers } from 'redux';
import { GAWebService } from './GAWebService';

import _ from "lodash";

export class GAState {
  static appState;
  public store: Store;

  constructor() {
    this.store = createStore(this.rootReducer);
  }

  webService(state = new GAWebService) {
    return state;
  }

  models(state = [], action) {
    switch (action.type) {
      case 'empty_models':
        state = [];
        break;
      case 'reset_model':
        state = [action.model];
        break;
      case 'push_model':
        state = _.concat(state, action.model);
        break;
      case 'pop_model':
        state = _.dropRight(state, action.model);
        break;
      case 'update_model':
        state[action.index] = action.model;
        break;
    }
    return state;
  }

  leftId(state = null, action) {
    switch (action.type) {
      case 'set_left_model': return action.id;
      case 'clear_left_model': return null;
      default: return state;
    }
  }

  rightId(state = null, action) {
    switch (action.type) {
      case 'set_right_model': return action.id;
      case 'clear_right_model': return null;
      default: return state;
    }
  }

  rootReducer: Reducer = combineReducers({
    webService: this.webService,
    models: this.models,
  });

  static get currentState() { return GAState.appState.store.getState() }
}