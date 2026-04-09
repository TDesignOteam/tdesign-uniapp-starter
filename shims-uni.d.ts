/// <reference types='@dcloudio/types' />
import 'vue';

declare module '*.less' {
  const CONTENT: string;
  export default CONTENT;
}

declare module '@vue/runtime-core' {
  type Hooks = App.AppInstance & Page.PageInstance;

  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface ComponentCustomOptions extends Hooks {

  }
}
