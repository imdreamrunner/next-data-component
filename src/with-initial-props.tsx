import { NextPageContext } from 'next';
import * as React from 'react';

type Omit<T, K> = Pick<T, Exclude<keyof T, K>>;
type Subtract<T, K> = Omit<T, keyof K>;

/**
 * D: Dependencies
 * PD: Produced data
 */
export interface NextDataComponent<D, PD> {
  getInitialProps: (cid: string, ctx: NextPageContext, deps: D) => Promise<PD>;
}

/**
 * D: Dependencies
 * PD: Produced data
 */
export type ComponentInitialPropsFunction<D, PD> = (ctx: NextPageContext, deps: D) => Promise<PD>;

export interface DataComponentProps {
  cid: string;
}

function generateServerSideHtml(cid: string, initialProps: any): string {
  return `window.__COMPONENT_DATA__ = window.__COMPONENT_DATA__ || {};
window.__COMPONENT_DATA__["${cid}"] = ${JSON.stringify(initialProps)}`;
}

/**
 * P: Properties
 * D: Dependencies
 * PD: Produced data
 */
export default function withInitialProps<P, D, PD>(
  Component: React.ComponentType<P>,
  getInitialProps: ComponentInitialPropsFunction<D, PD>
): React.ComponentType<Subtract<P, PD> & DataComponentProps> & NextDataComponent<D, PD> {
  let getInitialPropsExecuted = false;
  let producedProps: PD | null = null;

  const ComponentWithInitialProps: React.ComponentType<Subtract<P, PD> & DataComponentProps> &
    NextDataComponent<D, PD> = (props: Subtract<P, PD> & DataComponentProps) => {
    if (!getInitialPropsExecuted) {
      // This branch will only be executed when the getInitialProps is executed in server
      // and the component is being hydrated in client.
      // If the getInitialProps is executed in browser, it doesn't go here.
      if (
        typeof window === 'undefined' ||
        (typeof (window as any).__COMPONENT_DATA__ !== 'object' ||
          !(window as any).__COMPONENT_DATA__.hasOwnProperty(props.cid))
      ) {
        throw new Error('Component is rendered without its getInitialProps being called.');
      }
      producedProps = (window as any).__COMPONENT_DATA__[props.cid];
    }

    const scriptTagHtml =
      getInitialPropsExecuted && typeof window === 'undefined'
        ? generateServerSideHtml(props.cid, producedProps)
        : '';

    const data = (
      <script
        suppressHydrationWarning={true}
        dangerouslySetInnerHTML={{
          __html: scriptTagHtml
        }}
      />
    );
    return (
      <>
        <Component {...(props as any)} {...(producedProps || {})} />
        {data}
      </>
    );
  };

  ComponentWithInitialProps.getInitialProps = async (
    cid: string,
    ctx: NextPageContext,
    deps: D
  ) => {
    getInitialPropsExecuted = true;
    producedProps = await getInitialProps(ctx, deps);
    if (typeof window !== 'undefined') {
      (window as any).__COMPONENT_DATA__ = (window as any).__COMPONENT_DATA__ || {};
      (window as any).__COMPONENT_DATA__[cid] = producedProps;
    }
    return producedProps;
  };
  return ComponentWithInitialProps;
}
