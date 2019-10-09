Do You have many promises or async (or simple) functions which you have to run in some specific arrange  and hard scenario ?

You can do it easily with this package.

```typescript
import { Structuromise, IStructureItem } from 'structuromise';

// Wrap every of your handlers in the object with the next structure:

const myFirstHandler: IStructureItem = {
  id: 'myFirstHandler', // the unique identifier of your handler
  after: [], // specify after those handler this handler should run
  handler: async(data: any): Promise<void> => {
    // do something this data
  }
};

const mySecondHandler: IStructureItem = {
  id: 'mySecondHandler',
  after: ['myFirstHandler'],
  handler: async(data: any): Promise<void> => {
    // the data object will structure specified bellow in the options.myFirstHandler 
  }
};

const myThirdHandler: IStructureItem = {
  id: 'myThirdHandler',
  after: ['myFirstHandler', 'mySecondHandler'],
  handler: async(data: any): Promise<void> => {
    // the data object will has next structure:
    // { 
    //    myFirstHandler: ...result of successful execution myFirstHandler.handler 
    //    mySecondHandler: ...result of successful execution mySecondHandler.handler 
    // }
  }
};

const myFourthHandler: IStructureItem = {
  id: 'myFourthHandler',
  after: ['myFirstHandler'],
  type: 'error', // specify type as error if you want to handle it when all handlers in after will be failed
  handler: async(data: any): Promise<void> => {
    // the data object will has next structure:
    // { 
    //    myFirstHandler: ...error which was throed when myFirstHandler had failed
    // }
  }
};

// Specify options for each of your independent handlers which will be run first:

const options: any = {
  myFirstHandler: {
    a: 1,
    b: 2
  }
};

// Pass them in array to the constructor of Structuromise:

const structuromise: Structuromise = new Structuromise([ 
  myFirstHandler, 
  mySecondHandler, 
  myThirdHandler, 
  myFourthHandler 
]);

// Run init method with defined before **options** and run start in the chain. 
// Remember that **structuromise** is reusable: you can init it this another options and start again for many times   

structuromise.init(options).start();

```

That's all, thanks for attention and good luck !
