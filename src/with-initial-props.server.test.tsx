import { JSDOM } from 'jsdom';
import { NextPageContext } from 'next';
import * as React from 'react';
import { renderToString } from 'react-dom/server';
import withInitialProps from './with-initial-props';

const DOM = new JSDOM();
const fakeNextContext = {} as NextPageContext;

describe('test withInitialProps in server', () => {
  it('renders HTML correctly', async () => {
    expect(withInitialProps).toBeDefined();

    let componentBeingRendered = 0;
    const Component = ({ data }: { data: string }) => {
      componentBeingRendered++;
      return <div id="component-data">{data}</div>;
    };

    let getInitialPropsBeingCalled = 0;
    const getInitialProps = async (ctx: any, { name }: { name: string }) => {
      getInitialPropsBeingCalled++;
      expect(name).toBe('world');
      return { data: `hello ${name}` };
    };

    const WrappedComponent = withInitialProps(Component, getInitialProps);

    expect(WrappedComponent).toBeDefined();
    expect(WrappedComponent.getInitialProps).toBeDefined();

    await WrappedComponent.getInitialProps('the-cid', fakeNextContext, { name: 'world' });
    expect(getInitialPropsBeingCalled).toBe(1);

    const ssrHtml = renderToString(<WrappedComponent cid="the-cid" />);
    expect(componentBeingRendered).toBe(1);

    const parser = new DOM.window.DOMParser();
    const htmlDoc = parser.parseFromString(ssrHtml, 'text/html');

    const divDom = htmlDoc.getElementById('component-data') as HTMLDivElement;
    expect(divDom.innerHTML).toBe('hello world');

    const scriptDom = htmlDoc.getElementsByTagName('script')[0];
    const scriptFunction = Function('window', scriptDom.innerHTML);
    scriptFunction(DOM.window);

    const componentData = (DOM.window as any).__COMPONENT_DATA__;
    expect(componentData).toBeDefined();
    expect(componentData['the-cid'].data).toBe('hello world');
  });

  it('throws an exception when getInitialProps is not called.', async () => {
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
      renderToString(<WrappedComponent cid="the-cid" />);
    } catch (ex) {
      exceptionThrown = true;
      expect(ex.toString()).toBe(
        'Error: Component is rendered without its getInitialProps being called.'
      );
    }
    console.error = originalError;

    expect(exceptionThrown).toBe(true);
  });
});
