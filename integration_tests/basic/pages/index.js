import Link from 'next/link';
import Welcome from '../components/Welcome';

const Index = () => (
  <div>
    <Welcome cid="welcome-component" />
    <Link href="/about">
      <a id="link-to-about">About</a>
    </Link>
  </div>
);

Index.getInitialProps = async ctx => {
  const name = 'world';
  await Welcome.getInitialProps('welcome-component', ctx, { name });
  const otherData = 'data';
  return { otherData };
};

export default Index;
