/**
 * @jest-environment jsdom
 */

import { NextPageContext } from 'next';
import * as React from 'react';
import { hydrate, render } from 'react-dom';
import withInitialProps from './with-initial-props';

const fakeNextContext = {} as NextPageContext;

interface WindowWithComponentData {
  __COMPONENT_DATA__: any;
}

describe('test withInitialProps in browser', () => {
  it('hydrates correctly with component data from server.', async () => {
    const ssrHtml = `<div id="component-data">hello world</div><script>window.__COMPONENT_DATA__ = window.__COMPONENT_DATA__ || {};
window.__COMPONENT_DATA__["the-cid"] = {"data":"hello world"}</script>`;

    // By directly setting innerHTML, the script tag won't be executed.
    const theWindow = (window as any) as WindowWithComponentData;
    theWindow.__COMPONENT_DATA__ = {};
    theWindow.__COMPONENT_DATA__['the-cid'] = { data: 'hello world' };

    document.body.innerHTML = `<div id="app">${ssrHtml}</div>`;

    const dom = document.getElementById('app') as HTMLDivElement;
    expect(dom).not.toBeNull();

    let componentBeingRendered = 0;
    const Component = ({ data }: { data: string }) => {
      componentBeingRendered++;
      expect(data).toBe('hello world');
      return <div id="component-data">{data}</div>;
    };

    let getInitialPropsBeingCalled = 0;
    let getInitialProps: (ctx: any, { name }: { name: string }) => Promise<{ data: string }>;
    getInitialProps = async (ctx: any, { name }: { name: string }) => {
      getInitialPropsBeingCalled++;
      return { data: `hello ${name}` };
    };

    const WrappedComponent = withInitialProps(Component, getInitialProps);

    expect(WrappedComponent).toBeDefined();
    expect(WrappedComponent.getInitialProps).toBeDefined();

    expect(getInitialPropsBeingCalled).toBe(0);

    hydrate(<WrappedComponent cid="the-cid" />, dom);

    expect(componentBeingRendered).toBe(1);

    const divDom = document.getElementById('component-data') as HTMLDivElement;
    expect(divDom.innerHTML).toBe('hello world');
  });

  it('renders correctly entirely in browser.', async () => {
    const theWindow = (window as any) as WindowWithComponentData;
    theWindow.__COMPONENT_DATA__ = undefined;

    document.body.innerHTML = `<div id="app"></div>`;

    const dom = document.getElementById('app') as HTMLDivElement;
    expect(dom).not.toBeNull();

    let componentBeingRendered = 0;
    const Component = ({ data }: { data: string }) => {
      componentBeingRendered++;
      expect(data).toBe('hello world');
      return <div id="component-data">{data}</div>;
    };

    let getInitialPropsBeingCalled = 0;
    let getInitialProps: (ctx: any, { name }: { name: string }) => Promise<{ data: string }>;
    getInitialProps = async (ctx: any, { name }: { name: string }) => {
      getInitialPropsBeingCalled++;
      expect(name).toBe('world');
      return { data: `hello ${name}` };
    };

    const WrappedComponent = withInitialProps(Component, getInitialProps);

    expect(WrappedComponent).toBeDefined();
    expect(WrappedComponent.getInitialProps).toBeDefined();

    await WrappedComponent.getInitialProps('the-cid', fakeNextContext, { name: 'world' });

    expect(getInitialPropsBeingCalled).toBe(1);

    render(<WrappedComponent cid="the-cid" />, dom);

    expect(componentBeingRendered).toBe(1);

    const divDom = document.getElementById('component-data') as HTMLDivElement;
    expect(divDom.innerHTML).toBe('hello world');

    const scriptDom = document.getElementsByTagName('script')[0];
    expect(scriptDom.innerHTML).toBe('');
  });

  it('throws an exception when getInitialProps is not called.', async () => {
    const theWindow = (window as any) as WindowWithComponentData;
    theWindow.__COMPONENT_DATA__ = undefined;

    document.body.innerHTML = `<div id="app"></div>`;

    const dom = document.getElementById('app') as HTMLDivElement;
    expect(dom).not.toBeNull();

    let componentBeingRendered = 0;
    const Component = ({ data }: { data: string }) => {
      componentBeingRendered++;
      expect(data).toBe('hello world');
      return <div id="component-data">{data}</div>;
    };

    let getInitialPropsBeingCalled = 0;
    let getInitialProps: (ctx: any, { name }: { name: string }) => Promise<{ data: string }>;
    getInitialProps = async (ctx: any, { name }: { name: string }) => {
      getInitialPropsBeingCalled++;
      expect(name).toBe('world');
      return { data: `hello ${name}` };
    };

    const WrappedComponent = withInitialProps(Component, getInitialProps);
    expect(getInitialPropsBeingCalled).toBe(0);

    const originalError = console.error;
    console.error = jest.fn();
    let exceptionThrown = false;
    try {
      render(<WrappedComponent cid="the-cid" />, dom);
    } catch (ex) {
      exceptionThrown = true;
      expect(ex.toString()).toBe(
        'Error: Component is rendered without its getInitialProps being called.'
      );
    }
    console.error = originalError;

    expect(exceptionThrown).toBe(true);
  });

  it('hydrates wrongly if component data is undefined.', async () => {
    const ssrHtml = `<div id="component-data">hello world</div><script>window.__COMPONENT_DATA__ = window.__COMPONENT_DATA__ || {};
window.__COMPONENT_DATA__["the-cid"] = {"data":"hello world"}</script>`;

    // By directly setting innerHTML, the script tag won't be executed.
    const theWindow = (window as any) as WindowWithComponentData;
    theWindow.__COMPONENT_DATA__ = undefined;

    document.body.innerHTML = `<div id="app">${ssrHtml}</div>`;

    const dom = document.getElementById('app') as HTMLDivElement;
    expect(dom).not.toBeNull();

    let componentBeingRendered = 0;
    const Component = ({ data }: { data: string }) => {
      componentBeingRendered++;
      expect(data).toBe('hello world');
      return <div id="component-data">{data}</div>;
    };

    let getInitialPropsBeingCalled = 0;
    let getInitialProps: (ctx: any, { name }: { name: string }) => Promise<{ data: string }>;
    getInitialProps = async (ctx: any, { name }: { name: string }) => {
      getInitialPropsBeingCalled++;
      return { data: `hello ${name}` };
    };

    const WrappedComponent = withInitialProps(Component, getInitialProps);

    expect(WrappedComponent).toBeDefined();
    expect(WrappedComponent.getInitialProps).toBeDefined();

    expect(getInitialPropsBeingCalled).toBe(0);

    const originalError = console.error;
    console.error = jest.fn();
    let exceptionThrown = false;
    try {
      hydrate(<WrappedComponent cid="the-cid" />, dom);
    } catch (ex) {
      exceptionThrown = true;
      expect(ex.toString()).toBe(
        'Error: Component is rendered without its getInitialProps being called.'
      );
    }
    console.error = originalError;

    expect(exceptionThrown).toBe(true);
  });

  it('hydrates wrongly if component data is corrupted.', async () => {
    const ssrHtml = `<div id="component-data">hello world</div><script>window.__COMPONENT_DATA__ = window.__COMPONENT_DATA__ || {};
window.__COMPONENT_DATA__["the-cid"] = {"data":"hello world"}</script>`;

    // By directly setting innerHTML, the script tag won't be executed.
    const theWindow = (window as any) as WindowWithComponentData;
    theWindow.__COMPONENT_DATA__ = {};
    theWindow.__COMPONENT_DATA__['the-cid'] = undefined;

    document.body.innerHTML = `<div id="app">${ssrHtml}</div>`;

    const dom = document.getElementById('app') as HTMLDivElement;
    expect(dom).not.toBeNull();

    let componentBeingRendered = 0;
    const Component = ({ data }: { data: string }) => {
      componentBeingRendered++;
      expect(data).toBeUndefined();
      return <div id="component-data">{data}</div>;
    };

    let getInitialPropsBeingCalled = 0;
    let getInitialProps: (ctx: any, { name }: { name: string }) => Promise<{ data: string }>;
    getInitialProps = async (ctx: any, { name }: { name: string }) => {
      getInitialPropsBeingCalled++;
      return { data: `hello ${name}` };
    };

    const WrappedComponent = withInitialProps(Component, getInitialProps);

    expect(WrappedComponent).toBeDefined();
    expect(WrappedComponent.getInitialProps).toBeDefined();

    expect(getInitialPropsBeingCalled).toBe(0);

    const originalError = console.error;
    console.error = jest.fn();
    hydrate(<WrappedComponent cid="the-cid" />, dom);
    console.error = originalError;
  });
});
