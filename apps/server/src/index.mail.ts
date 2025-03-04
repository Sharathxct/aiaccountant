import express from 'express';
import dotenv from 'dotenv';
import Imap from 'imap'; // if an error occur check for ImapMessage

import { simpleParser } from 'mailparser';

const app = express();
const port = 3000;
dotenv.config();

// IMAP Configuration (replace placeholders with your actual credentials)
const imapConfig: Imap.Config = {
  user: 'autoinvoice.billing@gmail.com',
  password: 'vzafpkluewtnqpab', 
  host: 'imap.gmail.com',
  port: 993,
  tls: true,
  tlsOptions: { rejectUnauthorized: false },
};

function startEmailListener(): void {
  const imap = new Imap(imapConfig);

  imap.once('ready', () => {
    imap.openBox('INBOX', false, (err: Error | null, box) => {
      if (err) {
        console.error('Error opening mailbox:', err);
        return;
      }

      console.log('Listening for new emails...');

      // Fetch unseen emails initially
      fetchUnseenEmails(imap);

      // Listen for new emails dynamically
      imap.on('mail', (numNewMsgs: number) => {
        console.log(`🔔 New email detected! Fetching latest (${numNewMsgs})...`);
        fetchUnseenEmails(imap);
      });
    });
  });

  imap.once('error', (err: Error) => {
    console.error('IMAP Connection Error:', err);
  });

  imap.once('end', () => {
    console.log('IMAP Connection Ended');
  });

  imap.connect();
}

// Fetch only UNSEEN emails
function fetchUnseenEmails(imap: Imap): void {
  imap.search(['UNSEEN'], (err: Error | null, results: number[]) => {
    if (err) {
      console.error('Search error:', err);
      return;
    }

    if (!results.length) {
      console.log('📭 No new unread emails.');
      return;
    }

    const fetch = imap.fetch(results, { bodies: '', markSeen: true });

    fetch.on('message', (msg) => {
      msg.on('body', (stream: NodeJS.ReadableStream) => {
        //@ts-ignore
        simpleParser(stream, (parseErr: Error | null, parsed: any) => { // Adjust 'any' based on mailparser's output type
          if (parseErr) {
            console.error('Error parsing email:', parseErr);
            return;
          }

          console.log('--- 📩 New Email Received ---');
          console.log('📧 From:', parsed.from?.text || 'Unknown');
          console.log('📌 Subject:', parsed.subject || 'No Subject');
          console.log('📝 Text Body:', parsed.text || 'No Body');
          console.log('--------------------------------');

          // Process parsed email here (e.g., generate invoice)
        });
      });
    });

    fetch.once('error', (fetchErr: Error) => {
      console.error('Fetch error:', fetchErr);
    });
  });
}

app.get('/', (req: express.Request, res: express.Response) => {
  res.send('IMAP Email Listener is running');
});

app.listen(port, () => {
  console.log(`🚀 Express server running on port ${port}`);
  startEmailListener();
});