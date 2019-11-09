import withInitialProps from 'next-data-component';

const Welcome = ({ welcome }) => <div id="welcome-message">{welcome}</div>;

const getInitialProps = async (ctx, { name }) => {
  return {
    welcome: `Hello ${name} from ${typeof window === 'undefined' ? 'server' : 'browser'}`
  };
};

export default withInitialProps(Welcome, getInitialProps);
