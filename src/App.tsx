import { LoginBox } from '@/components/LoginBox';
import { MessageList } from '@/components/MessageList';

import styles from './App.module.scss';
import { SendMessageForm } from './components/SendMessageForm';
import { useAuth } from './contexts/auth';

export function App() {
  const { user, loading } = useAuth();

  return (
    <main
      className={`${styles.contentWrapper} ${user ? styles.contentSigned : ''}`}
    >
      <MessageList />
      {!loading ? <>{user ? <SendMessageForm /> : <LoginBox />}</> : <div />}
    </main>
  );
}
