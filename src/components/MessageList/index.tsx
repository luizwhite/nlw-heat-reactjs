import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';

import { api } from '@/services/api';

import logoImg from '@/assets/logo.svg';

import styles from './styles.module.scss';

interface IMessage {
  id: string;
  text: string;
  user: {
    name: string;
    avatar_url: string;
  };
}

const messagesQueue: IMessage[] = [];

const socket = io('http://localhost:4000');
socket.on('new_message', (msg: IMessage) => messagesQueue.push(msg));

export function MessageList() {
  const [messages, setMessages] = useState<IMessage[]>([]);

  useEffect(() => {
    const timer = setInterval(() => {
      if (messagesQueue.length > 0) {
        setMessages((prevState) =>
          [messagesQueue[0], prevState[0], prevState[1]].filter(Boolean),
        );

        messagesQueue.shift();
      }
    }, 3000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    api.get<IMessage[]>('messages/last3').then(({ data }) => setMessages(data));
  }, []);

  return (
    <div className={styles.messageListWrapper}>
      <img src={logoImg} alt="DoWhile 2021" />

      <ul className={styles.messageList}>
        {messages.map(({ id, text, user }) => (
          <li key={id} className={styles.message}>
            <p className={styles.messageContent}>{text}</p>
            <div className={styles.messageUser}>
              <div className={styles.userImage}>
                <img src={user.avatar_url} alt={user.name} />
              </div>
              <span>{user.name}</span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
