import { TItemType }  from "../types";

export interface IStructureItem {
  id: string,
  after?: string[],
  type?: TItemType,
  handler: Function
}
