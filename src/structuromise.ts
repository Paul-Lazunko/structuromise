import { EventEmitter } from 'events'
import { IStructureItem } from './interfaces';
import { isAsync, validateData } from './helpers';
import { EItemTypes } from "./types";

export class Structuromise {
  private successEventEmitter: EventEmitter;
  private errorEventEmitter: EventEmitter;
  private data: IStructureItem[];
  private requiredSuccessEvents: string[][] = [];
  private requiredErrorEvents: string[][] = [];
  private firedSuccessEvents: string[] = [];
  private firedErrorEvents: string[] = [];
  private options: any;
  private result: any = {};

  constructor(data: IStructureItem[]) {
    validateData(data);
    this.data = data;
  }

  public init(options: any = {}) {
    this.successEventEmitter = new EventEmitter();
    this.errorEventEmitter = new EventEmitter();
    this.options = options;
    this.requiredSuccessEvents = [];
    this.requiredErrorEvents = [];
    this.firedSuccessEvents = [];
    this.firedErrorEvents = [];
    this.result = {
      success: {},
      error: {}
    };
    this.data
      .filter((item:IStructureItem) =>  Array.isArray(item.after) && item.after.length)
      .forEach((item: IStructureItem) => {
        const event = item.after.sort().toString();
        const type = item.type || EItemTypes.SUCCESS;
        if ( type === EItemTypes.ERROR ) {
          this.requiredErrorEvents.push(item.after);
          this.errorEventEmitter.on(event, async (data: any) => {
            try {
              this.wrapHandler(item, data);
            } catch (e) {}
          });
        } else {
          this.requiredSuccessEvents.push(item.after);
          this.successEventEmitter.on(event,  async (data: any) => {
            try {
              this.wrapHandler(item, data);
            } catch (e) {}
          });
        }
      });
    return this;
  }

  public start() {
    this.data
      .filter((item:IStructureItem) => !Array.isArray(item.after) || Array.isArray(item.after) && !item.after.length )
      .map(async (item: IStructureItem): Promise<void> => {
        try {
          const data = this.options[item.id];
          data ? this.wrapHandler(item, data) : this.wrapHandler(item);
        } catch(e) {}
      });
  }

  protected wrapHandler (item: IStructureItem, data?: any) {
    try {
      if ( isAsync( item.handler) ) {
        const promise = data ? item.handler(data) : item.handler();
        promise
          .then((res:any) => {
            this.result.success[item.id] = res;
            this.emit(EItemTypes.SUCCESS);
          })
          .catch((error: Error) => {
            this.result.error[item.id] = error;
            this.emit(EItemTypes.ERROR);
          })

      } else {
        this.result.success[item.id] = data ? item.handler(data) : item.handler();
        this.emit(EItemTypes.SUCCESS);
      }
    } catch ( error ) {
      this.result.error[item.id] = error;
      this.emit(EItemTypes.ERROR);
    }
  };

  private emit(type: EItemTypes) {
    let compared: string[];
    switch (type) {
      case EItemTypes.SUCCESS:
        compared = Object.keys(this.result.success).sort();
        this.requiredSuccessEvents.forEach((item: string[]) => {
          if ( item.length <= compared.length && item.every((item: string) => compared.includes(item))){
            const afterEvent = item.sort().toString();
            if ( !this.firedSuccessEvents.includes(afterEvent) ) {
              const data: any = {};
              for ( const property in this.result.success ) {
                if ( item.includes(property) ) {
                  data[property] = this.result.success[property]
                }
              }
              this.successEventEmitter.emit(afterEvent, data);
              this.firedSuccessEvents.push(afterEvent);
              this.successEventEmitter.removeAllListeners(afterEvent);
            }
          }
        });
        break;
      case EItemTypes.ERROR:
        compared = Object.keys(this.result.error).sort();
        this.requiredErrorEvents.forEach((item: string[]) => {
          if ( item.length <= compared.length && item.every((item: string) => compared.includes(item))){
            const afterEvent = item.sort().toString();
            if ( !this.firedErrorEvents.includes(afterEvent) ) {
              const data: any = {};
              for ( const property in this.result.error ) {
                if ( item.includes(property) ) {
                  data[property] = this.result.error[property]
                }
              }
              this.errorEventEmitter.emit(afterEvent, data);
              this.firedErrorEvents.push(afterEvent);
              this.errorEventEmitter.removeAllListeners(afterEvent);
            }
          }
        });
        break;
    }
  }
}
